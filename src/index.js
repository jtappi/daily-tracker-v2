require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto'); // Use the built-in crypto module
const app = express();

// Load environment variables
const port = process.env.PORT || 3000;
const secretKey = process.env.SECRET_KEY;
const encryptionKey = process.env.ENCRYPTION_KEY;
const encryptionIv = process.env.ENCRYPTION_IV;
const encryptedPassword = process.env.ENCRYPTED_PASSWORD;

// Use Helmet to set various HTTP headers for security
app.use(helmet());

// Rate limiting to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Middleware to set the X-Forwarded-Proto header to http
app.use((req, res, next) => {
    req.headers['x-forwarded-proto'] = 'http';
    next();
});

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Authentication middleware
function isAuthenticated(req, res, next) {
    if (req.session.authenticated) {
        return next();
    } else {
        console.log('Redirecting to login');
        res.redirect('/login.html');
    }
}

// Apply the authentication middleware to all routes that require authentication
app.use('/index.html', isAuthenticated);
app.use('/top-items', isAuthenticated);
app.use('/data', isAuthenticated);
app.use('/search', isAuthenticated);

// Authentication route
app.post('/authenticate', (req, res) => {
    const { password } = req.body;
    const key = Buffer.from(encryptionKey, 'hex');
    const iv = Buffer.from(encryptionIv, 'hex');

    function decrypt(text) {
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(text, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    const storedPassword = decrypt(encryptedPassword);

    if (password === storedPassword) {
        req.session.authenticated = true;
        res.json({ success: true });
    } else {
        req.session.authenticated = false;
        res.json({ success: false });
    }
});

// Serve the login page
app.get('/login.html', (req, res) => {
    console.log('Serving login page');
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// Default route to redirect to login if not authenticated
app.get('/', (req, res) => {
    if (req.session.authenticated) {
        res.redirect('/index.html');
    } else {
        res.redirect('/login.html');
    }
});

// Serve the main page
app.get('/index.html', (req, res) => {
    if (req.session.authenticated) {
        res.sendFile(path.join(__dirname, '../public', 'index.html'));
    } else {
        res.redirect('/login.html');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});