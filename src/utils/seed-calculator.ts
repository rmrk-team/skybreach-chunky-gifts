function getSeedComponent(hash: string): string{
    return hash.slice(2,6) + hash.slice(hash.length-4)
}

export function calcucateSeed(hash1: string,hash2: string, id: number) : number {
    const a = parseInt(getSeedComponent(hash1),16)
    const b = parseInt(getSeedComponent(hash2),16)
    return (a+b+id)
}

export function mulberry32(a:number) {
    return function() {
      var t = a += 0x6D2B79F5
      t = Math.imul(t ^ t >>> 15, t | 1)
      t ^= t + Math.imul(t ^ t >>> 7, t | 61)
      return ((t ^ t >>> 14) >>> 0) / 4294967296
    }
}