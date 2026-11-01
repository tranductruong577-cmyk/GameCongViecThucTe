/* Dữ liệu, chuẩn hóa, lưu trữ, thời gian (giờ Việt Nam) */
let LS=null; // khóa lưu của tài khoản đang đăng nhập (đặt trong account.js)
const TYPES={day:{n:'Hằng ngày',i:'☀️'},week:{n:'Hằng tuần',i:'🗓️'},month:{n:'Hằng tháng',i:'🌙'}};
const TABS=[['day','☀️','Ngày'],['week','🗓️','Tuần'],['month','🌙','Tháng'],['streak','🔥','Điểm danh'],['shop','🎁','Quà'],['more','⚙️','Khác']];
const DEFAULT_START='2026-11-02';
const DATA_V=4;
function defaults(){return{coins:0,xp:0,quests:[
{id:1,name:'Uống đủ 2 lít nước',type:'day',coin:5,xp:10},
{id:2,name:'Học 30 phút',type:'day',coin:10,xp:20},
{id:3,name:'Dọn dẹp phòng',type:'week',coin:30,xp:50},
{id:4,name:'Đọc xong 1 cuốn sách',type:'month',coin:120,xp:200}],
rewards:[{id:5,name:'Một ly trà sữa',cost:60,got:0},{id:6,name:'Bộ đồ chơi mới',cost:500,got:0}],
checkins:[],bonus:{},log:[],tab:'day',start:DEFAULT_START,v:DATA_V}}
// Chuẩn hóa mọi dữ liệu đọc từ localStorage / mã sao lưu: thiếu trường thì bổ sung, sai kiểu thì bỏ.
function norm(o){
 const n=v=>Math.max(0,Math.round(+v)||0),s=Object.assign({},o);
 s.coins=n(o.coins);s.xp=n(o.xp);
 s.quests=(Array.isArray(o.quests)?o.quests:[]).filter(q=>q&&q.name&&TYPES[q.type]).map((q,i)=>Object.assign({},q,{id:q.id||Date.now()+i,name:String(q.name).slice(0,80),coin:n(q.coin),xp:n(q.xp)}));
 s.rewards=(Array.isArray(o.rewards)?o.rewards:[]).filter(r=>r&&r.name).map((r,i)=>Object.assign({},r,{id:r.id||Date.now()+500+i,name:String(r.name).slice(0,80),cost:Math.max(1,n(r.cost)),got:n(r.got)}));
 s.checkins=(Array.isArray(o.checkins)?o.checkins:[]).filter(x=>/^\d{4}-\d\d-\d\d$/.test(x));
 s.bonus=o.bonus&&typeof o.bonus==='object'&&!Array.isArray(o.bonus)?o.bonus:{};
 s.log=(Array.isArray(o.log)?o.log:[]).map(String).slice(0,40);
 s.start=/^\d{4}-\d\d-\d\d$/.test(o.start)?o.start:DEFAULT_START;
 if(!(o.health&&typeof o.health==='object'))delete s.health;
 s.tab=['day','week','month','streak','shop','more','health'].includes(o.tab)?o.tab:'day';
 s.v=DATA_V;return s}
let S=defaults();
let tab='day';
const save=()=>{if(!LS)return;S.tab=tab;try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}};
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const p2=n=>String(n).padStart(2,'0');
const fd=d=>d.getUTCFullYear()+'-'+p2(d.getUTCMonth()+1)+'-'+p2(d.getUTCDate());
const NOW=()=>new Date(Date.now()+252e5);
function key(t){const d=NOW();if(t==='day')return fd(d);if(t==='month')return fd(d).slice(0,7);const m=new Date(d);m.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return fd(m)}
