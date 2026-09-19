# 🧮 Smart Calculator — All-in-One Tool

A beautiful multi-functional calculator with themes, currency converter, and unit converter. Built with pure HTML, CSS & JavaScript — no build tools required.

## ✨ Features

### 🎨 3 Beautiful Themes
- 💎 **Glass** — Modern glassmorphism with animated blobs
- 🌙 **Dark** — Sleek minimal dark UI
- ⚡ **Neon** — Cyberpunk neon glow

Theme preference **localStorage** me save hoti hai.

### 🧮 Calculator
- Basic arithmetic (+, −, ×, ÷, %)
- Full keyboard support
- AC / DEL functions
- Safe evaluation (no `eval`)

### 💱 Currency Converter
- 30+ world currencies
- **Live exchange rates** (via open.er-api.com)
- One-click swap
- Real-time conversion

### 📏 Unit Converter
- **Length**: mm, cm, m, km, inch, foot, yard, mile, nautical mile
- **Weight**: mg, g, kg, ton, ounce, pound, stone
- **Temperature**: Celsius, Fahrenheit, Kelvin
- **Area**: mm², cm², m², km², ft², yd², acre, hectare
- **Speed**: m/s, km/h, mph, knot, ft/s
- **Time**: ms, s, min, hr, day, week, month, year

## 🚀 Live Demo
[Click here](https://your-username.github.io/calculator/)

## 🛠️ Tech Stack
- HTML5
- CSS3 (Custom Properties, Glassmorphism, Animations)
- Vanilla JavaScript (ES6+, Fetch API, Async/Await)
- Open Exchange Rate API

## 📦 Local Setup
Just open `index.html` in your browser — that's it! No build step needed.

## 🎨 Customization

### Adding a new theme
1. Open `style.css`
2. Add a new block:
```css
body[data-theme="your-theme"] {
  --bg: ...;
  --accent: ...;
  /* etc. */
}