// Service Worker — Quỹ Nhóm
// Mục đích: cache app shell (HTML/CSS/JS tĩnh) để mở app nhanh hơn lần sau
// và app vẫn mở được (giao diện) khi mất mạng tạm thời.
// Dữ liệu giao dịch luôn lấy từ Firestore qua mạng — KHÔNG cache dữ liệu.

const CACHE_NAME = 'quynhom-shell-v1';
const SHELL_FILES = [
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Không can thiệp request tới Firebase/Firestore — luôn lấy dữ liệu mới nhất
  if (url.hostname.includes('firestore') || url.hostname.includes('googleapis') || url.hostname.includes('gstatic')) {
    return;
  }

  // App shell: cache-first, fallback network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => caches.match('./index.html'));
    })
  );
});
