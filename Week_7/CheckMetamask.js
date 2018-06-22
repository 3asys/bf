/***
@notice Проверяем установлен ли Metamask и разблокирован ли он (введен ли пароль)
*/
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
				alert('Your browser rady to work with Metamask');		
			}
		});
	} else { // Библиотека web3 не определена - Metamask не установлен
		alert('First of all you need to register and install Metamask.');
	}

});



