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
		// Записываем электронную подпись в файл:
		var hashedfilename = upfile1+'.hash';
		fs.appendFile(hashedfilename, digested.toString("hex"), function (err) {
			if (err) throw err;
		});
		res.write('File '+ files.filetoupload.name + ' is hashed');
		res.end();
    });	  
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit" value="Calculate Hash of Selected File">');
    res.write('</form>');
    return res.end();
  }
}).listen(8080);