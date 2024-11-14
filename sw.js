// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');
    event.waitUntil(
        caches.open('mi-app-v1').then((cache) => {
            return cache.addAll([
                './index.html',
                './manifest.json',
                './images/images-removebg-preview.ico'
            ]).catch((error) => {
                console.error('Error al agregar archivos al caché:', error);
            });
        })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    const cacheWhitelist = ['mi-app-v1'];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    console.log('Service Worker activado');
});

// Interceptar solicitudes y servir desde el caché
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
