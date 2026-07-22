// 
// ==============================================
// INITIALIZATION & SETUP
// ==============================================
//

// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
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
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

// 
// ==============================================
// CUSTOM CURSOR
// ==============================================
//
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');
const links = document.querySelectorAll('a, button, .accordion-header, .btn');

document.addEventListener('mousemove', (e) => {
    // Immediate cursor
    gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out"
    });
    
    // Smooth follower
    gsap.to(cursorFollower, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: "power2.out"
    });
});

// Cursor Hover Effects
links.forEach(link => {
    link.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
    });
    
    link.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
    });
});

// 
// ==============================================
// NAVBAR EFFECTS
// ==============================================
//
const navbar = document.querySelector('.navbar');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// 
// ==============================================
// HERO BLOCKCHAIN ANIMATION
// ==============================================
//
const orbitContainer = document.querySelector('.orbit-container');
const numNodes = 12;

for (let i = 0; i < numNodes; i++) {
    const node = document.createElement('div');
    
    // Style the node
    node.style.position = 'absolute';
    node.style.width = '12px';
    node.style.height = '12px';
    node.style.backgroundColor = i % 2 === 0 ? 'var(--color-accent-cyan)' : 'var(--color-accent-purple)';
    node.style.borderRadius = '50%';
    node.style.boxShadow = `0 0 10px ${i % 2 === 0 ? 'rgba(0, 240, 255, 0.8)' : 'rgba(144, 64, 255, 0.8)'}`;
    
    // Calculate position on a circle
    const angle = (i / numNodes) * Math.PI * 2;
    const radius = 120 + Math.random() * 40; // Randomize radius slightly
    
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const z = (Math.random() - 0.5) * 100; // 3D depth
    
    node.style.left = `calc(50% + ${x}px)`;
    node.style.top = `calc(50% + ${y}px)`;
    node.style.transform = `translateZ(${z}px)`;
    
    orbitContainer.appendChild(node);
    
    // Add connecting lines randomly
    if (i > 0 && Math.random() > 0.3) {
        // Complex to draw lines in pure DOM without SVG/Canvas, 
        // we'll rely on the nodes floating to give the blockchain feel.
    }
}

// 
// ==============================================
// FLOATING PARTICLES BACKGROUND
// ==============================================
//
const particlesContainer = document.getElementById('particles');
const numParticles = 40;

for (let i = 0; i < numParticles; i++) {
    const particle = document.createElement('div');
    
    const size = Math.random() * 4 + 1;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    particle.style.background = Math.random() > 0.5 ? 'var(--color-accent-cyan)' : 'var(--color-accent-purple)';
    particle.style.borderRadius = '50%';
    particle.style.position = 'absolute';
    particle.style.opacity = Math.random() * 0.5 + 0.1;
    particle.style.filter = 'blur(1px)';
    
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    
    particle.style.left = `${startX}vw`;
    particle.style.top = `${startY}vh`;
    
    particlesContainer.appendChild(particle);
    
    // Animate particle
    gsap.to(particle, {
        y: `+=${Math.random() * 200 - 100}`,
        x: `+=${Math.random() * 200 - 100}`,
        opacity: Math.random() * 0.5 + 0.1,
        duration: Math.random() * 10 + 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });
}

// 
// ==============================================
// GSAP SCROLL ANIMATIONS
// ==============================================
//

// Hero Parallax
gsap.to('.hero-visual', {
    yPercent: 30,
    ease: "none",
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});

// Why L2 Cards Stagger
gsap.from('.bottleneck-grid .glass-card', {
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    scrollTrigger: {
        trigger: ".why-l2",
        start: "top 70%",
        toggleActions: "play none none reverse"
    }
});

// What is Arbitrum Slide
gsap.from('.what-is-arbitrum .content-side', {
    x: -50,
    opacity: 0,
    duration: 1,
    scrollTrigger: {
        trigger: ".what-is-arbitrum",
        start: "top 70%",
    }
});

gsap.from('.what-is-arbitrum .visual-side', {
    x: 50,
    opacity: 0,
    duration: 1,
    scrollTrigger: {
        trigger: ".what-is-arbitrum",
        start: "top 70%",
    }
});

// Timeline Animation
const timelineItems = document.querySelectorAll('.timeline-item');
timelineItems.forEach((item, i) => {
    gsap.to(item, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse"
        }
    });
});

// Benefits Cards Stagger
gsap.from('.benefit-card', {
    y: 50,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    scrollTrigger: {
        trigger: ".benefits",
        start: "top 70%",
        toggleActions: "play none none reverse"
    }
});

// Use Cases Zoom In
gsap.from('.use-case-card', {
    scale: 0.9,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    scrollTrigger: {
        trigger: ".use-cases",
        start: "top 70%",
        toggleActions: "play none none reverse"
    }
});

// Compare Table Slide Up
gsap.from('.compare-table', {
    y: 50,
    opacity: 0,
    duration: 1,
    scrollTrigger: {
        trigger: ".comparison",
        start: "top 75%",
    }
});

// 
// ==============================================
// ANIMATED COUNTERS
// ==============================================
//
const counters = document.querySelectorAll('.counter');

counters.forEach(counter => {
    counter.innerText = '0';
    
    const updateCounter = () => {
        const target = +counter.getAttribute('data-target');
        const c = +counter.innerText;
        
        const increment = target / 50; // Speed of counter
        
        if (c < target) {
            counter.innerText = `${Math.ceil(c + increment)}`;
            setTimeout(updateCounter, 30);
        } else {
            counter.innerText = target;
        }
    };

    ScrollTrigger.create({
        trigger: ".stats",
        start: "top 80%",
        once: true,
        onEnter: () => {
            updateCounter();
        }
    });
});

// 
// ==============================================
// FAQ ACCORDION
// ==============================================
//
const accordionHeaders = document.querySelectorAll('.accordion-header');

accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const item = header.parentElement;
        
        // Close others
        const currentlyActive = document.querySelector('.accordion-item.active');
        if (currentlyActive && currentlyActive !== item) {
            currentlyActive.classList.remove('active');
        }
        
        // Toggle current
        item.classList.toggle('active');
    });
});

// 
// ==============================================
// VANILLA TILT INIT
// ==============================================
//
VanillaTilt.init(document.querySelectorAll(".tilt-card"), {
    max: 10,
    speed: 400,
    glare: true,
    "max-glare": 0.2,
    perspective: 1000
});

// 
// ==============================================
// ACTIVE NAV LINK UPDATE ON SCROLL
// ==============================================
//
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').includes(current) && current !== '') {
            item.classList.add('active');
        }
    });
});
