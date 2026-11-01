/* Đăng ký service worker để dùng ngoại tuyến (chỉ khi chạy qua http/https) */
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){
  addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
