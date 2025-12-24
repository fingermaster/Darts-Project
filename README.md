# Advanced Darts Scorer & Trainer

A professional-grade web application for darts players, featuring flexible game modes, training modules, and real-time performance tracking.

## 🎯 Key Features

- **Versatile Game Modes**: Support for 301, 501, or custom starting scores.
- **Dynamic Ruleset**: Toggle between Classic (Double-Out) and Free (Any-Out) finishing rules.
- **Smart Checkout Hints**: Real-time suggestions for finishing combinations based on the current score and rules.
- **Training Suite**: Specialized randomizers for sector practice and precision training.
- **Time Pressure Mode**: Integrated turn timer (e.g., 10s limit) with automatic "miss" (zero score) logic.
- **Configurable Penalties**: Customizable "Bust" (over-score) handling via application settings.

## 🛠 Technical Highlights

- **Custom IndexedDB Engine**: Built a declarative, schema-based wrapper for robust local data persistence and automated migrations.
- **Advanced State Management**: Handles complex game states, including turn history, undo/redo logic, and real-time timers.
- **Clean Code Architecture**: Separated business logic (scoring rules) from data access (IndexedDB) and UI layers.
- **Offline First**: Fully functional without an internet connection, ensuring data safety via local browser storage.

## 💎 Engineering Philosophy: Zero Dependencies

This project is built using **Pure Vanilla JavaScript**.
- **No Frameworks**: Built without React, Vue, or Angular to ensure maximum performance and zero overhead.
- **No External Libraries**: All logic, including the IndexedDB wrapper, game engine, and timer, is implemented from scratch.
- **Native Web APIs**: Utilizes modern browser standards like ES6 Modules, IndexedDB, and CSS Variables.

## 🚀 How to Run
1. Clone the repository.
2. Use a local server to run the project (due to ES Modules):
    - **VS Code**: Use "Live Server" extension.
    - **Node.js**: `npx serve .`
    - **Python**: `python -m http.server`
