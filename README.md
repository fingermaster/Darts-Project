# Advanced Darts Scorer & Trainer

A professional-grade web application for darts players, featuring flexible game modes, training modules, and real-time performance tracking. Now with full mobile support and PWA capabilities.

## 🎯 Key Features

- **Cross-Platform Support**: Optimized for both Desktop (keyboard-centric) and Mobile (touch-interactive) experiences.
- **Versatile Game Modes**: Support for 301, 501, or custom starting scores.
- **Dynamic Ruleset**: Toggle between Classic (Double-Out) and Free (Any-Out) finishing rules.
- **Smart Checkout Hints**: Real-time suggestions for finishing combinations based on the current score and rules.
- **Training Suite**: Specialized randomizers for sector practice and precision training.
- **Time Pressure Mode**: Integrated turn timer (e.g., 10s limit) with automatic "miss" (zero score) logic.
- **PWA Ready**: Includes a web manifest for installation on mobile devices.

## 🛠 Technical Highlights

- **Adaptive Input Engine**: Automatically detects device type to provide either a high-precision vector dartboard (touch) or a rapid-entry selector (keyboard).
- **Custom IndexedDB Engine**: Built a declarative, schema-based wrapper for robust local data persistence and automated migrations.
- **Advanced State Management**: Handles complex game states, including turn history, undo/redo logic, and real-time timers.
- **Clean Code Architecture**: Separated business logic from the UI layer with reactive-like state updates via CSS variables and class toggles.
- **Zero Dependencies**: Built with **Pure Vanilla JavaScript**. No frameworks, no external libraries — just modern Web APIs (ES6+, IndexedDB, Web Manifest).

## 🎮 Controls & Interaction

### 📱 Mobile & Touch Devices
- **Interactive Dartboard**: A full-scale vector board for intuitive point entry. Simply tap the desired segment.
- **Mobile-First UI**: Responsive layouts designed for one-handed operation.

### ⌨️ Desktop Keyboard Controls
The game supports full keyboard control for selecting segments, making throws, and navigating settings.

| Key Combination           | Action                                                                                |
|---------------------------|---------------------------------------------------------------------------------------|
| Arrows (`←` `→` `↑` `↓`)	 | Navigate the segments and multipliers on the dartboard.                               |
| `Enter` / `NumpadEnter`	  | Confirm the selected segment and multiplier (make a throw).                           |
| `Space`	                  | Throw in the "miss" area (0 points, x1 multiplier).                                   |
| `Backspace`	              | Cancel the last recorded throw.                                                       |
| `Digit1` / `Digit2`	      | Quickly switch the first player in settings (P1 / P2).                                |
| `Pause`                   | Pause/resume the throw timer.                                                         |
| NumpadDivide (`/`)	       | Reset the random generator settings ("Random All").                                   |
| NumpadMultiply (`*`)      | Select a random sector ("Random Sector").                                             |
| Numpad `0-9`              | Select a specific sector on the board (e.g., Numpad1 selects sector 1, Numpad0 - 10). |
| `Shift` + `Numpad digit`	 | Select a sector + 10 points (e.g., Shift+Numpad1 selects 11).                         |
| Mouse Wheel	              | Rotates the selector wheel                                                            |

> [!IMPORTANT]
> **Numpad & Shift Modifier**
> When **Num Lock is ON**, Windows suppresses the `Shift` signal for Numpad keys to provide legacy navigation (e.g., treating `Shift + Numpad 1` as `End`). To use Numpad shortcuts with Shift in this application, please ensure **Num Lock is OFF**.

## 🚀 Live Demo
You can try the application here: **[Launch App](https://fingermaster.github.io/Darts-Project/)**

## 🛠 How to Run Locally
1. Clone the repository.
2. Use a local server to run the project (due to ES Modules):
   - **VS Code**: Use "Live Server" extension.
   - **Node.js**: `npx serve .`
   - **Python**: `python -m http.server`

