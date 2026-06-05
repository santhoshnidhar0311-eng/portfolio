// ==========================================
// STATE VARIABLES & BASE SETTINGS
// ==========================================

// Prepopulated popular assets (kept for search autofills & placeholder suggestion prices)
const PRESET_ASSETS = {
  'AAPL': { name: 'Apple Inc.', price: 178.50 },
  'MSFT': { name: 'Microsoft Corp.', price: 422.30 },
  'NVDA': { name: 'NVIDIA Corporation', price: 902.50 },
  'TSLA': { name: 'Tesla Inc.', price: 176.40 },
  'AMZN': { name: 'Amazon.com Inc.', price: 181.25 },
  'GOOGL': { name: 'Alphabet Inc.', price: 173.60 },
  'BTC': { name: 'Bitcoin', price: 68150.00 },
  'ETH': { name: 'Ethereum', price: 3510.00 },
  'RELIANCE': { name: 'Reliance Industries', price: 35.80 },
  'TCS': { name: 'Tata Consultancy Services', price: 46.20 },
  'INFY': { name: 'Infosys Limited', price: 18.90 }
};

// State
let currentUser = null;
let portfolio = {
  holdings: [],
  customAssets: {}
};
let currentPrices = {}; // Dynamically filled by SSE price stream
let priceSource = null; // EventSource stream listener
let allocationChart = null;

// ==========================================
// INITIALIZATION & USER SESSIONS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupEventListeners();
});

function initApp() {
  // Pre-seed baseline prices in case of network latency before first SSE tick
  Object.keys(PRESET_ASSETS).forEach(ticker => {
    currentPrices[ticker] = PRESET_ASSETS[ticker].price;
  });

  // Check user session
  const savedUser = sessionStorage.getItem('apex_portfolio_user');
  if (savedUser) {
    loginUser(savedUser);
  } else {
    showView('loginSection');
  }
}

function setupEventListeners() {
  // Login submission
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', handleLoginSubmit);

  // Logout button
  const btnLogout = document.getElementById('btnLogout');
  btnLogout.addEventListener('click', handleLogout);

  // Add Asset form
  const addStockForm = document.getElementById('addStockForm');
  addStockForm.addEventListener('submit', handleAddAssetSubmit);

  // Search input dropdown filtering
  const stockTickerInput = document.getElementById('stockTicker');
  const stockSearchList = document.getElementById('stockSearchList');

  stockTickerInput.addEventListener('input', handleStockSearchInput);
  
  // Close suggestion dropdown clickaway
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-container')) {
      stockSearchList.style.display = 'none';
    }
  });

  stockTickerInput.addEventListener('focus', () => {
    if (stockTickerInput.value.trim().length > 0) {
      stockSearchList.style.display = 'block';
    }
  });
}

function showView(viewId) {
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.remove('active');
  });
  const target = document.getElementById(viewId);
  target.classList.add('active');
}

// ==========================================
// BACKEND API INTEGRATIONS
// ==========================================

async function handleLoginSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById('loginEmail');
  const email = emailInput.value.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Login failed.');
    }

    sessionStorage.setItem('apex_portfolio_user', email);
    loginUser(email);
    showToast(`Welcome, ${email}! Connected to server database.`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function loginUser(email) {
  currentUser = email;
  document.getElementById('userEmailText').textContent = email;

  // Transition screen
  showView('dashboardSection');

  // Load User holdings from backend
  loadUserHoldings(email);

  // Open Real-time SSE price stream from server
  connectPriceStream();
}

async function loadUserHoldings(email) {
  try {
    const response = await fetch(`/api/portfolio/${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error('Could not fetch portfolio data.');

    const data = await response.json();
    portfolio.holdings = data.holdings || [];
    portfolio.customAssets = data.customAssets || {};

    // Synchronize custom assets baseline into local prices memory
    Object.keys(portfolio.customAssets).forEach(ticker => {
      if (!currentPrices[ticker]) {
        currentPrices[ticker] = portfolio.customAssets[ticker].price;
      }
    });

    // Initial render
    renderHoldingsTable();
    updateSummaryMetrics();
    updateAllocationChart();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleAddAssetSubmit(e) {
  e.preventDefault();
  const tickerInput = document.getElementById('stockTicker');
  const qtyInput = document.getElementById('stockQty');
  const buyPriceInput = document.getElementById('stockBuyPrice');

  const ticker = tickerInput.value.trim().toUpperCase();
  const qty = parseFloat(qtyInput.value);
  const buyPrice = parseFloat(buyPriceInput.value);

  if (!ticker || isNaN(qty) || qty <= 0 || isNaN(buyPrice) || buyPrice <= 0) {
    showToast('Invalid assets details. Check quantity and buying price.', 'error');
    return;
  }

  try {
    const response = await fetch(`/api/portfolio/${encodeURIComponent(currentUser)}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker, qty, buyPrice })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Failed to register position.');
    }

    const resData = await response.json();
    portfolio.holdings = resData.holdings;
    portfolio.customAssets = resData.customAssets;

    // Reset inputs
    document.getElementById('addStockForm').reset();
    showToast(`Position in ${ticker} updated on backend.`, 'success');

    // Re-render UI
    renderHoldingsTable();
    updateSummaryMetrics();
    updateAllocationChart();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deletePosition(ticker) {
  try {
    const response = await fetch(`/api/portfolio/${encodeURIComponent(currentUser)}/remove/${encodeURIComponent(ticker)}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Failed to remove position.');
    }

    const resData = await response.json();
    portfolio.holdings = resData.holdings;
    portfolio.customAssets = resData.customAssets;

    showToast(`Position in ${ticker} deleted on backend.`, 'success');

    // Re-render UI
    renderHoldingsTable();
    updateSummaryMetrics();
    updateAllocationChart();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function handleLogout() {
  // Close SSE stream
  if (priceSource) {
    priceSource.close();
    priceSource = null;
  }

  sessionStorage.removeItem('apex_portfolio_user');
  currentUser = null;
  portfolio = { holdings: [], customAssets: {} };

  // Reset inputs
  document.getElementById('loginEmail').value = '';
  document.getElementById('addStockForm').reset();

  showView('loginSection');
  setServerStatus(false, 'Server Offline');
  showToast('Logged out of server session.', 'success');
}

// ==========================================
// REAL-TIME SERVER-SENT EVENTS (SSE) STREAM
// ==========================================

function connectPriceStream() {
  if (priceSource) {
    priceSource.close();
  }

  // Hook EventSource listener to backend stream route
  priceSource = new EventSource('/api/prices/stream');

  priceSource.onmessage = function(event) {
    try {
      const serverPrices = JSON.parse(event.data);
      let anyChange = false;

      Object.keys(serverPrices).forEach(ticker => {
        const oldPrice = currentPrices[ticker];
        const newPrice = serverPrices[ticker];
        currentPrices[ticker] = newPrice;

        // Visual flash indicator triggers on value shifts
        if (oldPrice !== undefined && oldPrice !== newPrice) {
          triggerPriceAnimation(ticker, oldPrice, newPrice);
          anyChange = true;
        }
      });

      // Update UI totals and charts on any price ticks
      updateSummaryMetrics();
      updateTableCalculationsOnly();
      updateAllocationChart();
      
      // Update badge to online
      setServerStatus(true, 'Server Streaming');
    } catch (e) {
      console.error('Failed to parse SSE data stream packet:', e);
    }
  };

  priceSource.onerror = function() {
    setServerStatus(false, 'Connection Lost');
  };
}

function setServerStatus(online, text) {
  const badge = document.getElementById('serverStatusBadge');
  const icon = document.getElementById('serverStatusIcon');
  const label = document.getElementById('serverStatusText');

  if (online) {
    badge.style.borderColor = 'rgba(16, 185, 129, 0.25)';
    icon.style.color = 'var(--color-success)';
    label.style.color = 'var(--color-success)';
    label.textContent = text;
  } else {
    badge.style.borderColor = 'rgba(239, 68, 68, 0.25)';
    icon.style.color = 'var(--color-danger)';
    label.style.color = 'var(--color-danger)';
    label.textContent = text;
  }
}

// ==========================================
// SEARCH & AUTOCOMPLETE SUGGESTIONS
// ==========================================

function handleStockSearchInput(e) {
  const query = e.target.value.trim().toUpperCase();
  const searchList = document.getElementById('stockSearchList');
  searchList.innerHTML = '';

  if (query.length === 0) {
    searchList.style.display = 'none';
    return;
  }

  // Filter defaults
  const matches = Object.keys(PRESET_ASSETS).filter(ticker => {
    return ticker.includes(query) || PRESET_ASSETS[ticker].name.toUpperCase().includes(query);
  });

  if (matches.length === 0) {
    // Custom stock creation trigger
    const customItem = document.createElement('div');
    customItem.className = 'stock-search-item';
    customItem.innerHTML = `
      <span class="ticker">+ Create Custom: ${query}</span>
      <span class="name">Add new asset ticker</span>
    `;
    customItem.addEventListener('mousedown', () => {
      selectTicker(query, query + ' Custom Asset');
    });
    searchList.appendChild(customItem);
  } else {
    matches.forEach(ticker => {
      const item = document.createElement('div');
      item.className = 'stock-search-item';
      item.innerHTML = `
        <span class="ticker">${ticker}</span>
        <span class="name">${PRESET_ASSETS[ticker].name}</span>
      `;
      item.addEventListener('mousedown', () => {
        selectTicker(ticker, PRESET_ASSETS[ticker].name);
      });
      searchList.appendChild(item);
    });
  }

  searchList.style.display = 'block';
}

function selectTicker(ticker, name) {
  const tickerInput = document.getElementById('stockTicker');
  const buyPriceInput = document.getElementById('stockBuyPrice');
  
  tickerInput.value = ticker;
  document.getElementById('stockSearchList').style.display = 'none';

  // Seed buy price suggestion
  if (currentPrices[ticker]) {
    buyPriceInput.value = currentPrices[ticker].toFixed(2);
  } else {
    buyPriceInput.value = '';
  }
}

// ==========================================
// UI RENDERING UTILITIES
// ==========================================

function renderHoldingsTable() {
  const tableBody = document.getElementById('holdingsTableBody');
  const emptyState = document.getElementById('emptyHoldingsState');
  const table = document.getElementById('holdingsTable');

  tableBody.innerHTML = '';

  if (!portfolio.holdings || portfolio.holdings.length === 0) {
    emptyState.style.display = 'block';
    table.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  table.style.display = 'table';

  portfolio.holdings.forEach(holding => {
    const currentPrice = currentPrices[holding.ticker] || holding.buyPrice;
    const currentValue = holding.qty * currentPrice;
    const profitLoss = (currentPrice - holding.buyPrice) * holding.qty;
    const profitLossPct = ((currentPrice - holding.buyPrice) / holding.buyPrice) * 100;
    
    const pnlClass = profitLoss >= 0 ? 'profit' : 'loss';
    const sign = profitLoss >= 0 ? '+' : '';

    const tr = document.createElement('tr');
    tr.id = `row-${holding.ticker}`;
    tr.innerHTML = `
      <td>
        <div class="holding-ticker-cell">
          <div class="holding-icon">${holding.ticker.substring(0, 3)}</div>
          <div class="holding-name">
            <span class="symbol">${holding.ticker}</span>
            <span class="full-name">${holding.name}</span>
          </div>
        </div>
      </td>
      <td>${holding.qty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}</td>
      <td>${formatCurrency(holding.buyPrice)}</td>
      <td id="live-price-${holding.ticker}" class="live-price-cell">${formatCurrency(currentPrice)}</td>
      <td id="live-val-${holding.ticker}">${formatCurrency(currentValue)}</td>
      <td id="live-pnl-${holding.ticker}" class="live-pnl-cell ${pnlClass}">
        <span>${sign}${formatCurrency(profitLoss)}</span>
        <span class="pnl-percentage-badge ${pnlClass}">${sign}${profitLossPct.toFixed(2)}%</span>
      </td>
      <td>
        <button onclick="deletePosition('${holding.ticker}')" class="btn-delete" title="Delete Position">
          <i class="ri-delete-bin-6-line"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function updateTableCalculationsOnly() {
  if (!portfolio.holdings) return;
  
  portfolio.holdings.forEach(holding => {
    const currentPrice = currentPrices[holding.ticker] || holding.buyPrice;
    const currentValue = holding.qty * currentPrice;
    const profitLoss = (currentPrice - holding.buyPrice) * holding.qty;
    const profitLossPct = ((currentPrice - holding.buyPrice) / holding.buyPrice) * 100;
    
    const pnlClass = profitLoss >= 0 ? 'profit' : 'loss';
    const sign = profitLoss >= 0 ? '+' : '';

    const valCell = document.getElementById(`live-val-${holding.ticker}`);
    if (valCell) valCell.textContent = formatCurrency(currentValue);

    const pnlCell = document.getElementById(`live-pnl-${holding.ticker}`);
    if (pnlCell) {
      pnlCell.className = `live-pnl-cell ${pnlClass}`;
      pnlCell.innerHTML = `
        <span>${sign}${formatCurrency(profitLoss)}</span>
        <span class="pnl-percentage-badge ${pnlClass}">${sign}${profitLossPct.toFixed(2)}%</span>
      `;
    }
  });
}

function updateSummaryMetrics() {
  let totalInvested = 0;
  let totalCurrentValue = 0;

  if (portfolio.holdings) {
    portfolio.holdings.forEach(holding => {
      const currentPrice = currentPrices[holding.ticker] || holding.buyPrice;
      totalInvested += holding.qty * holding.buyPrice;
      totalCurrentValue += holding.qty * currentPrice;
    });
  }

  const totalPL = totalCurrentValue - totalInvested;
  const totalPLPct = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;
  const isProfit = totalPL >= 0;

  const networthVal = document.getElementById('networthValue');
  const networthPL = document.getElementById('networthProfitLoss');
  const totalInvestedText = document.getElementById('totalInvestedText');
  const dayStatusText = document.getElementById('dayStatusText');

  networthVal.textContent = formatCurrency(totalCurrentValue);
  totalInvestedText.textContent = formatCurrency(totalInvested);

  networthPL.className = `pl-badge ${isProfit ? 'profit' : 'loss'}`;
  networthPL.innerHTML = `
    <i class="${isProfit ? 'ri-arrow-right-up-line' : 'ri-arrow-right-down-line'}"></i>
    <span>${isProfit ? '+' : ''}${formatCurrency(totalPL)} (${isProfit ? '+' : ''}${totalPLPct.toFixed(2)}%)</span>
  `;

  if (!portfolio.holdings || portfolio.holdings.length === 0) {
    dayStatusText.textContent = 'Empty Portfolio';
    dayStatusText.className = 'stat-value';
  } else if (totalPLPct > 2) {
    dayStatusText.textContent = 'Bullish Trend 🚀';
    dayStatusText.className = 'stat-value up';
  } else if (totalPLPct < -2) {
    dayStatusText.textContent = 'Bearish Pressure 📉';
    dayStatusText.className = 'stat-value down';
  } else {
    dayStatusText.textContent = 'Stable Market ⚖️';
    dayStatusText.className = 'stat-value';
  }
}

function triggerPriceAnimation(ticker, oldPrice, newPrice) {
  const cell = document.getElementById(`live-price-${ticker}`);
  if (!cell) return;

  cell.textContent = formatCurrency(newPrice);
  
  cell.classList.remove('up-tick', 'down-tick');
  void cell.offsetWidth; // Force CSS reflow
  
  if (newPrice > oldPrice) {
    cell.classList.add('up-tick');
  } else if (newPrice < oldPrice) {
    cell.classList.add('down-tick');
  }
}

// ==========================================
// DOUGHNUT CHART VISUALS (CHART.JS)
// ==========================================

function updateAllocationChart() {
  const chartCanvas = document.getElementById('chartCanvas');
  const placeholder = document.getElementById('chartPlaceholder');

  if (!portfolio.holdings || portfolio.holdings.length === 0) {
    chartCanvas.style.display = 'none';
    placeholder.style.display = 'flex';
    if (allocationChart) {
      allocationChart.destroy();
      allocationChart = null;
    }
    return;
  }

  chartCanvas.style.display = 'block';
  placeholder.style.display = 'none';

  const labels = portfolio.holdings.map(h => h.ticker);
  const data = portfolio.holdings.map(h => {
    const currentPrice = currentPrices[h.ticker] || h.buyPrice;
    return parseFloat((h.qty * currentPrice).toFixed(2));
  });

  const neonColors = [
    '#6366f1', '#10b981', '#3b82f6', '#a855f7',
    '#f59e0b', '#ec4899', '#06b6d4', '#f43f5e'
  ];

  if (allocationChart) {
    allocationChart.data.labels = labels;
    allocationChart.data.datasets[0].data = data;
    allocationChart.update();
  } else {
    const ctx = chartCanvas.getContext('2d');
    allocationChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: neonColors.slice(0, Math.max(labels.length, neonColors.length)),
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return ` ${label}: $${value.toLocaleString()} (${percentage}%)`;
              }
            },
            backgroundColor: '#0f1225',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            titleFont: { family: 'Outfit', weight: 'bold' },
            bodyFont: { family: 'Plus Jakarta Sans' },
            padding: 10
          }
        },
        cutout: '70%'
      }
    });
  }
}

// ==========================================
// HELPERS
// ==========================================

function formatCurrency(num) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

function showToast(message, type = 'success') {
  const container = document.getElementById('notificationContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill';
  
  toast.innerHTML = `
    <i class="${icon}" style="font-size: 20px;"></i>
    <span style="font-size: 13px; font-weight: 500;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse forwards';
    setTimeout(() => { toast.remove(); }, 300);
  }, 4000);
}

// Expose deletePosition function to the global window object for onclick events
window.deletePosition = deletePosition;
