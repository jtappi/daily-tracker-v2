require('dotenv').config();
const express = require('express');
const session = require('express-session');
// const https = require('https'); SSL stuff, it works
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
const storedHashedPassword = process.env.HASHED_PASSWORD;

// Use Helmet to set various HTTP headers for security
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdn.jsdelivr.net"]
        }
    }
}));

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

// Serve static files from the 'public' directory
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

// Authentication route
app.post('/authenticate', (req, res) => {
    const { password } = req.body;
    if (password !== storedHashedPassword) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    req.session.authenticated = true;
    res.json({ success: true, message: 'Login successful' });
});

// Serve the login page
app.get('/login.html', (req, res) => {
    console.log('Serving login page');
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// Submit new entry
app.post('/submit', (req, res) => {
    const { text, category, cost, notes, calories } = req.body;
    if (!text || typeof text !== 'string' || text.trim() === '') {
        return res.status(400).json({ message: 'Invalid input' });
    }
    const sanitizedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const now = new Date();
    const timestamp = now.toISOString('en-US', { timeZone: 'America/New_York' });
    const entry = {
        text: sanitizedText,
        category: category || null,
        cost: cost || null,
        notes: notes || null,
        calories: calories || null,
        day: now.toLocaleString('en-US', { timeZone: 'America/New_York', weekday: 'long' }),
        month: now.toLocaleString('en-US', { timeZone: 'America/New_York', month: 'long' }),
        time: now.toLocaleTimeString('en-US', { timeZone: 'America/New_York' }),
        timestamp
    };

    fs.readFile(path.join(__dirname, 'data.json'), (err, data) => {
        if (err) {
            console.error('Error reading data file:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        let jsonData = JSON.parse(data);
        const highestId = jsonData.reduce((maxId, item) => Math.max(maxId, item.id || 0), 0);
        entry.id = highestId + 1;
        jsonData.push(entry);
        
        fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(jsonData, null, 2), (err) => {
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

// Update data route
app.put('/data/:id', (req, res) => {
    const { id } = req.params;
    const updatedItem = req.body;

    fs.readFile(path.join(__dirname, 'data.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data file:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        let jsonData = JSON.parse(data);
        const index = jsonData.findIndex(item => item.id === parseInt(id));

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        jsonData[index] = { ...jsonData[index], ...updatedItem };

        fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing data file:', err);
                return res.status(500).json({ success: false, message: 'Internal server error' });
            }

            res.json({ success: true, message: 'Item updated successfully' });
        });
    });
});

app.delete('/data/:id', (req, res) => {
    const { id } = req.params;

    fs.readFile(path.join(__dirname, 'data.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data file:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        let jsonData = JSON.parse(data);
        const index = jsonData.findIndex(item => item.id === parseInt(id));

        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        jsonData.splice(index, 1);

        fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing data file:', err);
                return res.status(500).json({ success: false, message: 'Internal server error' });
            }

            res.json({ success: true, message: 'Item deleted successfully' });
        });
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

// SSL stuff it works
// // Load SSL certificates
// const sslOptions = {
//     key: fs.readFileSync('key.pem'),
//     cert: fs.readFileSync('cert.pem')
// };

// // Start HTTPS server
// https.createServer(sslOptions, app).listen(port, () => {
//     console.log(`Server is running on https://localhost:${port}`);
// });
// Start server
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});