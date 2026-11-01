/* Khởi động: render, hộp thoại, bộ lắng nghe sự kiện, nút nổi 💪 */
function render(){document.body.classList.toggle('auth',!me());if(!me()){authRender();return}document.title='Nhiệm vụ';S.start=S.start||DEFAULT_START;document.documentElement.dataset.theme=S.theme||'light';hero();$('#hero').innerHTML=cn($('#hero').innerHTML);nav();window.placeFab&&placeFab();const m=$('#main');m.innerHTML=cn(banner()+(TYPES[tab]?questsView(tab):tab==='streak'?streakView():tab==='health'?healthView():tab==='shop'?shopView():moreView()));save()}
let dlgCtx=null;
function openDlg(kind,id){
 const it=id?(kind==='quest'?S.quests:S.rewards).find(x=>x.id==id):null;dlgCtx={kind,id};$('#ds').textContent='Lưu';$('#ds').className='';
 $('#dt').textContent=(it?'Sửa ':'Thêm ')+(kind==='quest'?'nhiệm vụ':'phần thưởng');
 let h=`<label for="f1">Tên</label><input id="f1" maxlength="80" value="${it?esc(it.name):''}" placeholder="${kind==='quest'?'VD: Tập thể dục 20 phút':'VD: Một chiếc áo mới'}">`;
 if(kind==='quest')h+=`<label for="f2">Loại nhiệm vụ</label><select id="f2">${Object.entries(TYPES).map(([k,v])=>`<option value="${k}" ${(it?it.type:tab)===k?'selected':''}>${v.n}</option>`).join('')}</select><div class="row"><div><label for="f3">Xu thưởng</label><input id="f3" type="number" min="0" value="${it?it.coin:10}"></div><div><label for="f4">XP</label><input id="f4" type="number" min="0" value="${it?it.xp:20}"></div></div>`;
 else h+=`<label for="f3">Giá (xu)</label><input id="f3" type="number" min="1" value="${it?it.cost:100}"><label for="f5">Loại phần thưởng</label><select id="f5"><option value="auto" ${kdOf(it)==='auto'?'selected':''}>Tự nhận biết (theo tên)</option><option value="snack" ${kdOf(it)==='snack'?'selected':''}>🍿 Đồ ăn vặt (thùng quà bay tới)</option><option value="cloth" ${kdOf(it)==='cloth'?'selected':''}>👕 Quần áo (vòng xoay chọn áo)</option><option value="appl" ${kdOf(it)==='appl'?'selected':''}>🏬 Thiết bị gia dụng (đi mua ở siêu thị)</option><option value="other" ${kdOf(it)==='other'?'selected':''}>Khác</option></select>`;
 $('#df').innerHTML=h;$('#dlg').showModal();$('#f1').focus()
}
$('#dx').onclick=()=>$('#dlg').close();
function askDel(what,k,i,msg){dlgCtx={kind:'del',what,k,i};$('#dt').textContent=msg;$('#df').innerHTML='';$('#ds').textContent='Xóa';$('#ds').className='danger';$('#dlg').showModal()}
$('#ds').onclick=()=>{if(dlgCtx&&dlgCtx.kind==='acc'){accDlgSave();return}if(dlgCtx&&dlgCtx.kind==='del'){const{what,k,i}=dlgCtx;if(what==='reset'){S=Object.assign(defaults(),{quests:[],rewards:[]});tab='day'}else if(k==='quest')S.quests=S.quests.filter(x=>x.id!=i);else S.rewards=S.rewards.filter(x=>x.id!=i);$('#dlg').close();render();return}
if(dlgCtx&&dlgCtx.kind==='hset'){const G=S.health.goals;G.exMin=Math.max(5,parseInt($('#g1').value)||30);G.water=Math.max(1,parseInt($('#g2').value)||8);G.bed=$('#g3').value||'22:30';G.sleep=Math.min(12,Math.max(4,parseFloat($('#g4').value)||8));$('#dlg').close();hcheck();render();return}
 const name=$('#f1').value.trim();if(!name){toast('Hãy nhập tên');return}
 const n=Math.max(0,parseInt($('#f3').value)||0),{kind,id}=dlgCtx;
 if(kind==='quest'){const o={name,type:$('#f2').value,coin:n,xp:Math.max(0,parseInt($('#f4').value)||0)};if(id)Object.assign(S.quests.find(x=>x.id==id),o);else S.quests.push({id:Date.now(),...o});tab=o.type}
 else{const v5=$('#f5').value,o={name,cost:Math.max(1,n),kind:v5==='auto'?undefined:v5,snack:undefined};if(id)Object.assign(S.rewards.find(x=>x.id==id),o);else S.rewards.push({id:Date.now(),got:0,...o})}
 $('#dlg').close();render()
};
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;const D=b.dataset;if((D.done||D.checkin!==undefined||D.buy||D.start||D.h!==undefined)&&!started()){toast('Game chưa bắt đầu');sfx('err');return}
 if(!('done' in D||'checkin' in D||'buy' in D||'sfx' in D||'music' in D||'start' in D))sfx('tap');
 if(D.tab){tab=D.tab;render();scrollTo(0,0)}
 else if(D.add)openDlg(D.add);
 else if(D.edit){const[k,i]=D.edit.split(':');openDlg(k,i)}
 else if(D.del){const[k,i]=D.del.split(':');const it=(k==='quest'?S.quests:S.rewards).find(x=>x.id==i);askDel('del',k,i,'Xóa “'+(it?it.name:'mục này')+'”?')}
 else if(D.start){const q=S.quests.find(x=>x.id==D.start);q.doing=key(q.type);sfx('start');toast('Bắt đầu: '+q.name);render()}
 else if(D.done){
  const q=S.quests.find(x=>x.id==D.done),k=key(q.type);
  if(q.done===k){const bk=q.type+k,bo=S.bonus[bk]?15:0;if(S.coins<q.coin+bo){toast('Không thể hoàn tác: xu đã được tiêu rồi');sfx('err');return}q.done=null;q.doing=null;gain(-(q.coin+bo),-(q.xp+bo));if(bo)delete S.bonus[bk];sfx('undo');addLog('Hoàn tác: '+q.name+(bo?' (thu hồi thưởng xong hết)':''))}
  else{q.done=k;q.doing=null;gain(q.coin,q.xp);sfx('done');fireworks();sfx('fw');addLog('Hoàn thành: '+q.name+' (+'+q.coin+' xu)');toast('+'+q.coin+' 🪙  +'+q.xp+' XP');
   const L=S.quests.filter(x=>x.type===q.type),bk=q.type+k;
   if(L.length>=2&&L.every(x=>x.done===k)&&!S.bonus[bk]){S.bonus[bk]=1;gain(15,15);setTimeout(()=>sfx('bonus'),500);addLog('Xong hết nhiệm vụ '+TYPES[q.type].n.toLowerCase()+' (+15 xu)');setTimeout(()=>toast('🏆 Xong hết! Thưởng thêm +15 🪙'),900)}}
  render();pop()}
 else if(D.checkin!==undefined){const t=fd(NOW());if(!S.checkins.includes(t)){S.checkins.push(t);let c=5;const n=streak();if(n%7===0)c+=30;gain(c,10);sfx('checkin');addLog('Điểm danh (chuỗi '+n+' ngày, +'+c+' xu)');toast(n%7===0?'🔥 Chuỗi '+n+' ngày! +'+c+' 🪙':'Đã điểm danh +'+c+' 🪙');render();pop()}}
 else if(D.buy){const r=S.rewards.find(x=>x.id==D.buy);if(S.coins>=r.cost){S.coins-=r.cost;r.got=(r.got||0)+1;sfx('buy');{const kk=kindOf(r);if(kk==='snack')snackShow();else if(kk==='cloth')clothShow();else if(kk==='appl')storeShow()}addLog('Đổi quà: '+r.name+' (−'+r.cost+' xu)');toast('Đã đổi! Hãy tự mua “'+r.name+'” cho mình 🎁');render()}}
 else if(D.exp!==undefined){$('#bk').value=JSON.stringify(S);$('#bk').select()}
 else if(D.imp!==undefined){try{const o=JSON.parse($('#bk').value);if(!o||!Array.isArray(o.quests)||!Array.isArray(o.rewards))throw 0;S=norm(o);tab='day';toast('Đã nhập dữ liệu');render()}catch(x){toast('Mã sao lưu không hợp lệ')}}
 else if(D.fab!==undefined){if(fabMoved){fabMoved=false}else{if(tab==='health')tab=prevTab;else{prevTab=tab;tab='health'}render();scrollTo(0,0)}}
 else if(D.h!==undefined){const d=hd(),[k,v]=D.h.split(':');if(k==='ex')d.exMin=Math.max(0,d.exMin+ +v);else if(k==='w')d.water=Math.max(0,d.water+ +v);else if(k==='m')d.meals[+v]=d.meals[+v]?0:1;else d[k]=d[k]?0:1;hcheck();render()}
 else if(D.hset!==undefined)openHset();
 else if(D.sfx!==undefined){S.sfx=S.sfx===false;if(S.sfx)sfx('done');render()}
 else if(D.music!==undefined){S.music=S.music===false;music(S.music);render()}
 else if(D.theme){S.theme=D.theme;render()}
 else if(D.reset!==undefined){askDel('reset','','','Xóa toàn bộ dữ liệu? Không thể hoàn tác.')}
});
document.addEventListener('pointerdown',()=>{ac();if(S.music!==false&&!mus)music(true)},{once:true});
let lastDay=fd(NOW());setInterval(()=>{const t=fd(NOW());if(t!==lastDay){lastDay=t;if(me()){render();toast('Ngày mới! Nhiệm vụ đã được làm mới')}}},15000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)music(false);else if(S.music!==false&&AC)music(true)});
document.addEventListener('change',e=>{const id=e.target.id;if(id==='hxt'||id==='hbed'||id==='hwake'){if(!started()){toast('Game chưa bắt đầu');render();return}const d=hd();if(id==='hxt')d.exType=e.target.value;else if(id==='hbed')d.bed=e.target.value;else d.wake=e.target.value;hcheck();render();return}if(e.target.id!=='sd'||!e.target.value)return;const d=new Date(e.target.value+'T00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);S.start=fd(d);toast('Game bắt đầu vào Thứ Hai '+S.start.split('-').reverse().join('/'));render()});
render();
(function(){const fb=$('#fab');let sx,sy,ox,oy,dr=false,pid=null;const box=()=>({w:Math.max(0,innerWidth-58),h:Math.max(0,innerHeight-58)});const put=(x,y)=>{fb.style.right='auto';fb.style.bottom='auto';fb.style.left=x+'px';fb.style.top=y+'px'};window.placeFab=()=>{const f=S.fab;if(!f)return;const b=box();put(Math.min(b.w,Math.max(0,f.x*b.w)),Math.min(b.h,Math.max(0,f.y*b.h)))};
fb.addEventListener('pointerdown',e=>{pid=e.pointerId;sx=e.clientX;sy=e.clientY;const r=fb.getBoundingClientRect();ox=r.left;oy=r.top;dr=false;fabMoved=false;try{fb.setPointerCapture(pid)}catch(z){}});
fb.addEventListener('pointermove',e=>{if(pid!==e.pointerId)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(!dr&&Math.hypot(dx,dy)<8)return;dr=true;fabMoved=true;const b=box(),nx=Math.min(b.w,Math.max(0,ox+dx)),ny=Math.min(b.h,Math.max(0,oy+dy));put(nx,ny);S.fab={x:b.w?nx/b.w:0,y:b.h?ny/b.h:0}});
const end=e=>{if(pid!==e.pointerId)return;pid=null;if(dr)save()};fb.addEventListener('pointerup',end);fb.addEventListener('pointercancel',end);addEventListener('resize',()=>window.placeFab());window.placeFab()})();
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
