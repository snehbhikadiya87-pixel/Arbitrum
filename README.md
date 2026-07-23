# Web3 Educational Platform: Arbitrum & Layer 2

An interactive, educational platform designed to teach users about Web3 fundamentals, Ethereum scaling solutions, and specifically **Arbitrum** as a leading Layer 2 optimistic rollup. The project uses modern web design with dynamic animations to create an engaging learning experience.

## Features & Pages

- **Arbitrum L2 (`index.html`):** The main landing page introducing Arbitrum, explaining the "Why Layer 2?" narrative, and showcasing how optimistic rollups work to scale Ethereum without sacrificing security.
- **Web3 Fundamentals (`fundamentals.html`):** An educational page covering the basic concepts of Web3, blockchain technology, decentralization, and how they differ from traditional Web2.
- **Markets Dashboard (`dashboard.html`):** A dashboard interface to view market data, analytics, and network statistics.
- **L2 Simulator (`simulator.html`):** An interactive simulator demonstrating how Layer 2 transactions are batched and submitted to the Ethereum mainnet, highlighting the cost and speed benefits.

## Technologies Used

- **HTML5 & CSS3:** Semantic markup and modern, responsive styling with custom CSS variables, flexbox, and CSS Grid.
- **Vanilla JavaScript:** For interactive elements, DOM manipulation, and simulator logic.
- **GSAP (GreenSock Animation Platform):** For complex scroll-triggered animations, page transitions, and UI micro-interactions.
- **Lenis:** For smooth scrolling experiences across the platform.
- **Vanilla Tilt:** For 3D tilt effects on cards and interactive elements.

## Getting Started

1. Clone or download this repository to your local machine.
2. Since this is a vanilla frontend project, no build tools or package managers (`npm`, `yarn`) are required.
3. You can simply open `index.html` in any modern web browser to start exploring the platform.
4. *Recommended:* For the best experience (especially to avoid any CORS issues if fetching data), serve the directory using a local development server like VS Code's "Live Server" extension, or run `npx serve .` / `python -m http.server` in the root directory.

## Project Structure

```text
├── index.html          # Main landing page for Arbitrum L2
├── fundamentals.html   # Web3 basics and educational content
├── dashboard.html      # Market data and analytics dashboard
├── simulator.html      # Interactive L2 transaction simulator
├── css/                # Dedicated stylesheets for components and pages
│   ├── landing.css
│   ├── fundamentals.css
│   ├── simulator.css
│   └── ...
└── js/                 # JavaScript logic for animations and interactions
    ├── dashboard.js
    ├── fundamentals.js
    ├── simulator.js
    └── ...
```
