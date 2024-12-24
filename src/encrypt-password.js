const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const password = 'your-password-here'; // Replace with your password

const cipher = crypto.createCipheriv(algorithm, key, iv);
let encrypted = cipher.update(password, 'utf8', 'hex');
encrypted += cipher.final('hex');

const encryptedPassword = {
    iv: iv.toString('hex'),
    encryptedData: encrypted
};

fs.writeFileSync(path.join(__dirname, 'encrypted-password.json'), JSON.stringify(encryptedPassword, null, 2));
fs.writeFileSync(path.join(__dirname, 'key.json'), JSON.stringify({ key: key.toString('hex') }, null, 2));

console.log('Password encrypted and saved successfully.');