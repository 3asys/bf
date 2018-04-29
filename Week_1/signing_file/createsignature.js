var http = require('http');
var formidable = require('formidable');
const crypto = require('crypto');
const secp256k1 = require('secp256k1');
var fs = require('fs');

http.createServer(function (req, res) {
  if (req.url == '/fileupload') { // Если выполняется action="fileupload" 
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
		var upfile1 = files.filetoupload.name;
		// Превращаем файл в строку:
		var text1 = fs.readFileSync(upfile1,'utf8');
		// Вычисляем хэш файла:
		const digested = crypto.createHash("sha256").update(text1).digest();
		// Читаем приватный ключ из файла:
		fs.readFile('keys/alex_pr.key', function(err, data) {
			if (err) throw err;
			const privateKey = data;
			console.log(privateKey);
			// Подписываем хэш приватным ключем:
			const sigObj = secp256k1.sign(digested, privateKey); 
			const sig = sigObj.signature;
			// Записываем электронную подпись в файл:
			var signaturefilename = upfile1+'.sig';
			fs.appendFile(signaturefilename, sig, function (err) {
				if (err) throw err;
			});	
		});		
		res.write('File '+ files.filetoupload.name + ' is signed');
		res.end();
    });	  
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit" value="Subscribe Selected File">');
    res.write('</form>');
    return res.end();
  }
}).listen(8080);

