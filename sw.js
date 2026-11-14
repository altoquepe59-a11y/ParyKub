'use strict';

const CACHE_PREFIX = 'partykub-mobile-pwa-';
const CACHE_VERSION = 'v10';
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
const CORE_ASSETS = [
  '/movil.html',
  '/manifest.json',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png',
  '/partykub-solo-intro.html',
  '/partykub-solo-intro-vertical.html',
  '/PartyKub-3d-table.js',
  '/three.min.js',
  '/supabase.min.js',
  '/Baloo2-ExtraBold.ttf',
  '/PartyKub-fondo-mesa.png',
  '/partykub-new-logo.png',
  '/PartyKub-splash-background.png',
  '/PartyKub-splash-balloon.png',
  '/PartyKub-splash-four-tile-crop.png',
  '/PartyKub-splash-hat.png',
  '/PartyKub-splash-left-tiles.png',
  '/PartyKub-splash-rainbow-ribbon.png',
  '/PartyKub-splash-star.png',
  '/PartyKub-splash-word-hd.png',
  '/PartyKub-vertical-play-button.png'
];

function versionedUrl(url) {
  const result = new URL(url, self.location.origin);
  result.searchParams.set('__pwa_cache', CACHE_VERSION);
  return result.href;
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(CORE_ASSETS.map(async (url) => {
      const response = await fetch(versionedUrl(url), { cache: 'reload' });
      if (!response.ok) throw new Error(`No se pudo precargar ${url} (${response.status}).`);
      await cache.put(new URL(url, self.location.origin).href, response);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames
      .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (
    request.method !== 'GET'
    || url.origin !== self.location.origin
    || url.pathname === '/sw.js'
    || request.headers.has('range')
  ) return;

  event.respondWith((async () => {
    if (request.mode === 'navigate') {
      if (url.pathname !== '/movil.html') return fetch(request);
    } else {
      const client = event.clientId ? await self.clients.get(event.clientId) : null;
      if (!client || new URL(client.url).pathname !== '/movil.html') return fetch(request);
    }

    const isStatic = request.mode === 'navigate'
      || ['script', 'style', 'image', 'font', 'worker', 'manifest'].includes(request.destination)
      || /\.(?:html?|css|js|mjs|json|webmanifest|png|jpe?g|webp|svg|ico|ttf|woff2?)$/i.test(url.pathname);
    if (!isStatic) return fetch(request);

    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreVary: true });
    if (cached) return cached;

    try {
      const response = await fetch(versionedUrl(request.url), { cache: 'reload' });
      if (response.ok && response.type === 'basic') await cache.put(request, response.clone());
      return response;
    } catch (error) {
      if (request.mode === 'navigate') {
        const mobileApp = await cache.match('/movil.html', { ignoreVary: true });
        if (mobileApp) return mobileApp;
      }
      throw error;
    }
  })());
});
