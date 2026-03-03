# Word Finder – Serverless Word Puzzle Game

A lightweight, offline-capable word puzzle game where players create as many valid words as possible from a given source word. Built entirely on the client side with React + TypeScript and deployable to any static hosting provider.

---

## ✨ Features

- **Source Word Management**  
  Add, view, and delete source words with automatic stats tracking.

- **Interactive Game Board**  
  Draggable letter tiles, shuffle functionality, and real-time validation of user-entered words.

- **Organized Word Display**  
  Found words grouped by their first letter using a tabbed interface.

- **Offline Support**  
  Full Progressive Web App (PWA) capabilities for mobile-friendly, offline gameplay.

- **Persistent Local Storage**  
  All data is saved in `localStorage`; no backend needed.

---

## 🏗️ Tech Stack

- **React 18 + TypeScript** for UI and app logic  
- **Tailwind CSS + Shadcn UI** for styling and components  
- **Wouter** for minimal client-side routing  
- **localStorage** for persistence  
- **Service Worker + Manifest** for PWA functionality

---

## 🔎 How Word Validation Works

Words submitted by the player must:

1. Be at least 2 letters long  
2. Use only letters available in the source word  
3. Not reuse any letter more times than it appears  
4. Not be a duplicate of a previously found word

---

## 📊 Word Efficiency Metrics

The game calculates multiple efficiency scores for each source word:

### Fibonacci-Based Efficiency

Measures how productively the source word generates found words based on word length weighting:

**Formula**: Efficiency = K2 ÷ K1, where:
- **K1** = Total found words ÷ Source word length (baseline ratio)
- **K2** = (Weighted sum of found words) ÷ Source word length

The weighting uses Fibonacci coefficients based on word length differences. Words that are 2 letters shorter than the source get coefficient 233, those 3 letters shorter get 144, and so on (following the Fibonacci sequence: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233). This encourages finding longer derived words over shorter ones.

### Scrabble-Style Score (Эрудит)

Each found word receives points based on letter values, similar to the board game Scrabble. This metric rewards finding words with high-value letters.

**Russian Letter Values:**
- 1 point: А Е И О
- 2 points: В К Л М Н П Р С Т
- 3 points: Б Г Д Ё Й У Я
- 5 points: Ж З Х Ч Ь Ы
- 10 points: Ф Ц Ш Щ Ю Э
- 15 points: Ъ

**English Letter Values:**
- 1 point: A E I O U L N S T R
- 2 points: D G
- 3 points: B C M P
- 4 points: F H V W Y
- 5 points: K
- 8 points: J X
- 10 points: Q Z

The total Scrabble score appears on the home page and in detailed statistics, and the game supports both Russian and English words simultaneously.

---

## ▶️ Running the Project

To run the project locally:

1. **Build the production bundle**
   ```bash
   npm run build
2. Preview the optimized build
   ```bash
   npm run preview

This launches a local preview server so you can verify the production build before deployment.

---

## 🌐 Deployment

The application is fully static and hosted on GitHub Pages.

You can access the live version here:
https://vladimirka002.github.io/wordy-game/

Deployment is done by pushing the built files (from `dist/`) to the `gh-pages` branch or using an automated GitHub Action.

---

## 🧩 Implementation Notes

- The game is entirely serverless and runs only in the browser.  
- All state (source words, found words, progress) is persisted using a simple storage utility layered over `localStorage`.  
- Designed mobile-first, ensuring usability on small screens.  
- Works well as a static deployment (GitHub Pages, Netlify, Replit Web Server, etc.).

---