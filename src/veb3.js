import Web3 from 'web3'

const MHSJAttributes = [
  'wat', 'fir', 'wid', 'soi', 'ele',
  'lig', 'dar',
  'tim', 'spa'
]

export class Veb3 {
  constructor (config) {
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

    const types = []
    for (let i = 0; i < 9; i++) {
      types.push({
        i,
        value: parseInt(hex.substr(10 + i * 2, 2), 16)
      })
      if (i < 5) {
        types[i].has = types[i].value > 180
      } else if (i < 7) {
        types[i].has = types[i].value > 230
      } else {
        types[i].has = types[i].value > 252
      }
      attr[MHSJAttributes[i]] = types[i].has
    }

    const top = types.filter(item => item.has).sort((a, b) => b.value - a.value)[0]
    if (top !== undefined) {
      const topTypes = types.filter(item => item.value === top.value && item.has)
      const length = topTypes.length
      const index = parseInt(hex.substr(28, 2), 16) % length
      attr.main = MHSJAttributes[topTypes[index].i]
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
      .then(res => {
        const id = res.events.Transfer[1].returnValues[2]
        return {
          id: id,
          attr: this.parseAttribute(id)
        }
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
