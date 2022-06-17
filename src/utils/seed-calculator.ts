function getSeedComponent(hash: string): string{
    return hash.slice(2,10) + hash.slice(hash.length-8)
}

export function calcucateSeed(hash1: string,hash2: string) : string {
    const a = parseInt(getSeedComponent(hash1),16)
    const b = parseInt(getSeedComponent(hash2),16)
    return '0x'+(a+b).toString(16)
}
