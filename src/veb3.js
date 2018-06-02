import Web3 from 'web3'

class Veb3 {
  constructor (provider) {
    this.web3 = new Web3(provider)
  }

  getBlockNumberNow () {
    return this.web3.eth.getBlockNumber()
  }

  getBlockHash (number) {
    return this.web3.eth.getBlock(number).then(res => {
      if (res && typeof res.hash === 'string') {
        return '0x0'
      } else {
        return res.hash
      }
    })
  }
}
// window.Veb3 = Veb3
export default Veb3
