import { mountMonsterLoader } from './monster-loader.js';
import { LOADING_MONSTERS } from './monster-sprites.js';
const scene=mountMonsterLoader(document.querySelector('#monster-preview'),{sprites:LOADING_MONSTERS});
scene.start();
window.addEventListener('pagehide',()=>scene.stop());
window.addEventListener('pageshow',()=>scene.start());
