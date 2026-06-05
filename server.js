const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve frontend static files from root directory

// Preset Asset Configurations
const PRESET_ASSETS = {
  'AAPL': { name: 'Apple Inc.', price: 178.50, type: 'Stock' },
  'MSFT': { name: 'Microsoft Corp.', price: 422.30, type: 'Stock' },
  'NVDA': { name: 'NVIDIA Corporation', price: 902.50, type: 'Stock' },
  'TSLA': { name: 'Tesla Inc.', price: 176.40, type: 'Stock' },
  'AMZN': { name: 'Amazon.com Inc.', price: 181.25, type: 'Stock' },
  'GOOGL': { name: 'Alphabet Inc.', price: 173.60, type: 'Stock' },
  'BTC': { name: 'Bitcoin', price: 68150.00, type: 'Crypto' },
  'ETH': { name: 'Ethereum', price: 3510.00, type: 'Crypto' },
  'RELIANCE': { name: 'Reliance Industries', price: 35.80, type: 'Stock' },
  'TCS': { name: 'Tata Consultancy Services', price: 46.20, type: 'Stock' },
  'INFY': { name: 'Infosys Limited', price: 18.90, type: 'Stock' }
};

// Global Server Price Cache
let currentPrices = {};
Object.keys(PRESET_ASSETS).forEach(ticker => {
  currentPrices[ticker] = PRESET_ASSETS[ticker].price;
});

// SSE Connected clients list
let sseClients = [];

// ==========================================
// DATABASE HELPERS (JSON File Storage)
// ==========================================

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialDB = { users: {} };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
    return initialDB;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file, initializing empty:', err.message);
    return { users: {} };
  }
}

function saveDB(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Error saving database file:', err.message);
  }
}

// Ensure database file initialized on startup
const startDB = readDB();
// Load custom assets from all existing users in the db into currentPrices cache
if (startDB.users) {
  Object.keys(startDB.users).forEach(email => {
    const custom = startDB.users[email].customAssets || {};
    Object.keys(custom).forEach(ticker => {
      if (!currentPrices[ticker]) {
        currentPrices[ticker] = custom[ticker].price;
      }
    });
  });
}

// ==========================================
// PRICE TICK SIMULATOR & CRYPTO POLLER
// ==========================================

// Fluctuates stock and custom prices every 3 seconds
function simulateMarketFluctuations() {
  Object.keys(currentPrices).forEach(ticker => {
    // Only simulate if not updated by live API or to add dynamic movement
    const oldPrice = currentPrices[ticker];
    const changePercent = (Math.random() - 0.5) * 0.015; // Max 0.75% change
    let newPrice = oldPrice + (oldPrice * changePercent);
    
    if (newPrice < 0.01) newPrice = 0.01;
    currentPrices[ticker] = newPrice;
  });
  broadcastPrices();
}

// Polls real CoinCap API for live crypto rates every 10 seconds
async function pollCryptoAPI() {
  try {
    // Making http call inside server.js to bypass browser CORS constraints
    const options = {
      hostname: 'api.coincap.io',
      path: '/v2/assets?limit=15',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) return;
          const json = JSON.parse(data);
          json.data.forEach(coin => {
            const symbol = coin.symbol.toUpperCase();
            const apiPrice = parseFloat(coin.priceUsd);
            // Update cache directly
            if (currentPrices[symbol] !== undefined) {
              currentPrices[symbol] = apiPrice;
            }
          });
        } catch (e) {
          // Parsing failure ignored
        }
      });
    });

    req.on('error', (e) => {
      // Offline fallback
    });
    req.end();
  } catch (err) {
    // Fail silently
  }
}

// Broadcasts price packet to all connected EventSource streams
function broadcastPrices() {
  const data = JSON.stringify(currentPrices);
  sseClients.forEach(client => {
    client.res.write(`data: ${data}\n\n`);
  });
}

// Start Simulator
setInterval(simulateMarketFluctuations, 3000);
// Start Crypto Polling
setInterval(pollCryptoAPI, 10000);
pollCryptoAPI(); // Initial pull

// ==========================================
// REST API ROUTES
// ==========================================

// Authenticate / Login Endpoint
app.post('/api/login', (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email address required.' });
  }

  const db = readDB();
  // Initialize user portfolio structure if new user
  if (!db.users[email]) {
    db.users[email] = {
      holdings: [],
      customAssets: {}
    };
    saveDB(db);
    console.log(`Backend: Registered new user [${email}]`);
  } else {
    console.log(`Backend: Sign-in session for user [${email}]`);
  }

  res.json({ success: true, email });
});

// Fetch Portfolio Endpoint
app.get('/api/portfolio/:email', (req, res) => {
  const email = req.params.email.toLowerCase();
  const db = readDB();
  const user = db.users[email];
  
  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  res.json({
    holdings: user.holdings,
    customAssets: user.customAssets
  });
});

// Add Position Endpoint
app.post('/api/portfolio/:email/add', (req, res) => {
  const email = req.params.email.toLowerCase();
  const { ticker, qty, buyPrice } = req.body;

  if (!ticker || isNaN(qty) || qty <= 0 || isNaN(buyPrice) || buyPrice <= 0) {
    return res.status(400).json({ error: 'Invalid input parameters.' });
  }

  const db = readDB();
  const user = db.users[email];
  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  // Identify stock info
  let name = '';
  let baselinePrice = 0;

  if (PRESET_ASSETS[ticker]) {
    name = PRESET_ASSETS[ticker].name;
    baselinePrice = currentPrices[ticker];
  } else if (user.customAssets[ticker]) {
    name = user.customAssets[ticker].name;
    baselinePrice = currentPrices[ticker];
  } else {
    // Generate simulated baseline price for new custom asset
    name = ticker + ' Custom Corp';
    baselinePrice = Math.floor(Math.random() * 390) + 10;
    user.customAssets[ticker] = { name, price: baselinePrice };
    currentPrices[ticker] = baselinePrice;
    
    console.log(`Backend: Seeded custom asset baseline [${ticker}] at $${baselinePrice}`);
  }

  // Update existing position (Weighted Cost Average) or insert new
  const existingIndex = user.holdings.findIndex(h => h.ticker === ticker);
  if (existingIndex > -1) {
    const existing = user.holdings[existingIndex];
    const totalCost = (existing.qty * existing.buyPrice) + (qty * buyPrice);
    const newQty = existing.qty + qty;
    const avgBuyPrice = totalCost / newQty;

    existing.qty = newQty;
    existing.buyPrice = avgBuyPrice;
    console.log(`Backend: Updated holdings for [${email}] -> ${ticker} average updated to $${avgBuyPrice.toFixed(2)}`);
  } else {
    user.holdings.push({
      ticker,
      name,
      qty,
      buyPrice
    });
    console.log(`Backend: Added new holdings position for [${email}] -> ${ticker} (${qty} units)`);
  }

  saveDB(db);
  res.json({ success: true, holdings: user.holdings, customAssets: user.customAssets });
});

// Remove Position Endpoint
app.delete('/api/portfolio/:email/remove/:ticker', (req, res) => {
  const email = req.params.email.toLowerCase();
  const ticker = req.params.ticker.toUpperCase();

  const db = readDB();
  const user = db.users[email];
  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  const initialLen = user.holdings.length;
  user.holdings = user.holdings.filter(h => h.ticker !== ticker);
  
  if (user.holdings.length < initialLen) {
    saveDB(db);
    console.log(`Backend: Deleted position for [${email}] -> ${ticker}`);
    res.json({ success: true, holdings: user.holdings, customAssets: user.customAssets });
  } else {
    res.status(404).json({ error: 'Asset position not found in portfolio.' });
  }
});

// ==========================================
// REAL-TIME SERVER-SENT EVENTS (SSE) STREAM
// ==========================================

app.get('/api/prices/stream', (req, res) => {
  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Establish connection immediately

  // Register client
  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);
  
  console.log(`Backend: Real-time price stream connection established. (Active: ${sseClients.length})`);

  // Write initial price block instantly
  res.write(`data: ${JSON.stringify(currentPrices)}\n\n`);

  // Clean up on client disconnect
  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
    console.log(`Backend: Real-time price stream disconnected. (Active: ${sseClients.length})`);
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`Apex Portfolio System Server running on port ${PORT}`);
  console.log(`Local Access: http://localhost:${PORT}`);
  console.log(`===================================================`);
});
