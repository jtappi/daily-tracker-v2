const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Ensure environment variables are loaded

const algorithm = 'aes-256-cbc';
const encryptedPassword = JSON.parse(fs.readFileSync(path.join(__dirname, 'encrypted-password.json')));
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // Use environment variable for the key
const iv = Buffer.from(encryptedPassword.iv, 'hex');

function decrypt(text) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

const password = decrypt(encryptedPassword.encryptedData);

module.exports = (req, res, next) => {
    if (req.path === '/login' || req.path === '/authenticate') {
        return next();
    }

    if (!req.session || !req.session.authenticated) {
        return res.redirect('/login');
    }

    next();
};