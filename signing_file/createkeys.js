const crypto = require('crypto');
const secp256k1 = require('secp256k1');
var fs = require('fs');

	// Создание приватного ключа:
	let privateKey;
	do {  
		privateKey = crypto.randomBytes(32);  
		console.log("try: " + privateKey);
	} while (!secp256k1.privateKeyVerify(privateKey)); 
	// Записываем приватный ключ в файл:
	let privatkeyfilename = 'keys/alex_pr.key';
	fs.appendFile(privatkeyfilename, privateKey, function (err) {
	  if (err) throw err;
	  console.log('Saved!');
	});
	// Создание публичного ключа:
	const publicKey = secp256k1.publicKeyCreate(privateKey);
	// Записываем публичный ключ в файл:
	let publickeyfilename = 'keys/alex_pu.key';
	fs.appendFile(publickeyfilename, publicKey, function (err) {
	  if (err) throw err;
	  console.log('Saved!');
	});
	console.log('New keypair:  publicKey: ' + publicKey.toString("hex") + ' privateKey: ' + privateKey.toString("hex"));