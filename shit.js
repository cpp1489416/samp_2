
const node_rsa = require('node-rsa')

var key = new node_rsa({b: 512}); //生成新的512位长度密钥

var text = 'Hello RSA!'; // 加密前数据
var encrypted = key.encrypt(text, 'base64');  // 加密后数据
console.log('encrypted: ', encrypted);
var decrypted = key.decrypt(encrypted, 'utf8'); // 解密后数据
console.log('decrypted: ', decrypted);

var publicDer = key.exportKey('public');
var privateDer = key.exportKey('private');
console.log('公钥:',publicDer);
console.log('私钥:',privateDer);