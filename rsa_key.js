var fs = require('fs');
const NodeRSA = require('node-rsa')

var public_key = fs.readFileSync('./rsa_public.key', "utf8");
var private_key = fs.readFileSync('./rsa_private.key', "utf8");

const key = new NodeRSA()

key.importKey(public_key, 'public')
key.importKey(private_key, 'private')


module.exports = key
