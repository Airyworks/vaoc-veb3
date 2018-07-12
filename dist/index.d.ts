type MHSJAttributes = "wat" | "fir" | "wid" | "soi" | "ele" | "lig" | "dar" | "tim" | "spa"

export declare interface MahouShoujo {
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

export declare class Veb3 {
  constructor ()
  getBlockNumberNow(): Promise<number>
  getBlockHash(number: number): Promise<string>
  parseAttribute(id: string): MahouShoujo
  createNewMahouShoujo(): Promise<{ id: string, attr: MahouShoujo }>
  getMahouShoujoList(start: number, end: number): Promise<string[]>
  getMahouShoujoCount(): Promise<number>
  getAllBlockHash(): Promise<string[]>
}