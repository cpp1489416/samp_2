
const rsa_key = require('./rsa_key')
const eth_cache = require('./eth_cache')

const eth_map = {
  map: new Map(),
  async put_md5(file_name, md5) {
    const sec = rsa_key.encryptPrivate(md5, 'base64', 'utf8');
    this.map.set(file_name, rsa_key.encryptPrivate(md5, 'base64', 'utf8'))
    await eth_cache.set('addFileTag', file_name, sec)
  },
  async match_file(file_name, md5) {
    console.log(this.map.get(file_name))
    // let decryptData = rsa_key.decryptPublic(this.map.get(file_name), 'utf8');
    let decryptData = await eth_cache.get('getFileTag', file_name)
    decryptData = rsa_key.decryptPublic(decryptData, 'utf8');
    console.log(decryptData + '周少赤壁市')
    return decryptData == md5
  }
}

module.exports = eth_map