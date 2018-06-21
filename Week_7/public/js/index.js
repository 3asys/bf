let myContractInstance;
window.addEventListener('load', function() {
	///@dev Проверяем, что Metamask установлен:
	if (typeof web3 !== 'undefined') { // Библиотека web3 определена - Metamask установлен
		///@dev Проверяем, что Metamask разблокирован (массив счетов не пустой):
		///@dev Используем асинхронный метод (web3.eth.getAccounts) вызова свойства "счета (accounts)"
		///@dev https://github.com/MetaMask/metamask-extension/issues/1766
		///@dev Это свойство только для чтения и возвращает список счетов
		///@dev https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethaccounts
		web3.eth.getAccounts(function (err, accounts) { 
			if (accounts.length == 0) { // Массив счетов пустой - значит Metamask не разблокирован
				alert('Unlock MetaMask to avoid errors while working with this application. Click on MetaMask icon in your browser extensions panel, enter your password and unlock your MetaMask wallet.');  
			} else { // Массив счетов не пуст - Metamask разблокирован
				alert('Your browser rady to work with Metamask');		
			}
		});
	} else { // Библиотека web3 не определена - Metamask не установлен
		alert('First of all you need to register and install Metamask.');
	}

	// Сохраняем JSON ABI смарт-контракта:
	const abi = [{"constant":true,"inputs":[{"name":"_ticketNum","type":"uint256"}],"name":"getPlace","outputs":[{"name":"pPlace","type":"uint256"},{"name":"pRow","type":"uint256"},{"name":"pRegion","type":"uint256"},{"name":"pSessionNum","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"purchasing","outputs":[{"name":"buyer","type":"address"},{"name":"ticketNum","type":"uint256"},{"name":"place","type":"uint256"},{"name":"row","type":"uint256"},{"name":"region","type":"uint256"},{"name":"sessionNum","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"}],"name":"newOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getPurchasedTicketsNum","outputs":[{"name":"pTicketNum","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"confirmOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_place","type":"uint256"},{"name":"_row","type":"uint256"},{"name":"_region","type":"uint256"},{"name":"_sessionNum","type":"uint256"}],"name":"getTicket","outputs":[{"name":"numOfTicket","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];
	// Указываем адрес контракта:
	const contractAddress = "0x77d3537c9546F84923ab3bdbf582C3069Ae0aB8F";
	// Получаем контракт:
	//var contractInstance = web3.eth.contract(contractABI).at(contractAddress);
	let MyContract = web3.eth.contract(abi);
	myContractInstance = MyContract.at(contractAddress);
	web3.eth.defaultAccount = web3.eth.accounts[0];
});

async function getTicket(){
	let place = parseInt(document.getElementById('place').value);
	let row = parseInt(document.getElementById('row').value);
	let region = parseInt(document.getElementById('region').value);
	let sessionNum = parseInt(document.getElementById('sessionNum').value);

	await myContractInstance.getTicket(place, row, region, sessionNum, 
		{
			gas: 320000,
			value: web3.toWei(10, "finney")
		}, 
		function(error, result) {
			if(!error)
				document.getElementById('ticketNum').value = result;
			else
				console.error(error);
		}
	);
}

async function getPlace(){
	let ticketNum = parseInt(document.getElementById('ticketNum').value);
	await myContractInstance.getPlace(ticketNum,
		{
			gas: 320000
		},		
		function(error, result) { 
			if(!error)
				document.getElementById('placeParam').value = result;
			else 
				console.error(error);
		}	
	);
}

async function getPurchasedTicketsNum(){
	await myContractInstance.getPurchasedTicketsNum(
		{
			gas: 320000
		},		
		function(error, result) { 
			if(!error)
				document.getElementById('PurchasedTicketsNum').value = result;
			else 
				console.error(error);
		}
	);
}