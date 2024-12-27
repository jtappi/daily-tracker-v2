require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const iv = Buffer.from(process.env.ENCRYPTION_IV, 'hex');

function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

const newPassword = process.env.PASSWORD; // Replace with your new password
const encryptedPassword = encrypt(newPassword);

// console.log('Encrypted Password:', encryptedPassword);

// Optionally, write the encrypted password to a file or update the .env file directly
fs.writeFileSync(path.join(__dirname, '../.env'), `\nENCRYPTED_PASSWORD=${encryptedPassword}`, { flag: 'a' });