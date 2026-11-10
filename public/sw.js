// Service worker minimo: so existe para o navegador oferecer "instalar app".
// Nao guarda nada em cache, entao o app sempre mostra a versao e os dados mais novos.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
