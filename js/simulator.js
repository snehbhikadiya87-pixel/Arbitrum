// 
// ==============================================
// INITIALIZATION & SETUP
// ==============================================
//

// Lenis Smooth Scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true
});
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// State
let currentDifficulty = 2;
const difficultySlider = document.getElementById('difficulty-slider');
const difficultyDisplay = document.getElementById('difficulty-display');

// Block Data Structure
const blocks = [
    { id: 1, isMining: false },
    { id: 2, isMining: false },
    { id: 3, isMining: false }
];

// Initialize Timestamps
blocks.forEach(b => {
    document.getElementById(`time-${b.id}`).innerText = new Date().toLocaleString();
});

// 
// ==============================================
// SHA-256 CRYPTO UTILS
// ==============================================
//
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 
// ==============================================
// BLOCKCHAIN LOGIC & REACTIVITY
// ==============================================
//

// Re-calculate hash for a single block
async function updateBlock(id) {
    if (blocks[id-1].isMining) return; // Don't interfere if currently mining

    const data = document.getElementById(`data-${id}`).value;
    const prev = document.getElementById(`prev-${id}`).value;
    const nonce = document.getElementById(`nonce-${id}`).value;
    
    const combined = prev + data + nonce;
    const hash = await sha256(combined);
    
    renderHash(id, hash);
    validateBlock(id, hash);
    
    // Propagate to next block
    if (id < 3) {
        const nextId = id + 1;
        document.getElementById(`prev-${nextId}`).value = hash;
        await updateBlock(nextId);
    }
}

// Visual updates for Hash
function renderHash(id, hash) {
    const prefixLen = currentDifficulty;
    const targetPrefix = '0'.repeat(prefixLen);
    const prefixEl = document.getElementById(`hash-prefix-${id}`);
    const restEl = document.getElementById(`hash-rest-${id}`);
    
    if (hash.startsWith(targetPrefix)) {
        prefixEl.innerText = hash.substring(0, prefixLen);
        restEl.innerText = hash.substring(prefixLen);
    } else {
        prefixEl.innerText = '';
        restEl.innerText = hash;
    }
}

// Validate block and update chain UI
function validateBlock(id, hash) {
    const blockEl = document.getElementById(`block-${id}`);
    const targetPrefix = '0'.repeat(currentDifficulty);
    const isValid = hash.startsWith(targetPrefix);
    
    if (isValid) {
        blockEl.classList.remove('invalid');
        blockEl.classList.add('valid');
        if(id < 3) document.getElementById(`link-${id}`).classList.remove('broken');
    } else {
        blockEl.classList.remove('valid');
        blockEl.classList.add('invalid');
        if(id < 3) document.getElementById(`link-${id}`).classList.add('broken');
        
        // Show learning panel info if broken
        if (id > 1) {
            updateLearningPanel('error', 'Chain Broken', `Block #${id} is invalid because its data or the previous hash was altered. You must re-mine it.`);
        }
    }
}

// Add event listeners for reactive inputs
blocks.forEach(b => {
    ['data', 'nonce'].forEach(field => {
        document.getElementById(`${field}-${b.id}`).addEventListener('input', () => {
            updateBlock(b.id);
        });
    });
});

// Initial Chain Calculation
async function initChain() {
    await updateBlock(1);
    updateLearningPanel('idle', 'Ready to Mine', 'Alter data to see hashes change, or click "Mine Block" to find a valid Proof of Work.');
}

// 
// ==============================================
// ASYNC MINING ENGINE
// ==============================================
//
async function mineBlock(id) {
    const bState = blocks[id-1];
    if (bState.isMining) return;
    
    bState.isMining = true;
    updateLearningPanel('mining', `Mining Block #${id}`, `Searching for a hash starting with ${currentDifficulty} zero(s)...`);
    
    // UI Setup
    const btn = document.getElementById(`mine-btn-${id}`);
    const btnText = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.btn-spinner');
    const stats = document.getElementById(`stats-${id}`);
    const rateEl = document.getElementById(`rate-${id}`);
    const attemptsEl = document.getElementById(`attempts-${id}`);
    const data = document.getElementById(`data-${id}`).value;
    const prev = document.getElementById(`prev-${id}`).value;
    const nonceInput = document.getElementById(`nonce-${id}`);
    
    btn.disabled = true;
    btnText.innerText = 'Mining...';
    spinner.classList.remove('hidden');
    stats.classList.remove('hidden');
    
    const targetPrefix = '0'.repeat(currentDifficulty);
    let nonce = 0;
    let attempts = 0;
    const startTime = performance.now();
    let lastUITime = startTime;
    
    // Asynchronous mining loop to prevent UI freezing
    // We process chunks of hashes per frame
    const mineChunk = async () => {
        const chunkSize = 1000;
        
        for (let i = 0; i < chunkSize; i++) {
            const hash = await sha256(prev + data + nonce);
            attempts++;
            
            if (hash.startsWith(targetPrefix)) {
                // SUCCESS
                nonceInput.value = nonce;
                renderHash(id, hash);
                validateBlock(id, hash);
                
                if (id < 3) {
                    document.getElementById(`prev-${id+1}`).value = hash;
                    await updateBlock(id+1);
                }
                
                // End Mining state
                bState.isMining = false;
                btn.disabled = false;
                btnText.innerText = 'Mine Block';
                spinner.classList.add('hidden');
                updateLearningPanel('success', 'Proof of Work Complete', `Found valid hash for Block #${id} after ${attempts.toLocaleString()} attempts!`);
                return;
            }
            nonce++;
        }
        
        // Update UI periodically (every ~100ms)
        const now = performance.now();
        if (now - lastUITime > 100) {
            nonceInput.value = nonce;
            attemptsEl.innerText = attempts.toLocaleString();
            
            // Calculate simulated Hash Rate (H/s)
            const elapsedSeconds = (now - startTime) / 1000;
            const rate = Math.floor(attempts / elapsedSeconds);
            rateEl.innerText = rate.toLocaleString();
            
            // Update hash visual for effect (just the last one of the chunk)
            const previewHash = await sha256(prev + data + nonce);
            document.getElementById(`hash-rest-${id}`).innerText = previewHash;
            
            lastUITime = now;
        }
        
        // Yield to browser event loop
        requestAnimationFrame(mineChunk);
    };
    
    mineChunk();
}

blocks.forEach(b => {
    document.getElementById(`mine-btn-${b.id}`).addEventListener('click', () => {
        mineBlock(b.id);
    });
});

// Difficulty Slider logic
difficultySlider.addEventListener('input', async (e) => {
    currentDifficulty = parseInt(e.target.value);
    difficultyDisplay.innerText = `${'0'.repeat(currentDifficulty)} (${currentDifficulty})`;
    
    updateLearningPanel('idle', 'Difficulty Changed', `Target is now ${currentDifficulty} leading zeroes. Blocks will be harder to mine.`);
    
    // Re-evaluate current chain validity based on new difficulty
    await initChain();
});

// 
// ==============================================
// LEARNING PANEL & THEME
// ==============================================
//
const panel = document.getElementById('learning-panel');
const panelTitle = document.getElementById('panel-title');
const panelDesc = document.getElementById('panel-desc');

function updateLearningPanel(state, title, desc) {
    panel.className = `learning-panel glass-panel status-${state}`;
    panelTitle.innerText = title;
    panelDesc.innerText = desc;
    
    // Slight bump animation
    gsap.fromTo(panel, { scale: 0.98 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
}

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
});

// 
// ==============================================
// EFFECTS & ANIMATIONS
// ==============================================
//

// Custom Cursor
const cursor = document.querySelector('.cursor');
document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});
document.querySelectorAll('a, button, input, textarea, .slider, .theme-toggle').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// GSAP Reveal Animations
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');
if (mobileMenu && navLinks) {
    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}
gsap.from('.edu-card', {
    y: 50, opacity: 0, duration: 0.8, stagger: 0.2,
    scrollTrigger: { trigger: ".edu-intro", start: "top 70%" }
});

gsap.from('.block-wrapper', {
    y: 50, opacity: 0, duration: 0.8, stagger: 0.3,
    scrollTrigger: { trigger: "#blockchain-container", start: "top 60%" }
});

gsap.from('.summary-glass', {
    scale: 0.9, opacity: 0, duration: 1,
    scrollTrigger: { trigger: ".summary-section", start: "top 70%" }
});

// Start the simulator
initChain();
