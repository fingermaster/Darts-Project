import { Storage } from "./storage.js";
import { initGame } from "./game.js";
import './events.js';

await Storage.LastGame();
await initGame();
