/* Tài khoản: đăng ký, đăng nhập, đăng xuất, đổi mật khẩu, xóa tài khoản.
   Mọi thứ lưu cục bộ trên thiết bị (localStorage). Mật khẩu không lưu thẳng: chỉ lưu bản băm PBKDF2-SHA256 kèm muối riêng.
   Dữ liệu game của mỗi tài khoản nằm ở khóa riêng 'questboard.v1.u.<tên đăng nhập>'. */
const ACCK='questboard.accounts',LEGACY='questboard.v1',DEF_AV='assets/avatar.jpg',ITER=150000;
const DATAK=u=>'questboard.v1.u.'+u;
let ACC={users:{},cur:null,adopted:false},authMode=null,authAv='',authBusy=false;
try{const a=JSON.parse(localStorage.getItem(ACCK));if(a&&a.users&&typeof a.users==='object'&&!Array.isArray(a.users))ACC={users:a.users,cur:a.cur||null,adopted:!!a.adopted}}catch(e){}
const accSave=()=>{try{localStorage.setItem(ACCK,JSON.stringify(ACC))}catch(e){}};
const me=()=>ACC.cur&&ACC.users[ACC.cur]||null;
const AV=()=>(me()&&me().avatar)||DEF_AV;
const NM=()=>(me()&&me().name)||'Người chơi';
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const unhex=h=>new Uint8Array(h.match(/../g).map(x=>parseInt(x,16)));
const rndSalt=()=>hex(crypto.getRandomValues(new Uint8Array(16)));
async function hashPw(pw,saltHex,iter){
  if(!(window.crypto&&crypto.subtle))throw new Error('nocrypto');
  const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']);
  return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:unhex(saltHex),iterations:iter,hash:'SHA-256'},k,256))
}
function loadUser(u){
  LS=DATAK(u);let d=null;try{d=JSON.parse(localStorage.getItem(LS))}catch(e){}
  S=d&&typeof d==='object'&&Array.isArray(d.quests)?norm(d):defaults();tab=S.tab||'day'
}
function legacyData(){try{const d=JSON.parse(localStorage.getItem(LEGACY));return d&&Array.isArray(d.quests)?d:null}catch(e){return null}}
if(me())loadUser(ACC.cur);else ACC.cur=null;

/* ---------- Giao diện đăng nhập / đăng ký ---------- */
const aerr=m=>{const e=$('#aerr');if(e)e.textContent=m;sfx('err')};
function authView(){
  if(!authMode)authMode=Object.keys(ACC.users).length?'login':'register';
  const head=`<div class="authlogo">🎮</div><h2>Bảng nhiệm vụ</h2>`;
  if(authMode==='login')return `<div class="card authc">${head}<p class="tag">Đăng nhập để tiếp tục hành trình của bạn.</p>
  <label for="au">Tên đăng nhập</label><input id="au" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="20">
  <label for="ap">Mật khẩu</label><input id="ap" type="password" autocomplete="current-password">
  <label class="chk"><input type="checkbox" data-showpw> Hiện mật khẩu</label>
  <div id="aerr" class="aerr" role="alert"></div>
  <div class="btns"><button data-auth="login">Đăng nhập</button></div>
  <p class="tag" style="text-align:center;margin-top:14px">Chưa có tài khoản? <button class="sec2" data-auth="mode-reg">Đăng ký</button></p></div>`;
  const lg=!ACC.adopted&&legacyData();
  return `<div class="card authc">${head}<p class="tag">Tạo nhân vật của bạn. Tài khoản và dữ liệu được lưu trên thiết bị này.</p>
  <label for="au">Tên đăng nhập</label><input id="au" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="20" placeholder="3–20 ký tự: a-z, 0-9, _">
  <label for="an">Tên nhân vật</label><input id="an" maxlength="24" placeholder="VD: TruongTD" autocomplete="nickname">
  <label>Ảnh nhân vật (không bắt buộc)</label><div class="avrow"><img id="avp" alt="Ảnh xem trước" src="${esc(authAv||DEF_AV)}"><input id="av" type="file" accept="image/*"></div>
  <label for="ap">Mật khẩu (ít nhất 6 ký tự)</label><input id="ap" type="password" autocomplete="new-password">
  <label for="ap2">Nhập lại mật khẩu</label><input id="ap2" type="password" autocomplete="new-password">
  <label class="chk"><input type="checkbox" data-showpw> Hiện mật khẩu</label>
  ${lg?`<label class="chk"><input type="checkbox" id="adopt" checked> Giữ dữ liệu game đã có trên thiết bị này (${lg.quests.length} nhiệm vụ, ${Math.round(+lg.coins||0)} xu)</label>`:''}
  <p class="tag">Lưu ý: mật khẩu không thể khôi phục. Hãy tạo mã sao lưu trong tab Khác để phòng khi mất dữ liệu.</p>
  <div id="aerr" class="aerr" role="alert"></div>
  <div class="btns"><button data-auth="register">Tạo tài khoản</button></div>
  ${Object.keys(ACC.users).length?`<p class="tag" style="text-align:center;margin-top:14px">Đã có tài khoản? <button class="sec2" data-auth="mode-log">Đăng nhập</button></p>`:''}</div>`
}
function authRender(){$('#main').innerHTML=authView();document.title='Đăng nhập';scrollTo(0,0)}

function pickAvatar(file,done){
  if(!file||!/^image\//.test(file.type))return;
  const fr=new FileReader();
  fr.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=160;const x=c.getContext('2d'),m=Math.min(im.width,im.height);x.drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,160,160);done(c.toDataURL('image/jpeg',.85))};im.onerror=()=>toast('Không đọc được ảnh');im.src=fr.result};
  fr.readAsDataURL(file)
}

async function doRegister(){
  if(authBusy)return;
  const u=$('#au').value.trim().toLowerCase(),n=$('#an').value.trim(),p=$('#ap').value,p2=$('#ap2').value;
  if(!/^[a-z0-9_]{3,20}$/.test(u))return aerr('Tên đăng nhập 3–20 ký tự: chữ không dấu, số hoặc dấu _');
  if(ACC.users[u])return aerr('Tên đăng nhập này đã có người dùng');
  if(!n)return aerr('Hãy nhập tên nhân vật');
  if(p.length<6)return aerr('Mật khẩu cần ít nhất 6 ký tự');
  if(p!==p2)return aerr('Hai mật khẩu chưa giống nhau');
  authBusy=true;
  try{
    const salt=rndSalt(),hash=await hashPw(p,salt,ITER),lg=!ACC.adopted&&legacyData(),adopt=lg&&$('#adopt')&&$('#adopt').checked;
    ACC.users[u]={name:n.slice(0,24),salt,iter:ITER,hash,created:Date.now(),avatar:authAv||''};
    ACC.cur=u;if(lg)ACC.adopted=true;accSave();loadUser(u);
    if(adopt){S=norm(lg);addLog('Gắn dữ liệu cũ vào tài khoản mới');save()}
    authAv='';authMode=null;render();toast('Chào mừng '+n+'! 🎉');sfx('start')
  }catch(e){aerr(e&&e.message==='nocrypto'?'Trình duyệt không hỗ trợ mã hóa mật khẩu. Hãy mở trang qua https hoặc localhost.':'Không tạo được tài khoản, hãy thử lại')}
  authBusy=false
}
async function doLogin(){
  if(authBusy)return;
  const u=$('#au').value.trim().toLowerCase(),p=$('#ap').value,a=ACC.users[u];
  if(a&&a.lock>Date.now())return aerr('Nhập sai nhiều lần. Thử lại sau '+Math.ceil((a.lock-Date.now())/1000)+' giây');
  if(!u||!p)return aerr('Hãy nhập tên đăng nhập và mật khẩu');
  authBusy=true;
  try{
    const h=a?await hashPw(p,a.salt,a.iter||ITER):'';
    if(a&&h===a.hash){a.fails=0;a.lock=0;ACC.cur=u;accSave();loadUser(u);authMode=null;render();toast('Chào mừng trở lại, '+a.name+'!');sfx('start')}
    else{if(a){a.fails=(a.fails||0)+1;if(a.fails>=5){a.lock=Date.now()+30000;a.fails=0}accSave()}aerr('Sai tên đăng nhập hoặc mật khẩu')}
  }catch(e){aerr('Trình duyệt không hỗ trợ mã hóa mật khẩu. Hãy mở trang qua https hoặc localhost.')}
  authBusy=false
}
function logout(){save();music(false);mus=null;ACC.cur=null;accSave();LS=null;S=defaults();tab='day';authMode='login';render();scrollTo(0,0)}

/* ---------- Khối "Tài khoản" trong tab Khác ---------- */
function accBlock(){const a=me();if(!a)return '';
  return `<h3>Tài khoản</h3><div class="card"><div class="m"><div class="t">${esc(a.name)}</div><span class="tag">@${esc(ACC.cur)} · tạo ngày ${new Date(a.created||Date.now()).toLocaleDateString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})}</span></div></div>
  <div class="btns" style="justify-content:flex-start;flex-wrap:wrap"><button class="sec2" data-auth="prof">✎ Sửa hồ sơ</button><button class="sec2" data-auth="restart">🔄 Làm lại từ đầu</button><button class="sec2" data-auth="pwd">🔑 Đổi mật khẩu</button><button class="sec2" data-auth="out">Đăng xuất</button><button class="danger" data-auth="delacc">Xóa tài khoản</button></div>`}
function openAccDlg(sub){
  const a=me();if(!a)return;dlgCtx={kind:'acc',sub};authAv='';
  $('#ds').textContent='Lưu';$('#ds').className='';
  if(sub==='prof'){$('#dt').textContent='Sửa hồ sơ';$('#df').innerHTML=`<label for="pn">Tên nhân vật</label><input id="pn" maxlength="24" value="${esc(a.name)}"><label>Ảnh nhân vật</label><div class="avrow"><img id="avp" alt="Ảnh xem trước" src="${esc(a.avatar||DEF_AV)}"><input id="av" type="file" accept="image/*"></div>`}
  else if(sub==='restart'){$('#dt').textContent='Làm lại từ đầu?';$('#df').innerHTML=`<p class="tag">Xu về 0, ngày bắt đầu game là hôm nay (${fd(NOW()).split('-').reverse().join('/')}), tiến độ các nhiệm vụ làm lại. Danh sách nhiệm vụ và quà được giữ nguyên.</p><label class="chk"><input type="checkbox" id="rx"> Đặt lại cả XP/cấp độ, điểm danh, sức khỏe, số lần đã đổi quà và lịch sử</label>`;$('#ds').textContent='Làm lại';$('#ds').className='danger'}
  else if(sub==='pwd'){$('#dt').textContent='Đổi mật khẩu';$('#df').innerHTML=`<label for="po">Mật khẩu hiện tại</label><input id="po" type="password" autocomplete="current-password"><label for="pw1">Mật khẩu mới (ít nhất 6 ký tự)</label><input id="pw1" type="password" autocomplete="new-password"><label for="pw2">Nhập lại mật khẩu mới</label><input id="pw2" type="password" autocomplete="new-password">`}
  else{$('#dt').textContent='Xóa tài khoản “'+a.name+'”? Toàn bộ dữ liệu game của tài khoản này sẽ mất.';$('#df').innerHTML=`<label for="po">Nhập mật khẩu để xác nhận</label><input id="po" type="password" autocomplete="current-password">`;$('#ds').textContent='Xóa';$('#ds').className='danger'}
  $('#dlg').showModal()
}
async function accDlgSave(){
  const sub=dlgCtx.sub,a=me(),bad=m=>{toast(m);sfx('err')};if(!a||authBusy)return;
  if(sub==='prof'){const n=$('#pn').value.trim();if(!n)return bad('Hãy nhập tên nhân vật');a.name=n.slice(0,24);if(authAv)a.avatar=authAv;authAv='';accSave();$('#dlg').close();render();toast('Đã cập nhật hồ sơ');return}
  if(sub==='restart'){const all=$('#rx').checked;S.coins=0;S.start=key('week');S.bonus={};S.quests.forEach(q=>{q.done=null;q.doing=null});
    if(all){S.xp=0;S.checkins=[];S.log=[];delete S.health;S.rewards.forEach(r=>{r.got=0})}
    addLog('Làm lại từ đầu: xu về 0'+(all?', đặt lại cả XP và lịch sử':''));$('#dlg').close();render();toast('Đã làm lại từ đầu. Chúc bạn một tuần thật tốt! 🚀');sfx('start');return}
  authBusy=true;
  try{
    if(await hashPw($('#po').value,a.salt,a.iter||ITER)!==a.hash){bad('Mật khẩu hiện tại không đúng');authBusy=false;return}
    if(sub==='pwd'){const n1=$('#pw1').value;if(n1.length<6){bad('Mật khẩu mới cần ít nhất 6 ký tự');authBusy=false;return}if(n1!==$('#pw2').value){bad('Hai mật khẩu mới chưa giống nhau');authBusy=false;return}
      a.salt=rndSalt();a.iter=ITER;a.hash=await hashPw(n1,a.salt,ITER);accSave();$('#dlg').close();toast('Đã đổi mật khẩu')}
    else{const u=ACC.cur;music(false);mus=null;delete ACC.users[u];ACC.cur=null;try{localStorage.removeItem(DATAK(u))}catch(e){}accSave();LS=null;S=defaults();tab='day';authMode=null;$('#dlg').close();render()}
  }catch(e){bad('Trình duyệt không hỗ trợ mã hóa mật khẩu')}
  authBusy=false
}

/* ---------- Sự kiện ---------- */
document.addEventListener('click',e=>{const b=e.target.closest('button[data-auth]');if(!b)return;const k=b.dataset.auth;
  if(k==='login')doLogin();else if(k==='register')doRegister();
  else if(k==='mode-reg'){authMode='register';authAv='';authRender()}else if(k==='mode-log'){authMode='login';authRender()}
  else if(k==='out')logout();else openAccDlg(k)});
document.addEventListener('change',e=>{const t=e.target;
  if(t.id==='av')pickAvatar(t.files&&t.files[0],d=>{authAv=d;const p=$('#avp');if(p)p.src=d});
  if(t.dataset&&t.dataset.showpw!==undefined)document.querySelectorAll('.authc input[type=password]').forEach(i=>i.type=t.checked?'text':'password')});
document.addEventListener('keydown',e=>{if(e.key!=='Enter'||!e.target.closest('.authc')||e.target.type==='file')return;const b=document.querySelector('.authc button[data-auth="login"],.authc button[data-auth="register"]');if(b)b.click()});
