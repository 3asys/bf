const crypto = require('crypto');
var str = "BlockChain";
var result = crypto.createHash("md5").update(str).digest("hex");
console.log("str: " + str + ", result:" + result);
