let myContractInstance;
window.addEventListener('load', function() {
	//@dev Проверяем, что Metamask установлен:
	if (typeof web3 !== 'undefined') { // Библиотека web3 определена - Metamask установлен
		//@dev Проверяем, что Metamask разблокирован (массив счетов не пустой):
		//@dev Используем асинхронный метод (web3.eth.getAccounts) вызова свойства "счета (accounts)"
		//@dev https://github.com/MetaMask/metamask-extension/issues/1766
		//@dev Это свойство только для чтения и возвращает список счетов
		//@dev https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethaccounts
		web3.eth.getAccounts(function (err, accounts) { 
			if (accounts.length == 0) { // Массив счетов пустой - значит Metamask не разблокирован
				alert('Unlock MetaMask to avoid errors while working with this application. Click on MetaMask icon in your browser extensions panel, enter your password and unlock your MetaMask wallet.');  
			} else { // Массив счетов не пуст - Metamask разблокирован
				//Ничего не показываем// alert('Your browser ready to work with Metamask');	
			}
		});
	} else { // Библиотека web3 не определена - Metamask не установлен
		alert('First of all you need to register and install Metamask.');
	}

	// Сохраняем JSON ABI смарт-контракта:
	const abi = [{"constant":true,"inputs":[{"name":"_ticketNum","type":"bytes32"}],"name":"verifeTicketPrice","outputs":[{"name":"isticketPrice","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_ticketPrice","type":"uint256"}],"name":"setTicketPrice","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"purchasing","outputs":[{"name":"buyer","type":"address"},{"name":"buydatetime","type":"uint256"},{"name":"place","type":"uint256"},{"name":"row","type":"uint256"},{"name":"region","type":"uint256"},{"name":"sessionNum","type":"uint256"},{"name":"ticketprice","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_ticketNum","type":"bytes32"}],"name":"getPlace","outputs":[{"name":"pPlace","type":"uint256"},{"name":"pRow","type":"uint256"},{"name":"pRegion","type":"uint256"},{"name":"pSessionNum","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"}],"name":"newOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"ticketPlace","outputs":[{"name":"buyer","type":"address"},{"name":"buydatetime","type":"uint256"},{"name":"place","type":"uint256"},{"name":"row","type":"uint256"},{"name":"region","type":"uint256"},{"name":"sessionNum","type":"uint256"},{"name":"ticketprice","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getPurchasedTicketsNum","outputs":[{"name":"pTicketNum","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"confirmOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_place","type":"uint256"},{"name":"_row","type":"uint256"},{"name":"_region","type":"uint256"},{"name":"_sessionNum","type":"uint256"}],"name":"getTicket","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"getCurrentTicketPrice","outputs":[{"name":"currentTicketPrice","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"ticketNum","type":"bytes32"}],"name":"getTicketNum","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"candidate","type":"address"}],"name":"setCandidate","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"}],"name":"setNewOwner","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"newPrice","type":"uint256"}],"name":"setNewPrice","type":"event"}];
	// Указываем адрес контракта:
	const contractAddress = "0x47CE5D27e7a6E8f106b365964a6AD59e9b80AfC0";
	// Получаем контракт:
	//var contractInstance = web3.eth.contract(contractABI).at(contractAddress);
	let MyContract = web3.eth.contract(abi);
	myContractInstance = MyContract.at(contractAddress);
	web3.eth.defaultAccount = web3.eth.accounts[0];
	// Сохраняем событие getTicketNum контракта, представленного переменной myContractInstance, в переменную getTicketNumEvent
	let getTicketNumEvent = myContractInstance.getTicketNum();
	let eventsetCandidate = myContractInstance.setCandidate();
	let eventsetNewOwner = myContractInstance.setNewOwner();
	let eventsetNewPrice = myContractInstance.setNewPrice();
	// Наблюдаем за событиями:
	getTicketNumEvent.watch(function(error, result){
		if (!error)
		{
			// При возникновении события, выводим аргумент ticketNum из массива аргументов args лога исполнения контракта:
			document.getElementById('ticketNum').value = result.args.ticketNum.toString()
		} else {
			console.log('Error in myEvent event handler: ' + error);
		}
	});
	
	eventsetCandidate.watch(function(error, result){
		if (!error)
		{
			// При возникновении события, выводим аргумент candidate из массива аргументов args лога исполнения контракта:
			document.getElementById('candidateAddressResult').value = result.args.candidate.toString()
		} else {
			console.log('Error in myEvent event handler: ' + error);
		}
	});	

	eventsetNewOwner.watch(function(error, result){
		if (!error)
		{
			// При возникновении события, выводим аргумент owner из массива аргументов args лога исполнения контракта:
			document.getElementById('newOwner').value = result.args.owner.toString()
			document.getElementById('currentOwner').value = result.args.owner.toString()
		} else {
			console.log('Error in myEvent event handler: ' + error);
		}
	});

	eventsetNewPrice.watch(function(error, result){
		if (!error)
		{
			// При возникновении события, выводим аргумент newPrice из массива аргументов args лога исполнения контракта:
			document.getElementById('currentTicketPrice').value = result.args.newPrice.toString() + ' wei'
		} else {
			console.log('Error in myEvent event handler: ' + error);
		}
	});
	
	getCurrentTicketPrice();
	getCurrentOwner();
});

function getCurrentOwner(){
	// Получаем доступ к public переменной owner контракта:
	myContractInstance.owner(function(err, res){
		document.getElementById('currentOwner').value = res;
	});
}

async function newOwner() {
	newOwnerAddress = document.getElementById('candidateAddress').value;
	await myContractInstance.newOwner(newOwnerAddress, 
		{
			gas: 320000
		}, 
		function(error, result) {
			if(!error) console.log(result);
			else console.error(error);
		}
	);	
}

async function confirmOwner() {
	await myContractInstance.confirmOwner(
		{
			gas: 320000
		}, 
		function(error, result) {
			if(!error) console.log(result);
			else console.error(error);
		}
	);	
}

async function getCurrentTicketPrice(){
	await myContractInstance.getCurrentTicketPrice(
		function(error, result) {
			if(!error) document.getElementById('currentTicketPrice').value = result + ' wei'
			else console.error(error);
		}
	);	
}

async function setTicketPrice(){
	let resultTicketPrice;
	let newTicketPrice = document.getElementById('newTicketPrice').value;
	let newTicketUnit = document.getElementById('prices_unit').value;
	switch (newTicketUnit) {
		case "ether":
			resultTicketPrice = newTicketPrice * Math.pow(10, 18);
			break;
		case "finney":
			resultTicketPrice = newTicketPrice * Math.pow(10, 15);
			break;		
		case "szabo":
			resultTicketPrice = newTicketPrice * Math.pow(10, 12);
			break;			
		case "Gwei":
			resultTicketPrice = newTicketPrice * Math.pow(10, 9);
			break;		
		case "Mwei":
			resultTicketPrice = newTicketPrice * Math.pow(10, 6);
			break;			
		case "Kwei":
			resultTicketPrice = newTicketPrice * Math.pow(10, 3);
			break;			
		case "wei":
			resultTicketPrice = newTicketPrice;
			break;		
	}
	//alert(resultTicketPrice);	
	await myContractInstance.setTicketPrice(resultTicketPrice, 
		{
			gas: 320000
		}, 
		function(error, result) {
			if(!error) console.log(result);
			else console.error(error);
		}
	);
}

async function verifeTicketPrice(){
	verifingTicketPrice = document.getElementById('verifingTicketNum').value;
	await myContractInstance.verifeTicketPrice(verifingTicketPrice,
		function(error, result) {
			if(!error) document.getElementById('ticketPrice').value = result + ' wei'
			else console.error(error);
		}
	);	
}

async function getTicket(){
	let place = parseInt(document.getElementById('place').value);
	let row = parseInt(document.getElementById('row').value);
	let region = parseInt(document.getElementById('region').value);
	let sessionNum = parseInt(document.getElementById('sessionNum').value);

	let prc = document.getElementById('currentTicketPrice').value;
	let priceValue = parseInt(prc.slice(0, prc.indexOf(" ")), 10); // Отсекаем wei (в конце) и преобразуем первую часть строки в integer.

	await myContractInstance.getTicket(place, row, region, sessionNum, 
		{
			gas: 321000,
			gasPrice: 10000000000,
			value: priceValue
		}, 
		function(error, result) {
			if(!error) console.log(result)
			else console.error(error);
		}
	);	
}

async function getPlace(){
	let testTicketNum = parseInt(document.getElementById('testTicketNum').value);
	await myContractInstance.getPlace(testTicketNum,
		function(error, result) {
			if(!error)
			{
				let pPlace = result[0];
				let pRow = result[1];
				let pRegion = result[2];
				let pSessionNum = result[3];
				let rslt = "Ряд: " + pRow + " Место: " + pPlace + " Сектор: " + pRegion + " Сеанс: " + pSessionNum;
				document.getElementById('placeParam').value = rslt;
			} else {
				console.error(error);
			}
		}	
	);
}

async function getPurchasedTicketsNum(){
	await myContractInstance.getPurchasedTicketsNum(		
		function(error, result) { 
			if(!error)
				document.getElementById('PurchasedTicketsNum').value = result;
			else 
				console.error(error);
		}
	);
}