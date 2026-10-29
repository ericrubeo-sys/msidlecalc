// Provider URLs are deliberately passed by the caller: this scene has no game
// data dependency and sends no screenshot or OCR information to the provider.
export function mountMonsterLoader(root, {sprites = []} = {}) {
  if (!root || typeof root.replaceChildren !== 'function') {
    throw new TypeError('A container is required for the monster loading scene.');
  }

  const scene = document.createElement('div');
  scene.className = 'monster-loader';
  scene.setAttribute('aria-hidden', 'true');
  scene.dataset.active = 'false';
  scene.dataset.visible = 'false';
  scene.dataset.assets = 'pending';
  scene.innerHTML = '<div class="monster-loader__haze"></div><div class="monster-loader__cloud monster-loader__cloud--one"></div><div class="monster-loader__cloud monster-loader__cloud--two"></div><div class="monster-loader__hill monster-loader__hill--far"></div><div class="monster-loader__hill monster-loader__hill--near"></div><div class="monster-loader__route"><div class="monster-loader__carriage"><div class="monster-loader__party"></div></div></div><div class="monster-loader__ground"></div><i class="monster-loader__grass monster-loader__grass--one"></i><i class="monster-loader__grass monster-loader__grass--two"></i><i class="monster-loader__glint"></i>';
  const party = scene.querySelector('.monster-loader__party');
  const usableSprites = sprites.slice(0, 3).filter(sprite => sprite && typeof sprite.url === 'string');
  const actors = usableSprites.map((sprite, index) => {
    const actor = document.createElement('div');
    actor.className = `monster-loader__actor monster-loader__actor--${index + 1}`;
    actor.dataset.gait = ['hop', 'waddle', 'trot'].includes(sprite.gait) ? sprite.gait : 'waddle';
    actor.dataset.loaded = 'false';
    actor.dataset.failed = 'false';
    actor.dataset.timedOut = 'false';
    const shadow = document.createElement('span');
    shadow.className = 'monster-loader__shadow';
    const facing = document.createElement('div');
    facing.className = 'monster-loader__facing';
    if (sprite.faces === 'right') facing.dataset.nativeFacing = 'right';
    const gait = document.createElement('div');
    gait.className = 'monster-loader__gait';
    const image = document.createElement('img');
    image.alt = '';
    image.decoding = 'async';
    image.draggable = false;
    image.referrerPolicy = 'no-referrer';
    if (Number.isFinite(sprite.width)) image.style.width = `${Math.max(16, Math.min(72, sprite.width))}px`;
    if (Number.isFinite(sprite.height)) image.style.height = `${Math.max(16, Math.min(72, sprite.height))}px`;
    gait.append(image);
    facing.append(gait);
    actor.append(shadow, facing);
    party.append(actor);
    return {actor, image, url: sprite.url};
  });
  root.replaceChildren(scene);
  root.hidden = true;

  let active = false;
  let destroyed = false;
  let requested = false;
  let inView = true;
  let timeout;
  const updateMotion = () => {
    scene.dataset.visible = String(active && inView && !document.hidden);
  };
  const updateAssets = () => {
    const loaded = actors.filter(({actor}) => actor.dataset.loaded === 'true').length;
    const pending = actors.some(({actor}) => actor.dataset.loaded !== 'true' && actor.dataset.failed !== 'true' && actor.dataset.timedOut !== 'true');
    scene.dataset.assets = loaded ? 'ready' : pending ? 'pending' : 'failed';
    if (!pending) clearTimeout(timeout);
  };
  const failPending = () => {
    for (const {actor} of actors) {
      if (actor.dataset.loaded !== 'true') actor.dataset.timedOut = 'true';
    }
    updateAssets();
  };
  for (const {actor, image} of actors) {
    image.onload = () => {
      if (destroyed || actor.dataset.failed === 'true') return;
      if (!image.naturalWidth || !image.naturalHeight) {
        actor.dataset.failed = 'true';
      } else {
        actor.dataset.loaded = 'true';
        actor.dataset.timedOut = 'false';
      }
      updateAssets();
    };
    image.onerror = () => {
      if (destroyed) return;
      actor.dataset.failed = 'true';
      updateAssets();
    };
  }
  const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    inView = entries.some(entry => entry.isIntersecting);
    updateMotion();
  }) : null;
  observer?.observe(scene);
  document.addEventListener('visibilitychange', updateMotion);

  return {
    start() {
      if (destroyed) return;
      active = true;
      root.hidden = false;
      scene.dataset.active = 'true';
      updateMotion();
      if (!requested) {
        requested = true;
        for (const {image, url} of actors) image.src = url;
      }
      updateAssets();
      if (actors.some(({actor}) => actor.dataset.loaded !== 'true' && actor.dataset.failed !== 'true' && actor.dataset.timedOut !== 'true')) {
        clearTimeout(timeout);
        timeout = setTimeout(failPending, 3500);
      }
    },
    stop() {
      if (destroyed) return;
      active = false;
      clearTimeout(timeout);
      scene.dataset.active = 'false';
      updateMotion();
      root.hidden = true;
    },
    destroy() {
      if (destroyed) return;
      active = false;
      destroyed = true;
      clearTimeout(timeout);
      observer?.disconnect();
      document.removeEventListener('visibilitychange', updateMotion);
      for (const {image} of actors) {
        image.onload = null;
        image.onerror = null;
        image.removeAttribute('src');
      }
      root.replaceChildren();
      root.hidden = true;
    },
  };
}
