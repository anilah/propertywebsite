import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Injects an early inline boot script into index.html so recovery runs even
 * before the main JS bundle — and so a freshly network-fetched HTML can break
 * a controlling SW without waiting on React.
 */
function kabooRecoveryHtmlPlugin(): Plugin {
  const boot = `
(function(){
  try {
    var ua = navigator.userAgent || '';
    var phone = /iPhone|iPod/i.test(ua) || (/Android/i.test(ua) && /Mobile/i.test(ua));
    var standalone = window.matchMedia('(display-mode: standalone)').matches
      || window.matchMedia('(display-mode: fullscreen)').matches
      || window.matchMedia('(display-mode: minimal-ui)').matches
      || !!navigator.standalone;
    var root = document.documentElement;
    if (standalone || phone) {
      root.classList.add('kaboo-app-shell');
      root.classList.remove('kaboo-web');
      if (standalone) root.setAttribute('data-kaboo-standalone', '1');
    } else {
      root.classList.add('kaboo-web');
      root.classList.remove('kaboo-app-shell');
    }
    if (!('serviceWorker' in navigator)) return;
    // Desktop website: unregister only — never call update() (InvalidStateError race)
    if (!phone && !standalone) {
      navigator.serviceWorker.getRegistrations().then(function(regs){
        var had = regs.length > 0 || !!navigator.serviceWorker.controller;
        Promise.all(regs.map(function(r){ return r.unregister().catch(function(){}); })).then(function(){
          var done = window.caches
            ? caches.keys().then(function(keys){ return Promise.all(keys.map(function(k){ return caches.delete(k); })); })
            : Promise.resolve();
          done.then(function(){
            if (had && !sessionStorage.getItem('kaboo_sw_autokill')) {
              sessionStorage.setItem('kaboo_sw_autokill', '1');
              location.reload();
            }
          });
        });
      });
      return;
    }
    // Phone / installed PWA: soft update check (promise must be caught)
    navigator.serviceWorker.getRegistrations().then(function(regs){
      regs.forEach(function(r){ r.update().catch(function(){}); });
    });
  } catch (e) {}
})();`.trim()

  return {
    name: 'kaboo-recovery-html',
    transformIndexHtml(html) {
      return html.replace(
        '<head>',
        `<head>\n    <script>${boot}</script>`
      )
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (mode === 'production' && !env.VITE_API_BASE_URL?.trim()) {
    throw new Error(
      'VITE_API_BASE_URL is missing for production build. Add web/.env.production (tracked in git) or run: VITE_API_BASE_URL=https://your-api.../api npm run build'
    )
  }

  return {
    plugins: [
      react(),
      kabooRecoveryHtmlPlugin(),
      VitePWA({
        // Prompt mode keeps a waiting SW so phones/PWA can show “Update available”.
        // Desktop still unregisters via PwaUpdatePrompt + recovery HTML boot.
        selfDestroying: false,
        registerType: 'prompt',
        includeAssets: [
          'favicon.svg',
          'favicon.png',
          'apple-touch-icon.png',
          'logo_kaboohomes.png',
          'icons/*.png',
        ],
        manifest: {
          name: 'Kaboo Homes',
          short_name: 'Kaboo Homes',
          description: "New Zealand's Premier Property Portal",
          theme_color: '#0d5c63',
          background_color: '#0d5c63',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          lang: 'en-NZ',
          categories: ['lifestyle', 'business'],
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icons/maskable-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/icons/maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // Do not skipWaiting — a waiting SW is what triggers the update banner.
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          // Never precache HTML — stale index.html caused the desktop shell bug.
          globIgnores: ['**/index.html'],
          navigateFallback: undefined,
          runtimeCaching: [
            {
              // Prefer live HTML on every navigation (prevents shell pin)
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'kaboo-pages',
                networkTimeoutSeconds: 3,
                expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 },
              },
            },
            {
              urlPattern: ({ url }) => url.pathname.startsWith('/api'),
              handler: 'NetworkOnly',
            },
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'images',
                expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 14 },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api': {
          target: 'https://6bkc76dp4c.execute-api.ap-south-1.amazonaws.com',
          changeOrigin: true,
        },
      },
    },
  }
})
