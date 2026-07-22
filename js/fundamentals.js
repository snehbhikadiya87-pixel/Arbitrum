// 
// ==============================================
// INITIALIZATION & SETUP
// ==============================================
//

// Initialize Lenis Smooth Scroll
let lenis = null;
try {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        if (lenis) lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
} catch (e) {
    console.warn('Lenis scroll library failed to initialize:', e);
}

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

// 
// ==============================================
// CUSTOM CURSOR
// ==============================================
//
const cursor = document.querySelector('.cursor');
const interactables = document.querySelectorAll('a, button, .tilt-card, .comp-col, .arch-box, .option-btn');

if (cursor) {
    document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: "power2.out"
        });
    });
}

interactables.forEach(el => {
    el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
    });
});

// 
// ==============================================
// HEADER EFFECTS
// ==============================================
//
const header = document.querySelector('.header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// 
// ==============================================
// GSAP SCROLL ANIMATIONS
// ==============================================
//

// Hero Animations
gsap.to('.hero-visual', {
    yPercent: 20,
    ease: "none",
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});

// Cards Stagger (What is Web3)
gsap.from('.intro-section .glass-card', {
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".intro-section",
        start: "top 70%",
        toggleActions: "play none none reverse"
    }
});

// Web2 vs Web3 Split
gsap.from('.web2-col', {
    x: -50,
    opacity: 0,
    duration: 1,
    scrollTrigger: {
        trigger: ".web-comparison",
        start: "top 60%"
    }
});
gsap.from('.web3-col', {
    x: 50,
    opacity: 0,
    duration: 1,
    scrollTrigger: {
        trigger: ".web-comparison",
        start: "top 60%"
    }
});

// ETH vs BTC Cards
gsap.from('.crypto-card', {
    scale: 0.95,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".crypto-comparison",
        start: "top 65%"
    }
});

// Keys Flow
gsap.from('.flow-step', {
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".keys-explainer",
        start: "top 75%"
    }
});

// Table Rows
gsap.from('.table-row', {
    x: -20,
    opacity: 0,
    duration: 0.4,
    stagger: 0.1,
    scrollTrigger: {
        trigger: ".comparison-table",
        start: "top 80%"
    }
});

// Summary Cards
gsap.from('.summary-card', {
    y: 40,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    scrollTrigger: {
        trigger: ".summary-section",
        start: "top 75%"
    }
});

// Bottleneck Cards
gsap.from('.bottleneck-card', {
    scale: 0.9,
    opacity: 0,
    duration: 0.6,
    stagger: 0.15,
    scrollTrigger: {
        trigger: ".bottleneck-cards",
        start: "top 70%"
    }
});

// Bottleneck Solution
gsap.from('.bottleneck-solution', {
    y: 50,
    opacity: 0,
    duration: 0.8,
    scrollTrigger: {
        trigger: ".bottleneck-solution",
        start: "top 75%"
    }
});

// 
// ==============================================
// VANILLA TILT INIT
// ==============================================
//
const tiltCards = document.querySelectorAll(".tilt-card");
const tiltElements = document.querySelectorAll(".tilt-element");

if (tiltCards.length > 0 && window.VanillaTilt) {
    VanillaTilt.init(tiltCards, {
        max: 8,
        speed: 400,
        glare: true,
        "max-glare": 0.1,
        perspective: 1000
    });
}

if (tiltElements.length > 0 && window.VanillaTilt) {
    VanillaTilt.init(tiltElements, {
        max: 15,
        speed: 300,
        perspective: 500
    });
}

// 
// ==============================================
// INTERACTIVE QUIZ LOGIC
// ==============================================
//
const quizData = [
    {
        question: "Which blockchain natively supports smart contracts?",
        options: ["Bitcoin", "Ethereum", "Traditional Database", "Web2"],
        correct: 1
    },
    {
        question: "Can you safely share your private key?",
        options: ["Yes, with friends", "Yes, to receive funds", "No, never share it", "Only on secure websites"],
        correct: 2
    },
    {
        question: "Is Web3 decentralized?",
        options: ["Yes, controlled by users & builders", "No, it's controlled by Google", "No, it's controlled by banks", "Yes, controlled by one company"],
        correct: 0
    },
    {
        question: "Bitcoin is primarily used as:",
        options: ["A World Computer", "Digital Gold / Store of Value", "A Database for Apps", "A Social Media Network"],
        correct: 1
    }
];

let currentQuestion = 0;
let score = 0;
let hasAnswered = false;

// Initialize Quiz when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const nextBtn = document.getElementById('next-btn');
    const feedbackText = document.getElementById('feedback');
    const currentQSpan = document.getElementById('current-q');
    const quizBody = document.querySelector('.quiz-body');
    const quizFooter = document.querySelector('.quiz-footer');
    const quizResult = document.getElementById('quiz-result');
    const scoreText = document.getElementById('score-text');
    const restartBtn = document.getElementById('restart-btn');

    // Verify all required elements exist before proceeding
    if (!questionText || !optionsContainer || !nextBtn || !feedbackText || !currentQSpan || 
        !quizBody || !quizFooter || !quizResult || !scoreText || !restartBtn) {
        console.error('Quiz elements not found in DOM');
        return;
    }

    function loadQuestion() {
        hasAnswered = false;
        const q = quizData[currentQuestion];
        questionText.innerText = q.question;
        currentQSpan.innerText = currentQuestion + 1;
        
        optionsContainer.innerHTML = '';
        feedbackText.innerText = '';
        nextBtn.style.display = 'none';
        
        q.options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.classList.add('option-btn');
            btn.innerText = opt;
            btn.addEventListener('click', () => selectOption(index, btn));
            
            // Re-attach cursor hover event
            btn.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            btn.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
            
            optionsContainer.appendChild(btn);
        });
    }

    function selectOption(selectedIndex, btnElement) {
        if (hasAnswered) return;
        hasAnswered = true;
        
        const correctIndex = quizData[currentQuestion].correct;
        const allBtns = optionsContainer.querySelectorAll('.option-btn');
        
        if (selectedIndex === correctIndex) {
            btnElement.classList.add('correct');
            feedbackText.innerText = "Correct! 🎉";
            feedbackText.style.color = "var(--accent-emerald)";
            score++;
        } else {
            btnElement.classList.add('wrong');
            feedbackText.innerText = "Incorrect.";
            feedbackText.style.color = "var(--accent-danger)";
            // Highlight correct
            allBtns[correctIndex].classList.add('correct');
        }
        
        nextBtn.style.display = 'inline-flex';
    }

    nextBtn.addEventListener('click', () => {
        currentQuestion++;
        if (currentQuestion < quizData.length) {
            loadQuestion();
        } else {
            showResults();
        }
    });

    function showResults() {
        quizBody.style.display = 'none';
        quizFooter.style.display = 'none';
        quizResult.style.display = 'block';
        
        // Animate score count
        let curr = 0;
        const interval = setInterval(() => {
            if (curr <= score) {
                scoreText.innerText = curr;
                curr++;
            } else {
                clearInterval(interval);
            }
        }, 200);
    }

    restartBtn.addEventListener('click', () => {
        currentQuestion = 0;
        score = 0;
        quizBody.style.display = 'block';
        quizFooter.style.display = 'flex';
        quizResult.style.display = 'none';
        loadQuestion();
    });

    // Init Quiz
    loadQuestion();
});
