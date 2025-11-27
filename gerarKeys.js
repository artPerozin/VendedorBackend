// gerar-keys.js
const { generateKeyPairSync } = require("crypto");
const fs = require("fs");

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "pkcs1", format: "pem" },
  privateKeyEncoding: { type: "pkcs1", format: "pem" },
});

fs.writeFileSync("private.key", privateKey);
fs.writeFileSync("public.key", publicKey);

console.log("Chaves geradas com sucesso!");
