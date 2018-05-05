'use strict';
var CryptoJS = require("crypto-js");
var express = require("express");
var bodyParser = require('body-parser');
var WebSocket = require("ws");

// Описываем состав блока:
class Block {
	constructor (index, previousHash, timestamp, data, nonce, hash){
		this.index = index;
		this.previousHash = previousHash.toString();
		this.timestamp = timestamp;
		this.data = data;
		this.nonce = 0;
		this.hash = hash.toString();
	}
}

// Структуры:
// Список сокетов для соединения с нодами:
var sockets = [];
var MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

// Создание первого блока:
function getGenesisBlock(){
	return new Block(0, "0", 1465154705, "my genesis block!!", 0, calculateHash(0, "0", 1465154705, "my genesis block!!", 0));
}

// Блокчейн:
var blockchain = [getGenesisBlock()];

// Проверка блока:
function isValidNewBlock(newBlock, previousBlock){
	// Проверяем, что номер блока имеет следующий номер после предыдущего:
	if(previousBlock.index + 1 !== newBlock.index){
		console.log('invalid index')
		return false;
	} else if(previousBlock.hash !== newBlock.previousHash){ 
		// Проверяем, что хэш предыдущего блока = заложенному в блок 
		// хешу предыдущего блока
		console.log('invalid previous hash')
		return false;		
	} else if(calculateHashForBlock(newBlock) !== newBlock.hash){
		// Проверяем, что хэш нового блока вычислен правильно 
		// (вычисляем заново и сравниваем с тем, что записано в блоке)
		console.log('invalid hash')
		return false;
	} else if(newBlock.hash.slice(0,2) != '00'){
		// Проверяем, что первый знак в хэше меньше 8 (в 16-ричной системе): 
		var nonce = 0;
		while(newBlock.hash.slice(0,2) != '00') {
			newBlock.hash = calculateHash(newBlock.index, previousBlock.hash, newBlock.timestamp, newBlock.data, newBlock.nonce);
			newBlock.nonce ++;
		}
		console.log('у блока ' + newBlock.index + ' nonce: ' + newBlock.nonce);
	}
	return true;
}

// Вычисление хэша блока:
function calculateHashForBlock(block){
	return calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.nonce);
}

// Вычисление хеша данных:
function calculateHash(index, previousHash, timestamp, data, nonce){
	return CryptoJS.SHA256(index + previousHash + timestamp + data + nonce).toString();
}

// Получение последнего блока:
function getLatestBlock(){
	return blockchain[blockchain.length - 1];
}

// Создание нового блока:
function generateNextBlock(blockData){
    var previousBlock = getLatestBlock();
    var nextIndex = previousBlock.index + 1;
    var nextTimestamp = new Date().getTime() / 1000;
	var nextNonce = 0;
    var nextHash = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextNonce);
    return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextNonce, nextHash);
}

// Проверка валидности блокчейна:
var isValidChain = (blockchainToValidate) => {
	// Проверяем, что первый элемент блокчейна, это генезис-блок:
    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(getGenesisBlock())) {
        return false;
    }
	// Проверяем валидность каждого блока в блокчейне:
    var tempBlocks = [blockchainToValidate[0]];
    for (var i = 1; i < blockchainToValidate.length; i++) {
        if (isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
            tempBlocks.push(blockchainToValidate[i]);
        } else {
            return false;
        }
    }
    return true;
};

// Замена одной цепочки другой:
var replaceChain = (newBlocks) => {
    if (isValidChain(newBlocks) && newBlocks.length > blockchain.length) {
		// Если новая цепочка валидна И длина новой цепочки > длины текущего блокчейна, то:
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockchain = newBlocks;
        broadcast(responseLatestMsg());
    } else {
        console.log('Received blockchain invalid');
    }
};

// Добавить блок:
function addBlock(newBlock){
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        blockchain.push(newBlock);
    }
};

// При получении от кого-то нового блока:
var handleBlockchainResponse = (message) => {
    var receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    var latestBlockHeld = getLatestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            console.log("We can append the received block to our chain");
            blockchain.push(latestBlockReceived);
            broadcast(responseLatestMsg());
        } else if (receivedBlocks.length === 1) {
            console.log("We have to query the chain from our peer");
            broadcast(queryAllMsg());
        } else {
            console.log("Received blockchain is longer than current blockchain");
            replaceChain(receivedBlocks);
        }
    } else {
        console.log('received blockchain is not longer than current blockchain. Do nothing');
    }
};

// Настройки:
var http_port = process.env.HTTP_PORT || 3001;
var p2p_port = process.env.P2P_PORT || 6001;
var initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

// HTTP:
function initHttpServer(){
    var app = express();
    app.use(bodyParser.json());
	// Передача блоков:
    app.get('/blocks', (req, res) => res.send(JSON.stringify(blockchain)));
    app.post('/mineBlock', (req, res) => {
        var newBlock = generateNextBlock(req.body.data);
        addBlock(newBlock); // Майнинг
        broadcast(responseLatestMsg());
        console.log('block added: ' + JSON.stringify(newBlock));
        res.send();
    });
    app.get('/peers', (req, res) => {
        res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
        connectToPeers([req.body.peer]);
        res.send();
    });
    app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
};

function connectToPeers(newPeers){
    newPeers.forEach((peer) => {
        var ws = new WebSocket(peer);
        ws.on('open', () => initConnection(ws));
        ws.on('error', () => {
            console.log('connection failed')
        });
    });
};

// Сокет открывается:
function initConnection(ws){
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
};

// Получаем сообщения от других нод:
function initMessageHandler(ws){
    ws.on('message', (data) => {
        var message = JSON.parse(data);
        console.log('Received message' + JSON.stringify(message));
        switch (message.type) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg());
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                handleBlockchainResponse(message);
                break;
        }
    });
};

function initErrorHandler(ws){
    var closeConnection = (ws) => {
        console.log('connection failed to peer: ' + ws.url);
        sockets.splice(sockets.indexOf(ws), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};

// Поднимаем pir-to-pir сервер:
function initP2PServer(){
    var server = new WebSocket.Server({port: p2p_port});
    server.on('connection', ws => initConnection(ws));
    console.log('listening websocket p2p port on: ' + p2p_port);

};

var queryChainLengthMsg = () => ({'type': MessageType.QUERY_LATEST});
var queryAllMsg = () => ({'type': MessageType.QUERY_ALL});

var responseChainMsg = () =>({
    'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(blockchain)
});
var responseLatestMsg = () => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([getLatestBlock()])
});

// Рассылка:
function broadcast(message){
	sockets.forEach(socket => write(socket, message));
}
function write(ws, message){
	ws.send(JSON.stringify(message));
}

connectToPeers(initialPeers);
initHttpServer();
initP2PServer();