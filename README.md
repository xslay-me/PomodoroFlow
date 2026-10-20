# PomodoroFlow 🍅🌱

An interactive, sleep-resilient Pomodoro focus timer with a tactile **Claymorphism** design system, gamified desk plant companion, sound alerts, and journey statistics.

Built with **React**, **TypeScript**, and **Tailwind CSS**.

---

## ✨ Features

- **Claymorphic Aesthetic UI**: Soft double shadows, rounded pillowy cards, subtle inner highlights, and soothing pastel gradients tailored for focus and relaxation.
- **Automatic Transitions**: Optionally start breaks and focus sessions automatically from Settings. Reopening an expired timer records it once and starts at most one fresh phase.
- **Classic Pomodoro Cycles**: Pre-configured with the standard 25-minute focus session, 5-minute short break, and 15-minute long rest after 4 completed rounds.
- **Sleep & Reload Resilient**: Utilizes real-time delta timestamps so your timer never freezes or resets when your laptop goes into sleep mode, tabs background, or the browser is reloaded.
- **Stop, Resume & Skip Controls**: Full user control with tactile clay buttons to start, pause, resume, step forward, or add quick 5-minute extensions.
- **Gamified Clay Companion**: Earn XP and focus seeds with every session. Watch your seedling evolve through 5 growth stages (*Pebble Seedling* ➔ *Clay Sprout* ➔ *Chubby Succulent* ➔ *Pastel Lotus* ➔ *Zen Bonsai Master*). Tap your plant companion for encouraging words!
- **8 Unlockable Trophies**: Earn milestone badges for streaks, session volume, evening study, and plant care.
- **Synthesized Web Audio Alerts**: Built-in chime bells (*Zen Bell (528Hz)*, *Clay Marimba*, *Digital Chime*, *Meditation Gong*) generated completely offline with zero external audio assets.
- **Focus Reminder**: A visual reminder to silence notifications before focusing. Browser and operating-system notifications remain under your control.
- **Full-Screen Zen Mode**: Clean, distraction-free overlay for maximum focus immersion.
- **Full User Statistics Dashboard**: Displays key performance metrics in one comprehensive claymorphic view:
  - **Total Focused Time**: Aggregate deep work hours and minutes.
  - **Completed Pomodoro Sessions**: Total count of completed cycles.
  - **Longest Consecutive Streak**: All-time record streak tracking alongside your current active streak.
  - **Daily & Weekly Session Counts**: Day-by-day table and 7-day columnar chart with quick toggle between *Sessions Count* and *Focus Minutes*.
  - **Interactive Category Filtering**: Breakdown by tags (`#Study`, `#Code`, `#Write`, `#Read`, `#Work`) and recent session history log.
  - **One-Click Demo Seeder & Reset**: Test the dashboard charts immediately with realistic sample history.
- **Dark Mode Support**: Velvety clay night mode palette that can be toggled directly from the header or settings menu.
- **100% Client-Side Persistence**: Timer transitions and history are saved together in IndexedDB and synchronized across tabs. Existing localStorage history migrates automatically; settings remain in localStorage. Browser storage must be available to save progress.

---

## 🎨 Claymorphism Design System

PomodoroFlow uses custom claymorphic elevation layers defined in `src/index.css`:
- **Dual Directional Shadows**: Diffuse dark drop shadows on the bottom-right paired with soft white diffuse highlights on the top-left to create depth.
- **Inner Inset Lighting**: Subtle inset highlights on the upper rim that simulate soft, malleable clay surfaces.
- **Tactile Pressed Physics**: Buttons smoothly compress inward on click (`active:scale-98`) with intensified inset shadows.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (Node 22 recommended)
- npm or yarn / pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/pomodoroflow.git
cd pomodoroflow
```

2. Install dependencies:
```bash
npm install
```

3. Start the local development server:
```bash
npm run dev
```

Open your browser at `http://localhost:3000`.

### Running Unit Tests

Run the built-in fast unit tests covering the timer calculations, sleep delta math, rewards engine, and streak tracking:

```bash
npx tsx --test src/utils/*.test.ts
```

### Production Build

```bash
npm run build
```

---

## 📁 Architecture & Project Structure

```
├── src/
│   ├── components/
│   │   ├── Header.tsx                 # Top brand bar, streak pill, theme & modal triggers
│   │   ├── TimerDisplay.tsx           # Circular clay SVG gauge, digital clock, round beads
│   │   ├── PlantCompanion.tsx         # Interactive SVG clay desk plant with speech bubbles
│   │   ├── FocusShieldBanner.tsx      # Visual reminder to silence notifications
│   │   ├── StatsModal.tsx             # 7-day activity chart, streak tracker & tag breakdown
│   │   ├── AchievementsModal.tsx      # Clay trophy cabinet & milestone unlocks
│   │   ├── SettingsModal.tsx          # Cycle duration inputs, chime selectors & dark mode
│   │   └── DistractionFreeOverlay.tsx # Minimalist zen fullscreen mode
│   ├── types/
│   │   └── pomodoro.ts                # TypeScript interfaces and type definitions
│   ├── utils/
│   │   ├── appState.ts                # Atomic IndexedDB state and localStorage migration
│   │   ├── sessionState.ts            # Session crediting and timer state transitions
│   │   ├── timerUtils.ts              # Sleep resilience calculation & phase transition logic
│   │   ├── rewardsEngine.ts           # Plant growth stages, XP formula & badge checkers
│   │   ├── statsCalculator.ts         # Streak calculation, daily history & tag metrics
│   │   ├── soundEffects.ts            # Offline Web Audio API tone generator
│   │   └── storage.ts                 # Legacy persistence and settings
│   ├── App.tsx                        # Main state orchestrator
│   ├── index.css                      # Tailwind v4 claymorphism design tokens
│   └── main.tsx                       # React application entry point
├── CONTRIBUTING.md                    # Guidelines for contributing to the repository
├── LICENSE                            # MIT License
└── package.json
```

---

## ⌨️ Shortcuts & Tips

- **Start / Pause**: Click the central clay button to begin or pause.
- **+5m**: Quickly add 5 minutes to an ongoing session when you're in the zone.
- **Plant Interaction**: Click on your clay companion anytime for cheer and encouraging quotes!
- **Zen Mode**: Click the fullscreen icon in the top header or press `Esc` to return.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Please check out [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and development workflow.

---

## 📄 License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.
