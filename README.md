# 🎲 Kniffel / Yahtzee Streak Simulator

> A high-performance, multithreaded Monte Carlo simulation exploring the extreme odds of rolling **13 consecutive Kniffels (Yahtzees)** using an optimal greedy strategy.

---

## 📌 Overview

In the classic dice game **Kniffel (Yahtzee)**, a score card contains 13 rounds. Rolling a Kniffel (5 of a kind) in a single round is already rare (~4.603% chance across up to 3 rolls). Rolling **13 Kniffels in a row** without failing a single round is an astronomical challenge with odds of approximately **1 in 357 quadrillion ($3.57 \times 10^{17}$)**.

This project simulates millions of games in real time using a dedicated Web Worker, tracking the exact number of physical dice rolls, stopwatch calculation time, and the equivalent **human tabletop playtime** (at 6 seconds per roll).

---

## 🎯 Game Rules & Greedy Strategy

Each simulated game follows the strict rules of Kniffel / Yahtzee with an automated greedy decision engine (`src/core/kniffelEngine.ts`):

1. **Target:** Achieve a streak of 13 consecutive successful Kniffels (Rounds 1 through 13).
2. **Per-Round Limit:** Up to 3 rolls with 5 six-sided dice ($d6$). If 5 identical dice are rolled on Roll 1, 2, or 3, the round is won immediately.
3. **Strict Termination:** If all 3 rolls are exhausted without achieving 5 of a kind, the game **aborts immediately** with streak 0 (or the current streak count).
4. **Greedy Decision Algorithm:**
   - Count the frequency of each die face (1–6).
   - Keep all dice of the most frequent face; re-roll the rest.
   - **Tie-Breaking:** If multiple numbers appear with the same frequency (e.g., two 3s and two 6s), keep the higher face value.
   - **All Unique:** If all 5 dice show different values (e.g., 1-2-3-4-5), keep 1 die with the highest face value (5 or 6).

---

## 📊 Stochastic Odds & Probabilities

| Streak Goal | Consecutive Kniffels | Theoretical Probability ($p^k$) | Approximate Odds |
| :---: | :---: | :---: | :---: |
| **1** | 1 Kniffel | $4.603 \times 10^{-2}$ | $1 : 22$ |
| **2** | 2 in a row | $2.119 \times 10^{-3}$ | $1 : 472$ |
| **3** | 3 in a row | $9.754 \times 10^{-5}$ | $1 : 10{,}252$ |
| **4** | 4 in a row | $4.490 \times 10^{-6}$ | $1 : 222{,}720$ |
| **5** | 5 in a row | $2.067 \times 10^{-7}$ | $1 : 4.84 \text{ Million}$ |
| **6** | 6 in a row | $9.513 \times 10^{-9}$ | $1 : 105 \text{ Million}$ |
| **7** | 7 in a row | $4.379 \times 10^{-10}$ | $1 : 2.28 \text{ Billion}$ |
| **8** | 8 in a row | $2.016 \times 10^{-11}$ | $1 : 49.6 \text{ Billion}$ |
| **9** | 9 in a row | $9.278 \times 10^{-13}$ | $1 : 1.08 \text{ Trillion}$ |
| **10** | 10 in a row | $4.271 \times 10^{-14}$ | $1 : 23.4 \text{ Trillion}$ |
| **11** | 11 in a row | $1.966 \times 10^{-15}$ | $1 : 509 \text{ Trillion}$ |
| **12** | 12 in a row | $9.049 \times 10^{-17}$ | $1 : 11.0 \text{ Quadrillion}$ |
| **13 🏆** | **13 in a row** | **$4.165 \times 10^{-18}$** | **$1 : 240 \text{ Quadrillion}$** |

---

## ⚡ Architecture & Features

### 1. Dedicated Multi-threaded Web Worker
- High-throughput Monte Carlo simulations run inside `simulation.worker.ts` off the main thread.
- Aggregated updates are batched and posted to the UI at **60 FPS**, maintaining fluid responsiveness with zero UI stutter even at hundreds of thousands of games per second.

### 2. Exact Roll & Playtime Synchronicity
- Every physical dice roll performed across all active parallel games is strictly tracked.
- **Human Playtime** is derived directly via:
  $$\text{Human Playtime (seconds)} = \text{totalRolls} \times 6\text{s}$$
  (accounting for real tabletop cup shaking, rolling, and die sorting).
- Displays dynamically as seconds, minutes, hours, days, years, or millions/billions of years without UI jumping or wrapping.

### 3. Simulation Controls & Speed Modes
- **Level 1 (Slow):** Detailed step-by-step visual animation (~400ms/roll) showing locked dice and greedy choices.
- **Level 2 (Medium):** Balanced visual animation (~150ms/roll).
- **Level 3 (Fast):** Fast visual animation (~45ms/roll).
- **Level 4 (Turbo):** Headless multithreaded batch processing in the Web Worker.
- **Level 5 (Hyper-Speed):** Maximum CPU Monte Carlo execution loop with optimized inner loops.
- **Batch Slider:** 1 to 1,000 concurrent games per iteration with quick presets (`1`, `25`, `100`, `500`, `1000`).
- **Single Step:** Advance one individual roll step at a time for educational inspection.

### 4. Live Analytics & Visualization
- **Real-Time Histogram:** Displays empirical distribution of streaks (0 to 13) with switchable **Linear** and **Logarithmic** scales.
- **Milestones Record Table:** Automatically logs the exact stopwatch time (`performance.now()`), human playtime, roll count, and game number the very first time each streak record (1 through 13) is unlocked.
- **Bilingual Support:** Seamless toggling between German (**DE**) and English (**EN**) without state reset.
- **Theme Support:** Dark mode and Light mode toggles.

---

## 🛠️ Project Structure

```text
├── src/
│   ├── components/
│   │   ├── DiceArena.tsx          # Visual 3D dice board with lock highlights
│   │   ├── Header.tsx             # Clean navigation, branding, language & theme toggles
│   │   ├── MetricsBar.tsx         # KPI ribbon (Games, Rolls, Human Time, Stopwatch, Streak, Throughput)
│   │   ├── MilestoneTable.tsx     # Exact first-occurrence record log table (0–13)
│   │   ├── ProbabilityExplainer.tsx# Educational stochastic cards explaining the math
│   │   ├── SimulationControls.tsx # Play, single-step, reset, speed and batch sliders
│   │   └── StreakHistogram.tsx    # Empirical distribution chart with Log/Linear toggle
│   ├── core/
│   │   ├── kniffelEngine.ts       # Pure functional dice engine, greedy AI, and time formatting
│   │   └── kniffelEngine.test.ts  # Node.js unit tests for rules, greedy ties, and roll counting
│   ├── i18n/
│   │   └── translations.ts        # Complete German and English localization dictionary
│   ├── types/
│   │   └── kniffel.ts             # TypeScript types and worker message contracts
│   ├── workers/
│   │   └── simulation.worker.ts   # Web Worker batch Monte Carlo processing loop
│   ├── App.tsx                    # Root application component & worker lifecycle
│   ├── index.css                  # Global Tailwind CSS imports
│   └── main.tsx                   # React root entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/kniffel-streak-simulator.git
cd kniffel-streak-simulator

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Unit Tests

```bash
# Runs the automated test suite verifying greedy ties, game rules, and roll math
npx tsx --test src/core/kniffelEngine.test.ts
```

### Production Build

```bash
npm run build
npm run preview
```

### 🌐 GitHub Pages Deployment

The repository includes a ready-to-use GitHub Actions workflow (`.github/workflows/deploy.yml`):

1. Push your code to GitHub (`main` or `master` branch).
2. On GitHub, navigate to **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. The workflow will automatically run tests, build the project, and deploy the site.

---

## 📄 License

Apache-2.0. Feel free to use, modify, and learn from the code!
