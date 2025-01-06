require('dotenv').config();
const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto'); // Ensure crypto is correctly imported
const app = express();

// Path to the data.json file
const dataFilePath = path.join(__dirname, 'data.json');

// Check if data.json exists, if not create it with an empty array
if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf8');
}

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
app.use((req, res, next) => {
    console.log('Session:', req.session);
    console.log('Request Path:', req.path);
    if (req.session.authenticated || req.path === '/login' || req.path === '/authenticate') {
        next();
    } else {
        console.log('Redirecting to login');
        res.redirect('/login');
    }
});

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

app.post('/submit', (req, res) => {
    const { text, category, cost, notes } = req.body;
    if (!text || typeof text !== 'string' || text.trim() === '') {
        return res.status(400).json({ message: 'Invalid input' });
    }
    const sanitizedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const now = new Date();
    const timestamp = now.toISOString();
    const entry = {
        text: sanitizedText,
        category: category || null,
        cost: cost || null,
        notes: notes || null,
        day: dayNames[now.getDay()],
        month: monthNames[now.getMonth()],
        time: now.toLocaleTimeString(),
        timestamp
    };

    fs.readFile(path.join(__dirname, 'data.json'), (err, data) => {
        if (err) throw err;
        const json = JSON.parse(data);
        json.push(entry);
        fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(json, null, 2), (err) => {
            if (err) throw err;
            res.json({ message: 'Text saved successfully!' });
        });
    });
});

app.get('/search', (req, res) => {
    const query = req.query.query.toLowerCase();
    if (!query || typeof query !== 'string' || query.trim() === '') {
        return res.status(400).json({ message: 'Invalid query' });
    }
    fs.readFile(path.join(__dirname, 'data.json'), (err, data) => {
        if (err) throw err;
        const json = JSON.parse(data);
        const results = json.filter(item => item.text.toLowerCase().includes(query));
        const uniqueResults = results.filter((item, index, self) =>
            index === self.findIndex((t) => (
                t.text.toLowerCase() === item.text.toLowerCase()
            ))
        );
        res.json(uniqueResults);
    });
});

app.get('/data', (req, res) => {
    fs.readFile(path.join(__dirname, 'data.json'), (err, data) => {
        if (err) throw err;
        res.json(JSON.parse(data));
    });
});

app.get('/top-items', (req, res) => {
    fs.readFile(path.join(__dirname, 'data.json'), (err, data) => {
        if (err) {
            console.error('Error reading data.json:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const json = JSON.parse(data);

        // Count occurrences of each text value
        const itemCounts = json.reduce((acc, item) => {
            if (item.text) {
                acc[item.text] = (acc[item.text] || 0) + 1;
            }
            return acc;
        }, {});

        // Get the top 5 items based on their counts
        const topItems = Object.keys(itemCounts)
            .sort((a, b) => itemCounts[b] - itemCounts[a])
            .slice(0, 5)
            .map(text => {
                const item = json.find(item => item.text === text);
                return item ? { ...item, category: item.category || 'none' } : undefined;
            })
            .filter(item => item !== undefined); // Filter out undefined values

        // Send the top items as a JSON response
        res.json(topItems);
    });
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
    console.log(`Server is running on port https://localhost:${port}`);
});