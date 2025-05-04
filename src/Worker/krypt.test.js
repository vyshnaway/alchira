import krypt from './krypt.js';

// const symKey = await krypt.sym.generateKey()
// console.log(symKey)
const gen = await krypt.sym.gencrypt(JSON.stringify([[1, 2, 3], [4, 5, 6]]))
console.log(gen)
const Edec = JSON.parse(await krypt.sym.decrypt(gen.data, gen.key, gen.iv))
console.log(Edec)

const enc = await krypt.sym.encrypt(JSON.stringify([[1, 2, 3], [4, 5, 6]]), gen.key, gen.iv)
console.log(enc)
const Gdec = JSON.parse(await krypt.sym.decrypt(enc.data, enc.key, enc.iv))
console.log(Gdec)

const asymKey = await krypt.asym.genKeyPair()
console.log(asymKey)
const asEnc = await krypt.asym.encrypt(JSON.stringify([[1, 2, 3], [4, 5, 6]]),asymKey.publicKey)
console.log(asEnc)
const asDec = JSON.parse(await krypt.asym.decrypt(asEnc, asymKey.privateKey))
console.log(asDec)
