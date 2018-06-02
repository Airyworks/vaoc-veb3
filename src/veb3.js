import Web3 from 'web3'
import config from './config.js'

class Veb3 {
  constructor () {
    if (typeof web3 !== 'undefined') {
      console.debug(web3.currentProvider)
      this.web3 = new Web3(web3.currentProvider)
    } else {
      this.web3 = new Web3(Web3.givenProvider || config.DEFAULT_PROVIDER)
    }
    this._kuroToken = new this.web3.eth.Contract(
      config.KURO_ABI,
      config.KURO_ADDRESS
    )
    this._shiroToken = new this.web3.eth.Contract(
      config.SHIRO_ABI,
      config.SHIRO_ADDRESS
    )
  }

  getBlockNumberNow () {
    return this.web3.eth.getBlockNumber()
  }

  getBlockHash (number) {
    return this.web3.eth.getBlock(number).then(res => {
      if (res && typeof res.hash === 'string') {
        return res.hash
      } else {
        return '0x0'
      }
    })
  }

  parseAttribute (id) {
    const hex = this.web3.utils.toHex(id).substr(2, 32)
    const attr = {}

    attr.HP = (parseInt(hex.substr(0, 2), 16) + 255) << 1
    attr.MP = (parseInt(hex.substr(2, 2), 16) + 255) << 1
    attr.MgA = (parseInt(hex.substr(4, 2), 16) + 255) >> 1
    attr.MgD = (parseInt(hex.substr(6, 2), 16) + 255) >> 2
    attr.SP = (parseInt(hex.substr(8, 2), 16) + 255) >> 1

    const types = [
      { i: 0, value: parseInt(hex.substr(10, 2), 16) },
      { i: 1, value: parseInt(hex.substr(12, 2), 16) },
      { i: 2, value: parseInt(hex.substr(14, 2), 16) },
      { i: 3, value: parseInt(hex.substr(16, 2), 16) },
      { i: 4, value: parseInt(hex.substr(18, 2), 16) },
      { i: 5, value: parseInt(hex.substr(20, 2), 16) },
      { i: 6, value: parseInt(hex.substr(22, 2), 16) },
      { i: 7, value: parseInt(hex.substr(24, 2), 16) },
      { i: 8, value: parseInt(hex.substr(26, 2), 16) }
    ]

    for (let i = 0; i < 5; i++) {
      types[i].has = types[i].value > 180
    }
    for (let i = 5; i < 7; i++) {
      types[i].has = types[i].value > 230
    }
    for (let i = 7; i < 9; i++) {
      types[i].has = types[i].value > 252
    }

    attr.wat = types[0].has
    attr.fir = types[1].has
    attr.wid = types[2].has
    attr.soi = types[3].has
    attr.ele = types[4].has
    
    attr.lig = types[5].has
    attr.dar = types[6].has

    attr.tim = types[7].has
    attr.spa = types[8].has

    const top = types.filter(item => item.has).sort((a, b) => a.value - b.value)[0]
    if (top === undefined) {
      attr.main = -1
    } else {
      let length = types.filter(item => item.value === top.value).length
      const index = parseInt(hex.substr(10, 2), 16) % length
      attr.main = types.filter(item => item.value === top.value)[index].i
    }

    attr.memory = parseInt(hex.substr(30, 2), 16) > 252

    return attr
  }

  async createNewMahouShoujo () {
    const accounts = await this.web3.eth.getAccounts()
    return this._kuroToken.methods
      .getNewToken()
      .send({
        from: accounts[0]
      })
  }
  
  async getMahouShoujoList (start, end) {
    const accounts = await this.web3.eth.getAccounts()
    return this._kuroToken.methods
      .getOwnerTokens(accounts[0], start, end)
      .call()
  }

  async getMahouShoujoCount () {
    const accounts = await this.web3.eth.getAccounts()
    return this._kuroToken.methods
      .balanceOf(accounts[0])
      .call()
  }

  async getAllBlockHash () {
    const height = await this.getBlockNumberNow()
    let pl = []
    for (let i = config.START_BLOCK_NUMBER; i < height; i += config.INTERVAL_PER_IDER) {
      pl.push(this.getBlockHash(i))
    }
    return Promise.all(pl)
  }
}
window.Veb3 = Veb3
export default Veb3
