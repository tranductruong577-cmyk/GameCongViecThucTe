/* Service worker: lưu sẵn tệp của app và phông chữ để chạy ngoại tuyến.
   Khi sửa code, hãy tăng số phiên bản CACHE để máy người dùng nhận bản mới. */
const CACHE='questboard-v6';
const FILES=['./','index.html','style.css','manifest.json','assets/icon.png','assets/icon-192.png','assets/icon-512.png','assets/avatar.jpg',
  'js/core.js','js/account.js','js/audio.js','js/fx.js','js/health.js','js/views.js','js/app.js','js/pwa.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url),font=/(^|\.)(googleapis|gstatic)\.com$/.test(u.hostname);
  if(u.origin!==location.origin&&!font)return;
  // Cache trước, đồng thời cập nhật ngầm từ mạng (stale-while-revalidate)
  e.respondWith(caches.open(CACHE).then(c=>c.match(r,{ignoreSearch:true}).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>hit);
    return hit||net;
  })));
});
