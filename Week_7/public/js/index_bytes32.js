let myContractInstance;
window.addEventListener('load', function() {
	// Проверяем, что Metamask установлен:
	if (typeof web3 !== 'undefined') {
	  web3 = new Web3(web3.currentProvider);
	} else {
		alert('You have to install MetaMask !');
	}

	// Сохраняем JSON ABI смарт-контракта:
	const abi = [
		{
			"constant": false,
			"inputs": [],
			"name": "confirmOwner",
			"outputs": [],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"constant": false,
			"inputs": [
				{
					"name": "_place",
					"type": "uint256"
				},
				{
					"name": "_row",
					"type": "uint256"
				},
				{
					"name": "_region",
					"type": "uint256"
				},
				{
					"name": "_sessionNum",
					"type": "uint256"
				}
			],
			"name": "getTicket",
			"outputs": [
				{
					"name": "",
					"type": "bytes32"
				}
			],
			"payable": true,
			"stateMutability": "payable",
			"type": "function"
		},
		{
			"constant": false,
			"inputs": [
				{
					"name": "_owner",
					"type": "address"
				}
			],
			"name": "newOwner",
			"outputs": [],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"constant": true,
			"inputs": [
				{
					"name": "_ticketNum",
					"type": "bytes32"
				}
			],
			"name": "getPlace",
			"outputs": [
				{
					"name": "",
					"type": "uint256"
				},
				{
					"name": "",
					"type": "uint256"
				},
				{
					"name": "",
					"type": "uint256"
				},
				{
					"name": "",
					"type": "uint256"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function"
		},
		{
			"constant": true,
			"inputs": [],
			"name": "getPurchasedTicketsNum",
			"outputs": [
				{
					"name": "",
					"type": "uint256"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function"
		},
		{
			"constant": true,
			"inputs": [],
			"name": "owner",
			"outputs": [
				{
					"name": "",
					"type": "address"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function"
		},
		{
			"constant": true,
			"inputs": [
				{
					"name": "",
					"type": "uint256"
				}
			],
			"name": "purchasing",
			"outputs": [
				{
					"name": "buyer",
					"type": "address"
				},
				{
					"name": "ticketNum",
					"type": "bytes32"
				},
				{
					"name": "place",
					"type": "uint256"
				},
				{
					"name": "row",
					"type": "uint256"
				},
				{
					"name": "region",
					"type": "uint256"
				},
				{
					"name": "sessionNum",
					"type": "uint256"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function"
		}
	];
	// Указываем адрес контракта:
	const contractAddress = "0x6831a291340E3799A6ebE8df330Bdf07fbc1C959";
	// Получаем контракт:
	//var contractInstance = web3.eth.contract(contractABI).at(contractAddress);
	let MyContract = web3.eth.contract(abi);
	myContractInstance = MyContract.at(contractAddress);
	web3.eth.defaultAccount = web3.eth.accounts[0];
})

function getTicket(){
	let place = parseInt(document.getElementById('place').value);
	let row = parseInt(document.getElementById('row').value);
	let region = parseInt(document.getElementById('region').value);
	let sessionNum = parseInt(document.getElementById('sessionNum').value);

	res1 = myContractInstance.getTicket(place, row, region, sessionNum,
		{
			gas: 320000,
			value: web3.toWei(10, "finney")
		}, 
		function(error, result) { 
			if(!error) console.log(result)
			else console.error(error);
		}
	);
	//let res1 = myContractInstance.getTicket(place, row, region, sessionNum).val();
	//console.log(res1);
	//alert("1");
	/*
	web3.eth.sendTransaction({
		to: contractAddress,
		from: web3.eth.accounts[0],
		data: functionData,
		value: web3.toWei(10, "finney")
	},
		function (error) {
			console.log(error);
		}
	);
	*/
	document.getElementById('ticketNum').value = res1;
}

function getPlace(){
	let ticketNum = parseInt(document.getElementById('ticketNum').value);
	let res2 = myContractInstance.getPlace(ticketNum,
		{
			gas: 320000
		},		
		function(error, result) { 
			if(!error) console.log(result)
			else console.error(error);
		}	
	);
/*
	web3.eth.sendTransaction({
			to:contractAddress,
			from:web3.eth.accounts[0]
		},
		function(error, response){
			console.log(response);
		});		
*/
	document.getElementById('placeParam').value = res2;
}

function getPurchasedTicketsNum(){
	let res3 = myContractInstance.getPurchasedTicketsNum(
		{
			gas: 320000
		},		
		function(error, result) { 
			if(!error) console.log(result)
			else console.error(error);
		}	
	);	
/*
	web3.eth.sendTransaction({
			to:contractAddress,
			from:web3.eth.accounts[0]
		},
		function(error, response){
			console.log(response);
		});	
*/
	document.getElementById('PurchasedTicketsNum').value = res3;
}
