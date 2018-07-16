type MHSJAttributes = "wat" | "fir" | "wid" | "soi" | "ele" | "lig" | "dar" | "tim" | "spa"

declare interface MahouShoujo {
  HP: number
  MP: number
  MgA: number
  MgD: number
  SP: number
  wat: boolean
  fir: boolean
  wid: boolean
  soi: boolean
  ele: boolean
  lig: boolean
  dar: boolean
  tim: boolean
  spa: boolean
  main?: MHSJAttributes
  memory: boolean
}

declare interface ABI {
  constant: boolean,
  inputs: { name: string, type: string }[],
  name: string,
  outputs: { name: string, type: string }[],
  payable: false,
  stateMutability: string,
  type: string,
  signature: string
}

declare interface Veb3Config {
  START_BLOCK_NUMBER: number,
  INTERVAL_PER_IDER: number,
  DEFAULT_PROVIDER: string,
  KURO_ADDRESS: string,
  SHIRO_ADDRESS: string,
  KURO_ABI: ABI[]
  SHIRO_ABI: ABI[]
}

export declare class Veb3 {
  constructor (Veb3Config)
  getBlockNumberNow(): Promise<number>
  getBlockHash(number: number): Promise<string>
  parseAttribute(id: string): MahouShoujo
  createNewMahouShoujo(): Promise<{ id: string, attr: MahouShoujo }>
  getMahouShoujoList(start: number, end: number): Promise<string[]>
  getMahouShoujoCount(): Promise<number>
  getAllBlockHash(): Promise<string[]>
}