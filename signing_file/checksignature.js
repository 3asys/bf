var http = require('http');
var formidable = require('formidable');
const crypto = require('crypto');
const secp256k1 = require('secp256k1');
var fs = require('fs');
// Проверка электронной подписи:
http.createServer(function (req, res) {
  if (req.url == '/fileupload') { // Если выполняется action="fileupload" 
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
		// Выбираем файл документа:
		var upfile1 = files.filetoupload.name;
		// Превращаем файл в строку:
		var text1 = fs.readFileSync(upfile1,'utf8');
		// Вычисляем хэш файла:
		const digested = crypto.createHash("sha256").update(text1).digest();
		// Находим название файла его электронной подписи:
		var sigfile1 = files.filetoupload.name + '.sig';
		// Читаем из файла электронной подписи электронную подпись:
		fs.readFile(sigfile1, function(err, data) {
			if (err) throw err;
			const signature1 = data;
			console.log(signature1);
			// Получаем публичный ключ:
			fs.readFile('keys/alex_pu.key', function(err, data) {
				if (err) throw err;
				const publicKey = data;
				console.log(publicKey);			
				// Производим проверку электронной подписи:
				let verified = secp256k1.verify(digested, signature1, publicKey); 
				if(verified){
					console.log("signature is correct :)");
					res.write("signature is correct :)");
					res.end();					
				} else {
					console.log("signature is incorrect :(");
					res.write("signature is incorrect :(");
					res.end();					
				}
			});
		});		

    });	  
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit" value="Check Signature">');
    res.write('</form>');
    return res.end();
  }
}).listen(8080);