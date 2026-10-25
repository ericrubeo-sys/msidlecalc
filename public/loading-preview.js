import { mountMonsterLoader } from './monster-loader.js';
import { LOADING_MONSTERS } from './monster-sprites.js';
const scene=mountMonsterLoader(document.querySelector('#monster-preview'),{sprites:LOADING_MONSTERS});
const toggle=document.querySelector('#toggle-motion');
let paused=false;
scene.start();
toggle.addEventListener('click',()=>{
  paused=!paused;
  // Keep the scene visible for visual review while pausing only its motion.
  document.querySelector('.monster-loader').dataset.active=String(!paused);
  toggle.textContent=paused?'Play animation':'Pause animation';
  toggle.setAttribute('aria-pressed',String(paused));
});
window.addEventListener('pagehide',()=>scene.stop());
window.addEventListener('pageshow',()=>{scene.start();if(paused) document.querySelector('.monster-loader').dataset.active='false';});
