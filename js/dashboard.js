// 
// ==============================================
// CONFIGURATION & STATE
// ==============================================
//

const COINS = [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
    { id: 'solana', symbol: 'SOL', name: 'Solana', logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
    { id: 'matic-network', symbol: 'MATIC', name: 'Polygon', logo: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png' },
    { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum', logo: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg' },
    { id: 'chainlink', symbol: 'LINK', name: 'Chainlink', logo: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png' },
    { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche', logo: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png' },
    { id: 'binancecoin', symbol: 'BNB', name: 'BNB', logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
    { id: 'cardano', symbol: 'ADA', name: 'Cardano', logo: 'https://assets.coingecko.com/coins/images/975/small/cardano.png' },
    { id: 'ripple', symbol: 'XRP', name: 'XRP', logo: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png' },
    { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin', logo: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png' }
];

const API_URL = `https://api.coingecko.com/api/v3/simple/price?ids=${COINS.map(c => c.id).join(',')}&vs_currencies=usd&include_24hr_change=true`;

let marketData = {};
let watchlist = JSON.parse(localStorage.getItem('cryptoWatchlist')) || [];
let currentFilter = 'all'; // 'all' or 'watchlist'
let autoRefreshInterval = null;
let countdownInterval = null;
let isFetching = false;

// Formatters
const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: price < 1 ? 4 : 2,
        maximumFractionDigits: price < 1 ? 4 : 2
    }).format(price);
};

const formatChange = (change) => {
    if (!change) return '0.00%';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
};

// 
// ==============================================
// INITIALIZATION
// ==============================================
//
document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    updateWatchlistCount();
    setupEventListeners();
    fetchMarketData();
    
    // Initial UI Setup
    document.getElementById('stat-coins').innerText = COINS.length;
});

// 
// ==============================================
// API FETCH LOGIC
// ==============================================
//
async function fetchMarketData() {
    if (isFetching) return;
    isFetching = true;
    
    const refreshBtn = document.getElementById('refresh-btn');
    const refreshIcon = refreshBtn.querySelector('.refresh-icon');
    const tableLoader = document.getElementById('table-loader');
    const errorContainer = document.getElementById('error-container');
    const statusDot = document.getElementById('connection-dot');
    const statusText = document.getElementById('connection-text');
    
    // UI Loading state
    refreshBtn.disabled = true;
    refreshIcon.classList.add('spinning');
    if (Object.keys(marketData).length > 0) tableLoader.classList.add('active');
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        marketData = data;
        
        // Update UI
        updateTopCards();
        renderTable();
        updateLastSyncTime();
        updateMarketTrend();
        
        // Success Status
        errorContainer.classList.add('hidden');
        statusDot.className = 'pulse-dot online';
        statusText.innerText = 'API Connected';
        
    } catch (error) {
        console.error('Failed to fetch data:', error);
        
        if (Object.keys(marketData).length === 0) {
            // Only show error card if we have no cached data at all
            errorContainer.classList.remove('hidden');
            document.getElementById('top-cards-container').innerHTML = '';
        }
        
        // Error Status
        statusDot.className = 'pulse-dot offline';
        statusText.innerText = 'Connection Failed';
    } finally {
        // Reset UI
        isFetching = false;
        refreshBtn.disabled = false;
        refreshIcon.classList.remove('spinning');
        tableLoader.classList.remove('active');
        
        // Initialize Tilt on new elements
        initTilt();
    }
}

// 
// ==============================================
// UI UPDATES
// ==============================================
//
function updateTopCards() {
    const container = document.getElementById('top-cards-container');
    const template = document.getElementById('crypto-card-template');
    
    // We only want top 2 coins (BTC and ETH) for the top cards as per prompt
    const topCoins = COINS.slice(0, 2);
    
    // Clear skeletons on first load
    if (container.querySelector('.skeleton-card')) {
        container.innerHTML = '';
    }
    
    topCoins.forEach(coin => {
        const data = marketData[coin.id];
        if (!data) return;
        
        let card = container.querySelector(`.crypto-card[data-id="${coin.id}"]`);
        
        if (!card) {
            // Create new card
            const clone = template.content.cloneNode(true);
            card = clone.querySelector('.crypto-card');
            card.dataset.id = coin.id;
            
            // Static content
            card.querySelector('.coin-logo').src = coin.logo;
            card.querySelector('.coin-name').innerText = coin.name;
            card.querySelector('.coin-symbol').innerText = coin.symbol;
            
            // Watchlist toggle
            const watchBtn = card.querySelector('.watchlist-btn');
            if (watchlist.includes(coin.id)) watchBtn.classList.add('active');
            watchBtn.addEventListener('click', () => toggleWatchlist(coin.id, watchBtn));
            
            container.appendChild(clone);
            card = container.lastElementChild; // re-select appended element
            
            // Generate chart
            renderMiniChart(card.querySelector('.mini-chart'), data.usd_24h_change);
        }
        
        // Update Dynamic content
        const priceEl = card.querySelector('.coin-price');
        const oldPrice = parseFloat(priceEl.dataset.value) || 0;
        const newPrice = data.usd;
        
        priceEl.innerText = formatPrice(newPrice);
        priceEl.dataset.value = newPrice;
        
        // Price flash animation
        if (oldPrice !== 0 && oldPrice !== newPrice) {
            card.classList.remove('price-up', 'price-down');
            void card.offsetWidth; // trigger reflow
            card.classList.add(newPrice > oldPrice ? 'price-up' : 'price-down');
        }
        
        const changeEl = card.querySelector('.change-value');
        const badgeEl = card.querySelector('.change-badge');
        const change = data.usd_24h_change;
        
        changeEl.innerText = formatChange(change);
        badgeEl.className = `change-badge ${change >= 0 ? 'positive' : 'negative'}`;
    });
}

function renderTable() {
    const tbody = document.getElementById('market-table-body');
    tbody.innerHTML = '';
    
    let coinsToRender = COINS;
    if (currentFilter === 'watchlist') {
        coinsToRender = COINS.filter(c => watchlist.includes(c.id));
    }
    
    if (coinsToRender.length === 0 && currentFilter === 'watchlist') {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="color: var(--text-secondary);">Your watchlist is empty.</td></tr>`;
        return;
    }
    
    coinsToRender.forEach(coin => {
        const data = marketData[coin.id];
        if (!data) return;
        
        const change = data.usd_24h_change;
        const isPositive = change >= 0;
        const changeClass = isPositive ? 'positive' : 'negative';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="td-asset">
                    <img src="${coin.logo}" alt="${coin.name}">
                    <span>${coin.name} <span class="td-symbol">${coin.symbol}</span></span>
                </div>
            </td>
            <td class="td-price">${formatPrice(data.usd)}</td>
            <td>
                <div class="change-badge ${changeClass}">
                    <svg class="change-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                    <span>${formatChange(change)}</span>
                </div>
            </td>
            <td class="td-trend">
                <canvas id="chart-${coin.id}"></canvas>
            </td>
            <td>
                <button class="watchlist-btn ${watchlist.includes(coin.id) ? 'active' : ''}" data-id="${coin.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
        
        // Render chart for table row
        renderMiniChart(document.getElementById(`chart-${coin.id}`), change);
    });
    
    // Add watchlist listeners to table
    document.querySelectorAll('.market-table .watchlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            toggleWatchlist(id, e.currentTarget);
        });
    });
}

function updateLastSyncTime() {
    const now = new Date();
    document.getElementById('last-sync-time').innerText = now.toLocaleTimeString();
}

function updateMarketTrend() {
    // Calculate simple average trend of top 10 coins
    let totalChange = 0;
    let count = 0;
    
    COINS.forEach(c => {
        if(marketData[c.id]) {
            totalChange += marketData[c.id].usd_24h_change;
            count++;
        }
    });
    
    const avg = totalChange / count;
    const el = document.getElementById('stat-trend');
    el.innerText = avg > 0 ? 'Bullish' : 'Bearish';
    el.className = `stat-value ${avg > 0 ? 'text-gradient-blue' : ''}`;
    if (avg < 0) el.style.color = 'var(--negative)';
}

// 
// ==============================================
// WATCHLIST LOGIC
// ==============================================
//
function toggleWatchlist(coinId, btnElement) {
    const index = watchlist.indexOf(coinId);
    if (index === -1) {
        watchlist.push(coinId);
        btnElement.classList.add('active');
    } else {
        watchlist.splice(index, 1);
        btnElement.classList.remove('active');
    }
    
    localStorage.setItem('cryptoWatchlist', JSON.stringify(watchlist));
    updateWatchlistCount();
    
    // If currently filtering by watchlist, re-render
    if (currentFilter === 'watchlist') {
        renderTable();
    }
}

function updateWatchlistCount() {
    document.getElementById('watchlist-count').innerText = watchlist.length;
}

// 
// ==============================================
// AUTO REFRESH LOGIC
// ==============================================
//
function setupAutoRefresh() {
    const select = document.getElementById('refresh-select');
    const countdownEl = document.getElementById('countdown-timer');
    
    let secondsLeft = 0;
    
    const startCountdown = (totalSeconds) => {
        clearInterval(autoRefreshInterval);
        clearInterval(countdownInterval);
        
        secondsLeft = totalSeconds;
        countdownEl.innerText = `${secondsLeft}s`;
        countdownEl.classList.remove('hidden');
        
        countdownInterval = setInterval(() => {
            secondsLeft--;
            countdownEl.innerText = `${secondsLeft}s`;
            if (secondsLeft <= 0) {
                secondsLeft = totalSeconds;
                fetchMarketData();
            }
        }, 1000);
    };
    
    const stopCountdown = () => {
        clearInterval(autoRefreshInterval);
        clearInterval(countdownInterval);
        countdownEl.classList.add('hidden');
    };
    
    select.addEventListener('change', (e) => {
        const val = parseInt(e.target.value);
        if (val === 0) {
            stopCountdown();
        } else {
            startCountdown(val);
        }
    });
    
    // Pause refresh when tab inactive
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(countdownInterval);
        } else {
            const val = parseInt(select.value);
            if (val !== 0) startCountdown(val);
        }
    });
}

// 
// ==============================================
// CHART.JS MINI SPARKLINE (Simulated Data)
// ==============================================
//
function renderMiniChart(canvas, dailyChange) {
    if (!canvas) return;
    
    // Simple price simulation based on 24h change to make it look realistic
    const points = 12;
    const data = [];
    let currentVal = 100;
    
    const trend = dailyChange > 0 ? 1 : -1;
    const volatility = Math.abs(dailyChange) || 1;
    
    for (let i = 0; i < points; i++) {
        // Random walk skewed by trend
        currentVal += (Math.random() - 0.5) * volatility + (trend * (volatility/points));
        data.push(currentVal);
    }
    
    const isPositive = dailyChange >= 0;
    const color = isPositive ? '#10B981' : '#EF4444';
    const gradient = canvas.getContext('2d').createLinearGradient(0, 0, 0, 60);
    gradient.addColorStop(0, isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    new Chart(canvas, {
        type: 'line',
        data: {
            labels: Array(points).fill(''),
            datasets: [{
                data: data,
                borderColor: color,
                borderWidth: 2,
                backgroundColor: gradient,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 0,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { display: false }, y: { display: false } },
            animation: false
        }
    });
}

// 
// ==============================================
// EVENT LISTENERS & EFFECTS
// ==============================================
//
function setupEventListeners() {
    // Refresh Button
    document.getElementById('refresh-btn').addEventListener('click', fetchMarketData);
    document.getElementById('error-retry-btn').addEventListener('click', fetchMarketData);
    
    // Filter Tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTable();
        });
    });
    
    // Mobile Menu
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
    
    // Search Functionality
    const searchInput = document.getElementById('coin-search');
    const searchResults = document.getElementById('search-results');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        searchResults.innerHTML = '';
        
        if (query.length < 2) {
            searchResults.classList.remove('active');
            return;
        }
        
        const matches = COINS.filter(c => c.name.toLowerCase().includes(query) || c.symbol.toLowerCase().includes(query));
        
        if (matches.length > 0) {
            searchResults.classList.add('active');
            matches.forEach(match => {
                const div = document.createElement('div');
                div.className = 'search-item';
                
                // Get price if available
                const price = marketData[match.id] ? formatPrice(marketData[match.id].usd) : '';
                
                div.innerHTML = `
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <img src="${match.logo}" width="20" style="border-radius:50%">
                        <span>${match.name}</span>
                    </div>
                    <span>${price}</span>
                `;
                searchResults.appendChild(div);
            });
        } else {
            searchResults.classList.remove('active');
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-bar')) searchResults.classList.remove('active');
    });
    
    setupAutoRefresh();
}

function initTilt() {
    VanillaTilt.init(document.querySelectorAll(".tilt-element"), {
        max: 5,
        speed: 400,
        glare: true,
        "max-glare": 0.1,
        perspective: 1000
    });
}

function initCursor() {
    const cursor = document.querySelector('.cursor');
    const cursorGlow = document.querySelector('.cursor-glow');
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        gsap.to(cursorGlow, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.3,
            ease: "power2.out"
        });
    });

    const attachHover = () => {
        document.querySelectorAll('a, button, select, input, .search-item').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    };
    
    attachHover();
    // Re-attach dynamically added elements
    const observer = new MutationObserver(attachHover);
    observer.observe(document.body, { childList: true, subtree: true });
}
