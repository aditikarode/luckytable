/* Lucky Table click-through prototype. No build step, no backend. State lives in sessionStorage. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CODE='LUCKY888',GOAL=6,FRIENDS=['John','Jason','Sarah'];
const KEY='luckytable-proto-v1';

/* ---------- state ---------- */
const fresh=()=>({signedIn:false,table:'Wednesday Crew',members:['Frank'],cr:{Frank:0,John:0,Jason:0,Sarah:0},bonus:false,simmed:false,posted:false,copied:false,applied:false,ordered:false,votes:0,sent:false});
let S=load();
function load(){try{const j=sessionStorage.getItem(KEY);if(j)return Object.assign(fresh(),JSON.parse(j))}catch(e){}return fresh()}
function save(){try{sessionStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
const total=()=>Object.values(S.cr).reduce((a,b)=>a+b,0);
const full=()=>total()>=GOAL;
const created=()=>S.signedIn&&S.members.length>=3;

/* ---------- helpers ---------- */
let timers=[];
const later=(f,ms)=>{timers.push(setTimeout(f,ms))};
const clearT=()=>{timers.forEach(clearTimeout);timers=[];simming=false};
let simming=false,ov=null,fp='switch',camState=0;
function toast(t){const d=document.createElement('div');d.className='toast';d.textContent=t;$('#toasts').appendChild(d);setTimeout(()=>d.remove(),2400)}
const go=r=>{if(location.hash==='#/'+r)render();else location.hash='#/'+r};

const IC={table:'<path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19"/><circle cx="10" cy="8" r="3.2"/><path d="M20 19v-1.2a3 3 0 0 0-2.2-2.9M15.5 5.2a3.2 3.2 0 0 1 0 5.6"/>',check:'<circle cx="12" cy="12" r="8.5"/><path d="m8.2 12.4 2.7 2.7 5-5.6"/>',gift:'<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M3 7.5h18V10H3zM12 7.5V20M12 7.5C10.5 4 7 4.5 7.5 6.5 8 8 10.5 7.5 12 7.5zM12 7.5c1.5-3.5 5-3 4.5-1S13.5 8 12 7.5z"/>',cam:'<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l1.2-1.8h6.2L16.3 6h1.2A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z"/><circle cx="12" cy="12.5" r="3.4"/>',bolt:'<path d="M13 3 6 13.5h5L10 21l7-10.5h-5z"/>',cup:'<path d="M6 7h12l-1.4 12.2a1.5 1.5 0 0 1-1.5 1.3H8.9a1.5 1.5 0 0 1-1.5-1.3zM9 7l1-3h4l1 3M8 12h8"/>',meal:'<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2.5 1.5-3 5-3 8h3"/>',scan:'<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M7 12h10"/>'};
IC.users=IC.table;
const ic=(n,s=24)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
const oni=s=>`<svg width="${s}" height="${s}" viewBox="0 0 100 100" role="img" aria-label="Fantuan rice ball logo"><rect width="100" height="100" rx="22" fill="#5BBFC1"/><path d="M50 17C37 17 27 30 20 46C14 59 11 70 14 77C17 83 26 84 32 84H68C74 84 83 83 86 77C89 70 86 59 80 46C73 30 63 17 50 17Z" fill="#fff" stroke="#111" stroke-width="5" stroke-linejoin="round"/><ellipse cx="35" cy="56" rx="5" ry="6.5" fill="#111"/><ellipse cx="65" cy="56" rx="5" ry="6.5" fill="#111"/><rect x="31" y="68" width="38" height="16" fill="#111"/></svg>`;

const head=(t,s,p)=>`<div class="top"><div><h1>${t}</h1><div class="sub">${s}</div></div>${p?`<span class="pill">${p}</span>`:''}</div>`;
const tip=h=>`<p class="tip">${h}</p>`;
let lastNav=0;
const navHTML=i=>{const f=lastNav;lastNav=i;const L=[['table','My table','table'],['scan','Scan','scan'],['gift','Gifts','gifts']];
  return `<nav class="nav ${f!==i?'chg':''}" style="--f:${f};--t:${i}" aria-label="Main"><i class="ind"></i>${L.map((x,k)=>`<a href="#/${x[2]}" ${k===i?'aria-current="page"':''} class="${k===i?'on':''}">${ic(x[0],25)}<b>${x[1]}</b></a>`).join('')}</nav>`};

/* ---------- screens ---------- */
const POST_SVG=`<svg viewBox="0 0 330 250" role="img" aria-label="Cartoon of a friend with a bob haircut holding a Coke beside a steamer of dumplings"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe3b3"/><stop offset="1" stop-color="#f59a86"/></linearGradient></defs><rect width="330" height="250" fill="url(#bg)"/><rect y="196" width="330" height="54" fill="#8b4a2b"/><rect x="196" y="156" width="104" height="44" rx="8" fill="#d9a35a"/><path d="M196 172H300M196 186H300" stroke="#b9823c" stroke-width="3"/><g fill="#fff" stroke="#e2d6c6" stroke-width="2"><ellipse cx="222" cy="152" rx="15" ry="11"/><ellipse cx="250" cy="148" rx="15" ry="11"/><ellipse cx="278" cy="152" rx="15" ry="11"/></g><ellipse cx="108" cy="238" rx="72" ry="52" fill="#b3171d"/><circle cx="108" cy="122" r="48" fill="#f6d3b3"/><path d="M58 126Q54 62 108 62Q162 62 158 126Q150 92 108 92Q66 92 58 126Z" fill="#1c1816"/><path d="M58 126V168Q58 176 68 170V130ZM158 126V168Q158 176 148 170V130Z" fill="#1c1816"/><circle cx="92" cy="128" r="4.5" fill="#222"/><circle cx="124" cy="128" r="4.5" fill="#222"/><circle cx="82" cy="141" r="7" fill="#f4a3a0" opacity=".6"/><circle cx="134" cy="141" r="7" fill="#f4a3a0" opacity=".6"/><path d="M98 144Q108 154 118 144" stroke="#7a3b2e" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="146" y="168" width="36" height="58" rx="9" fill="#d12a31"/><path d="M146 190Q164 178 182 192V202Q164 190 146 202Z" fill="#fff"/><circle cx="146" cy="214" r="11" fill="#f6d3b3"/><rect x="150" y="30" width="150" height="46" rx="16" fill="#fff"/><path d="M168 76L160 92L186 76Z" fill="#fff"/><text x="225" y="59" text-anchor="middle" font-size="16" fill="#1d1a1a">一起来吃! 🥟🥤</text><text x="40" y="40" font-size="18">✨</text></svg>`;

function scPost(){return{url:'@yourchinesebff',nav:-1,
  body:`<div style="padding-top:18px">${tip('<b>Prototype tip:</b> this is where a follower first meets Lucky Table. Tap <b>Link in bio</b>.')}
  <div class="ig"><div class="igh"><span class="av gold">@</span><div><b>yourchinesebff</b><div class="mute">Sponsored · Coca-Cola</div></div></div>
  <div class="igsvg">${POST_SVG}</div>
  <div class="igc"><b>yourchinesebff</b> bring your bestie, your table and a Coke 🥟🥤 Join the Lucky Table challenge. Link in bio 🧧 #luckytable</div>
  <div class="mute" style="margin:-4px 2px 4px;font-size:12.5px">Illustrative cartoon, not the creator’s likeness.</div>
  <button class="btn" data-a="link">Link in bio</button></div></div>`}}

function scChallenge(){return{url:'challenge',nav:-1,head:head('Lucky Table','Challenge from @yourchinesebff','Week 1'),
  body:`${tip('<b>Phase 1 · Connect.</b> Tap <b>Join the challenge</b>, then sign in.')}
  <div class="cols"><div class="card hero"><div class="fu" aria-hidden="true">福</div><h2 style="font-size:19px;margin:6px 0">The Lucky Table Challenge</h2><div class="mute">Eat together this week. Every friend adds to one red envelope.</div><button class="btn gold" data-a="join">Join the challenge</button></div>
  <div class="card"><h2>How it works</h2><ol class="steps"><li>Start a table with 3+ friends</li><li>Share your meal and upload the receipt</li><li>Fill the envelope, unlock this week’s discount</li></ol></div></div>`}}

function scSetup(){const n=S.members.length;
  return{url:'check-in',nav:-1,head:head('Create your table','Start with friends you eat with'),
  body:`${tip('Name your table, then tap <b>Invite friends on WeChat</b> until at least 3 of you are in.')}
  <div class="cols"><div class="card"><h2><label for="nm">Table name</label></h2><input class="field" id="nm" maxlength="30" value="${esc(S.table)}" autocomplete="off"></div>
  <div class="card"><h2>Members <span class="mute" id="cnt">${n>=3?n+' members ✓':n+' of 3 minimum'}</span></h2>
  <div id="mem">${S.members.map((m,i)=>`<div class="row"><span class="av">${m[0]}</span><span class="nm">${m}${i===0?' <span class="mute">(you)</span>':''}</span></div>`).join('')}${n<4?`<div class="row"><span class="av plus" aria-hidden="true">+</span><span class="nm mute">${n<3?'Add a friend':'Add another (optional)'}</span></div>`:''}</div>
  ${n<4?`<button class="btn wc" data-a="invite">Invite friends on WeChat</button>`:''}
  <button class="btn" data-a="create" ${n<3?'disabled':''}>Create table</button></div></div>`}}

const dots=c=>[0,1].map(i=>`<span class="dot ${i<c?'f':''}"></span>`).join('');
function scTable(){const T=total(),p=Math.min(100,T/GOAL*100),F=S.cr.Frank;
  let t;
  if(F===0)t='<b>Phase 2 · Community.</b> Tap <b>Add receipt</b> to earn your first credit.';
  else if(!S.simmed&&!full())t='Nice, +1 credit. Now use the <b>prototype helper</b> to watch your friends check in.';
  else if(full())t='The envelope is full. Tap <b>Open your envelope</b>.';
  else t='You’re one credit short. Tap <b>Add receipt</b> again (max 2 each).';
  const names=[...S.members.filter(m=>m!=='Frank'),'Frank'];
  const order=['John','Jason','Sarah','Frank'].filter(m=>S.members.includes(m));
  return{url:'check-in',nav:0,head:head('Lucky Table',`${esc(S.table)} · ${S.members.length} members`,'Week 1'),
  body:`${tip(t)}<div class="cols"><div>
  <div class="card"><h2>This week’s goal</h2><div class="big">${Math.min(T,GOAL)} / ${GOAL} credits</div><div class="bar ${full()?'ok':''}" role="progressbar" aria-valuemin="0" aria-valuemax="${GOAL}" aria-valuenow="${Math.min(T,GOAL)}"><b style="width:${p}%"></b></div><div class="mute">${full()?'Envelope full. Everyone unlocks this week’s reward.':'Everyone adds up to 2 credits, so no one can do it alone.'}</div>
  ${full()?`<button class="btn pulse" data-a="openenv">Open your envelope</button>`:''}</div>
  ${S.bonus?`<div class="badge" style="margin-top:12px">Meetup bonus: 3 of you checked in at Hot Pot Haven</div>`:''}</div>
  <div class="card"><h2>Your table</h2>${order.map(m=>`<div class="row"><span class="av">${m[0]}</span><span class="nm">${m}${m==='Frank'?' (you)':''}</span><span aria-label="${S.cr[m]} of 2 credits">${dots(S.cr[m])}</span></div>`).join('')}
  <button class="btn wc" data-a="share">${S.posted?'Shared to WeChat ✓':'Share to WeChat'}</button>
  <button class="btn" data-a="receipt">Add receipt</button>
  <button class="btn ghost" data-a="sim" ${S.simmed||simming?'disabled':''}>Prototype helper: simulate friends checking in</button></div></div>`}}

function scScan(){const F=S.cr.Frank;
  return{url:'scan',nav:1,head:head('Scan receipt','Add your receipt'),
  body:`${tip('Tap <b>Upload receipt</b>, then <b>Take photo</b> to see the receipt scan.')}
  <div class="cols"><div class="card"><h2>Scan the code at the counter</h2><button class="scan" data-a="upload" aria-label="Open scanner">${ic('scan',44)}</button><div class="mute">Optional: bonus when your table checks in together</div></div>
  <div class="card"><h2>Receipt</h2><div class="row"><span class="av">${ic('cam',16)}</span><span class="nm">${F?'Coca-Cola 355 mL ✓':'Add a photo of your receipt'}</span><span class="mute">${F?F+' of 2 credits':''}</span></div>
  <button class="btn" data-a="upload" ${F>=2?'disabled':''}>${F>=2?'Max credits added':F?'Add another receipt':'Upload receipt'}</button>
  <button class="btn o" data-a="totable">Back to my table</button></div></div>`}}

const lockedCard=()=>`<div class="card lock"><div class="em" aria-hidden="true">🧧</div><h2>Your envelope isn’t full yet</h2><div class="mute">${Math.min(total(),GOAL)} of ${GOAL} credits so far. Fill it with your table first.</div><div class="bar"><b style="width:${Math.min(100,total()/GOAL*100)}%"></b></div><button class="btn" data-a="totable">Go to my table</button></div>`;

function scGifts(){return{url:'gifts',nav:2,head:head('Gifts','Rewards from your table',full()?'Ready':''),
  body:!full()?lockedCard():`${tip('Everything unlocked by the full envelope lives here. Start with <b>Lucky envelope</b>.')}<div class="card hub"><a href="#/envelope"><span aria-hidden="true" style="font-size:26px">🧧</span><span class="t"><b>Lucky envelope</b><span>Open this week’s reward</span></span><span class="go">›</span></a><a href="#/fantuan"><span aria-hidden="true" style="font-size:26px">🍜</span><span class="t"><b>Redeem in Fantuan</b><span>15% off with your code</span></span><span class="go">›</span></a><a href="#/streak"><span aria-hidden="true" style="font-size:26px">🔥</span><span class="t"><b>Table streak</b><span>Free drink at week 4</span></span><span class="go">›</span></a><a href="#/send"><span aria-hidden="true" style="font-size:26px">💌</span><span class="t"><b>Send to a friend</b><span>Your table votes first</span></span><span class="go">›</span></a></div>`}}

function scEnvelope(){
  if(!full())return{url:'gifts',nav:2,head:head('Lucky envelope','Sent by table vote'),body:lockedCard()};
  return{url:'gifts',nav:2,head:head('Lucky envelope','Your table filled it','Ready'),
  body:`${tip('<b>Phase 3 · Celebrate.</b> Move your pointer over the envelope, then tap it (or press Enter) to open.')}
  <div class="e3"><h2>A little luck goes a long way.</h2><div id="stage3d" tabindex="0" role="button" aria-label="Open your lucky envelope"></div>
  <div class="bot"><p id="hint" aria-live="polite">Tap to reveal your exclusive reward.</p><button class="cpy" id="cp3" data-a="copy">Copy code</button><button class="cpy" id="tofan" data-a="tofan" style="border-color:var(--red);color:var(--red)">Use it in Fantuan</button></div></div>`,
  after(){
    const host=$('#stage3d');let shown=false;
    const ready=()=>{if(shown)return;shown=true;const h=$('#hint');if(h)h.textContent='Your exclusive reward is ready.';$$('.cpy').forEach(b=>b.classList.add('on'))};
    const ok=window.EnvelopeScene&&EnvelopeScene.mount(host,{onReady:ready});
    if(!ok){host.style.cursor='default';host.removeAttribute('tabindex');host.removeAttribute('role');host.innerHTML=`<div style="height:100%;display:grid;place-items:center;text-align:center;padding:12px"><div><div class="code" style="background:#fffaf0"><span class="mute">Your exclusive reward</span><b>${CODE}</b><span class="mute">valid until Sunday 11:59 PM</span></div><small class="mute">3D preview isn’t available on this device.</small></div></div>`;ready()}
  }}}

function scFantuan(){
  if(!full())return{url:'gifts',nav:2,head:head('Redeem','Fantuan'),body:lockedCard()};
  if(fp==='switch')return{url:'fantuan',bare:true,body:`<div class="swt"><div class="swl">Switching apps</div><div class="swrow"><div class="app lt"><div class="appico">福</div><b>Lucky Table</b><span>${S.copied?'code copied':'tap to copy code'}</span></div><div class="app fn"><div class="appico fn">${oni(76)}</div><b>Fantuan</b><span>opening…</span></div></div></div>`};
  if(fp==='splash')return{url:'fantuan',bare:true,body:`<div class="spl"><div class="logo">${oni(112)}</div><b>Fantuan</b><span>Order food &amp; drinks</span></div>`};
  const sub=28.88,off=S.applied?4.33:0,tt=(sub-off).toFixed(2);
  const inner=S.ordered?`<div class="card sent"><div class="okc">${ic('check',30)}</div><h2>Order placed (prototype)</h2><div class="mute">You saved $4.33 with your table’s code. No real order was made.</div><button class="btn" data-a="tostreak">Keep the streak going</button></div>`
  :`${tip(S.applied?'Code applied. Tap <b>Place order</b>.':'Tap <b>Paste code</b> to drop in the code you copied.')}<div class="card"><h2>Hot Pot Haven</h2><div class="line"><span>Hot pot combo</span><span>$24.90</span></div><div class="line"><span>Coca-Cola 355 mL × 2</span><span>$3.98</span></div>
  <div class="promo"><span>Promo code</span><div class="pf" id="pc">${S.applied?CODE:''}</div>${S.applied?'':`<button class="mini" data-a="paste">Paste code</button>`}</div>
  ${S.applied?`<div class="line pr"><span>Lucky Table 15% off</span><span>−$4.33</span></div>`:''}
  <div class="line tot"><span>Total</span><span>$${tt}</span></div><button class="btn fan" data-a="order">Place order</button></div>`;
  return{url:'fantuan/checkout',bare:true,body:`<div class="fbar"><a href="#/envelope">‹ Lucky Table</a><b style="display:flex;align-items:center;gap:8px">${oni(26)} Fantuan</b><span style="width:80px"></span></div><div class="fapp"><div class="in">${inner}</div></div>`}}

function scStreak(){
  if(!full())return{url:'gifts',nav:2,head:head('Table streak',''),body:lockedCard()};
  const L=[['check','Week 1 · this week','Envelope filled · 15% off code','d'],['table','Week 2','Hit the goal again to keep the streak',''],['cup','Week 4','Free drink for everyone','m'],['meal','Week 8','Meal discount','m'],['users','Week 12','Group dinner','m']];
  return{url:'rewards',nav:2,head:head('Table streak','Keep it going, unlock more','Week 1'),
  body:`${tip('Hit the goal every week to climb the streak. Miss a week and it resets.')}<div class="card"><div class="tl">${L.map((x,i)=>`<div class="tn ${x[3]}" style="animation-delay:${i*.35}s"><span class="dt">${ic(x[0],18)}</span><div><b>${x[1]}</b><div class="mute">${x[2]}</div></div></div>`).join('')}</div></div>
  <button class="btn" data-a="tosend">Send your envelope to a friend</button><button class="btn o" data-a="totable">Back to my table</button>`}}

function scSend(){
  if(!full())return{url:'gifts',nav:2,head:head('Send to a friend',''),body:lockedCard()};
  const v=S.votes,who=['John','Jason','Sarah','Frank (you)'];
  const st=i=>i<v?'ok':(i===v&&v===3?'you':'wait');
  const row=(n,i)=>{const s=st(i);return `<div class="vt ${s}"><span class="av">${n[0]}</span><span class="nm">${n}</span><span class="vs">${s==='ok'?'✓ Approved':s==='you'?'Your vote':'Waiting'}</span></div>`};
  const flow=`<div class="flow"><div class="fb"><span class="fe" aria-hidden="true">福</span><b>Your table</b></div><svg class="arr" width="64" height="24" viewBox="0 0 64 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h52M46 4l10 8-10 8"/></svg><div class="fb"><span class="av big">A</span><b>Alex</b><span class="mute">Friend outside your table</span></div></div>`;
  const body=S.sent?`<div class="card sent"><div class="okc">${ic('check',30)}</div><h2>Envelope sent to Alex</h2><div class="stp d"><i>✓</i>Sent to Alex</div><div class="stp"><i></i>Alex joins a table</div><div class="stp"><i></i>You and Alex both earn a reward</div></div><button class="btn" data-a="reset">Start the prototype over</button><button class="btn o" data-a="totable">Back to my table</button>`
  :`<div class="card"><h2>Table vote</h2><div class="mute" style="margin-bottom:8px">Everyone approves before it’s sent.</div>${who.map(row).join('')}</div>${v===3?`<button class="btn pulse" data-a="approve">Approve · send to Alex</button>`:`<button class="btn" disabled>Waiting for your table</button>`}`;
  return{url:'gifts/send',nav:2,head:head('Send to a friend','Lucky envelope · Lunar New Year',S.sent?'Sent':'Voting'),
  body:`${S.sent?'':tip(v===3?'Three of four approved. Tap <b>Approve</b> to cast your vote.':'Your table is voting…')}<div class="gt">Send your envelope to a friend outside your table</div>${flow}${body}`}}

const ROUTES={post:scPost,challenge:scChallenge,setup:scSetup,table:scTable,scan:scScan,gifts:scGifts,envelope:scEnvelope,fantuan:scFantuan,streak:scStreak,send:scSend};
const ENTER={
  fantuan(){fp=S.ordered?'app':'switch';if(fp==='switch'){later(()=>{fp='splash';render()},1500);later(()=>{fp='app';render()},2700)}},
  send(){if(!S.sent&&full()){S.votes=0;save();[900,1800,2700].forEach((ms,i)=>later(()=>{S.votes=i+1;save();render()},ms))}}
};

/* ---------- guide ---------- */
const PHASES=[['Phase 1 · Connect',[['post','Creator post'],['challenge','Challenge landing'],['setup','Create your table']]],['Phase 2 · Community',[['table','Table & credits'],['scan','Scan receipt']]],['Phase 3 · Celebrate',[['envelope','Lucky envelope'],['fantuan','Redeem in Fantuan'],['streak','Table streak'],['send','Send to a friend']]]];
const ORDER=['post','challenge','setup','table','scan','envelope','fantuan','streak','send'];
function guideHTML(r){let n=0;return `<h2><span class="logo" aria-hidden="true">福</span>Lucky Table</h2><p class="lead">A click-through prototype of the 3 demo clips. Follow the yellow tips, or jump to any step.</p>${PHASES.map(([t,items])=>`<h3>${t}</h3><ol>${items.map(([k,l])=>{n++;return `<li><button data-jump="${k}" ${k===r?'aria-current="step"':''}><span class="n">${n}</span>${l}</button></li>`}).join('')}</ol>`).join('')}<button class="reset" data-a="reset">Reset prototype</button><p class="keys">Jumping ahead fills in earlier steps for you. Esc closes sheets and this menu.</p>`}
function prep(r){
  const i=ORDER.indexOf(r);
  if(i>=ORDER.indexOf('setup'))S.signedIn=true;
  if(i>=ORDER.indexOf('table')){FRIENDS.forEach(f=>{if(!S.members.includes(f))S.members.push(f)});if(!S.table.trim())S.table='Wednesday Crew'}
  if(i>=ORDER.indexOf('envelope')&&!full()){S.cr={Frank:1,John:2,Jason:2,Sarah:1};S.bonus=true;S.simmed=true}
  if(r==='send'&&!S.sent)S.votes=0;
  save();
}
function guard(r){
  if(r==='post'||r==='challenge')return r;
  if(!S.signedIn)return 'post';
  if(r==='setup')return r;
  if(!created())return 'setup';
  if(['fantuan','streak','send','envelope'].includes(r)&&!full())return r==='envelope'?r:'gifts';
  return r;
}

/* ---------- overlays (sheets, camera) ---------- */
function renderOv(){
  const el=$('#sheet');el.className='';
  if(!ov){el.innerHTML='';return}
  el.classList.add('on');
  if(ov==='signin'){el.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh1"><h2 id="sh1">Sign in</h2><div class="mute">Use the account you already have.</div><button class="btn wc" data-a="wc">Continue with WeChat</button><label class="sw"><input type="checkbox" id="acc"> <span>I accept the contest rules and privacy terms</span></label><div class="err" id="err" role="alert"></div><button class="btn ghost" data-a="close" style="margin-top:4px">Cancel</button></div>`;$('#acc').focus()}
  else if(ov==='moments'){el.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh2"><div class="moment"><span class="t" id="sh2">WeChat Moments</span><br><b>You</b> 晚饭 + 可乐，和朋友一起 🥤🧧 #LuckyTable<div class="pic" aria-hidden="true">🍲🥤</div><span class="mute">luckytable.example/t/${esc((S.table||'table').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-'))}</span></div><div class="posted" id="pst" aria-live="polite"></div><button class="btn wc" data-a="post">Post to Moments</button><button class="btn ghost" data-a="close" style="margin-top:6px">Cancel</button></div>`;$('[data-a=post]').focus()}
  else if(ov==='pick'){el.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh3"><h2 id="sh3">Add your receipt</h2><div class="mute">Choose how to add it.</div><button class="btn" data-a="cam">${ic('cam',20)} Take photo</button><button class="btn o" data-a="lib">Choose from library</button><button class="btn ghost" data-a="close" style="margin-top:6px">Cancel</button></div>`;$('[data-a=cam]').focus()}
  else if(ov==='cam'){el.classList.add('cam');const k=camState;el.innerHTML=`<div class="cam3" role="dialog" aria-modal="true" aria-label="Receipt scanner"><div class="camtop"><button data-a="close">Cancel</button><b>Scan receipt</b><span aria-hidden="true">${ic('bolt',18)}</span></div>
  <svg class="scene" viewBox="0 0 330 470" role="img" aria-label="Receipt on a table next to a Coke can, being scanned"><defs><linearGradient id="sg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3ddc84" stop-opacity="0"/><stop offset="1" stop-color="#3ddc84" stop-opacity=".7"/></linearGradient></defs><rect width="330" height="470" fill="#5b3b27"/><path d="M0 80H330M0 170H330M0 260H330M0 350H330M0 440H330" stroke="#4a2f1e" stroke-width="2"/><path d="M92 50H238V392L225 382L212 392L199 382L186 392L173 382L160 392L147 382L134 392L121 382L108 392L92 382Z" fill="#fbfaf5"/><g font-family="monospace" font-size="10" fill="#444"><text x="165" y="76" text-anchor="middle" font-weight="700" font-size="12">HOT POT HAVEN</text><text x="165" y="92" text-anchor="middle">Nov 18 · 7:42 PM</text><text x="106" y="128">Hot pot combo</text><text x="224" y="128" text-anchor="end">24.90</text><text x="106" y="148">Coca-Cola 355 mL</text><text x="224" y="148" text-anchor="end">1.99</text><text x="106" y="168">Tea (2)</text><text x="224" y="168" text-anchor="end">6.00</text><text x="106" y="210" font-weight="700">TOTAL</text><text x="224" y="210" text-anchor="end" font-weight="700">32.89</text><text x="165" y="260" text-anchor="middle" fill="#888">Thank you!</text></g>${k?`<rect x="98" y="136" width="134" height="16" rx="3" fill="#3ddc84" opacity=".35"/>`:`<rect class="sl" x="92" y="50" width="146" height="60" fill="url(#sg)"/>`}<ellipse cx="284" cy="380" rx="32" ry="7" fill="#000" opacity=".28"/><rect x="262" y="296" width="44" height="84" rx="9" fill="#F40009"/><path d="M262 332Q284 318 306 334V348Q284 334 262 348Z" fill="#fff"/><ellipse cx="284" cy="298" rx="20" ry="5" fill="#d9d9d9"/><text x="284" y="368" text-anchor="middle" font-size="11" font-weight="700" fill="#fff" font-family="Georgia,serif" font-style="italic">Coke</text><path d="M50 60V30H80M280 60V30H250M50 410V440H80M280 410V440H250" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>
  <div class="det" id="det" role="status" aria-live="polite">${k?'Detected: Coca-Cola 355 mL · $1.99 ✓':'Hold steady…'}</div><div class="shut"><button data-a="shutter" aria-label="Capture receipt"></button></div></div>`;$('[data-a=shutter]').focus()}
}
function openOv(o){ov=o;renderOv()}
function closeOv(){ov=null;renderOv()}
function startCam(detectedAlready){
  camState=detectedAlready?1:0;openOv('cam');
  if(detectedAlready){finishCam(900)}else{later(()=>{if(ov==='cam'&&!camState)detect()},2300)}
}
function detect(){camState=1;if(ov==='cam'){renderOv();finishCam(1300)}}
function finishCam(ms){later(()=>{if(ov!=='cam')return;S.cr.Frank=Math.min(2,S.cr.Frank+1);save();closeOv();go('table');toast('Receipt verified: +1 credit')},ms)}

/* ---------- actions ---------- */
function copyCode(){try{navigator.clipboard&&navigator.clipboard.writeText(CODE).catch(()=>{})}catch(e){}S.copied=true;save();const b=$('#cp3');if(b)b.textContent='Copied ✓';toast('Code copied')}
function sim(){
  if(S.simmed||simming)return;simming=true;render();
  const steps=[['John',2],['Jason',2],['Sarah',1]];
  steps.forEach(([n,c],i)=>later(()=>{S.cr[n]=c;save();toast(`${n} added ${c} credit${c>1?'s':''}`);render()},(i+1)*1000));
  later(()=>{S.bonus=true;S.simmed=true;simming=false;save();render();toast(full()?'Envelope full! 🧧':'Meetup bonus unlocked · 1 more credit to go')},4200);
}
const A={
  link(){go('challenge')},
  join(){openOv('signin')},
  close(){closeOv()},
  wc(){
    if(!$('#acc').checked){$('#err').textContent='Please accept the contest rules and privacy terms to continue.';$('#acc').focus();return}
    const b=$('[data-a=wc]');b.disabled=true;b.textContent='Connecting…';
    later(()=>{S.signedIn=true;save();closeOv();go('setup')},800);
  },
  invite(){const n=FRIENDS.find(f=>!S.members.includes(f));if(!n)return;S.members.push(n);save();toast(`${n} joined your table`);render()},
  create(){if(S.members.length<3)return;save();toast('Table created');go('table')},
  share(){openOv('moments')},
  post(){S.posted=true;save();$('#pst').textContent='✓ Posted';$('[data-a=post]').disabled=true;later(()=>{closeOv();render();toast('Shared to WeChat Moments')},900)},
  receipt(){go('scan')},
  upload(){if(S.cr.Frank>=2){toast('You’ve already added 2 receipts this week');return}openOv('pick')},
  cam(){startCam(false)},
  lib(){startCam(true)},
  shutter(){if(!camState)detect()},
  sim,
  totable(){go('table')},
  openenv(){go('envelope')},
  copy(){copyCode()},
  tofan(){copyCode();go('fantuan')},
  paste(){S.applied=true;save();render();toast('Code applied')},
  order(){S.ordered=true;save();render()},
  tostreak(){go('streak')},
  tosend(){go('send')},
  approve(){S.sent=true;save();render();toast('Envelope sent to Alex 🧧')},
  reset(){S=fresh();save();clearT();ov=null;closeGuide();go('post');toast('Prototype reset')}
};

document.addEventListener('click',e=>{
  const j=e.target.closest('[data-jump]');
  if(j){const r=j.dataset.jump;prep(r);closeGuide();go(r);return}
  const a=e.target.closest('[data-a]');
  if(a&&A[a.dataset.a]&&!a.disabled){A[a.dataset.a]();return}
  if(e.target.id==='sheet'&&ov&&ov!=='cam')closeOv();
});
document.addEventListener('input',e=>{if(e.target.id==='nm'){S.table=e.target.value;save()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(ov)closeOv();closeGuide()}});

/* guide drawer (phones) */
const gt=$('#gt'),gd=$('#guide'),gs=$('#gscrim');
function openGuide(){gd.classList.add('open');gs.classList.add('on');gt.setAttribute('aria-expanded','true')}
function closeGuide(){gd.classList.remove('open');gs.classList.remove('on');gt.setAttribute('aria-expanded','false')}
gt.onclick=()=>gd.classList.contains('open')?closeGuide():openGuide();
gs.onclick=closeGuide;

/* ---------- render ---------- */
let last=null,first=true;
function curRoute(){const h=(location.hash||'').replace(/^#\/?/,'');return ROUTES[h]?h:'post'}
function render(){
  const r=curRoute(),g=guard(r);
  if(g!==r){location.replace('#/'+g);return}
  const changed=r!==last;
  const prevFocus=!changed&&document.activeElement&&document.activeElement.dataset?document.activeElement.dataset.a:null;
  const prevScroll=!changed&&$('#view')?$('#view').scrollTop:0;
  if(changed){clearT();ov=null;ENTER[r]&&ENTER[r]()}
  const v=ROUTES[r]();
  last=r;
  $('#url').textContent='luckytable.example/'+(v.url||r);
  $('#app').innerHTML=v.bare?`<div class="bare">${v.body}</div>`:`${v.head||''}<div class="body" id="view">${v.body}</div>${v.nav>=0?navHTML(v.nav):''}`;
  if(v.nav>=0)lastNav=v.nav;
  if(changed)renderOv();
  gd.innerHTML=guideHTML(r);
  v.after&&v.after();
  if(!changed){const vw=$('#view');if(vw)vw.scrollTop=prevScroll;if(prevFocus){const f=$(`[data-a="${prevFocus}"]`);if(f&&!f.disabled&&!ov)f.focus({preventScroll:true})}}
  else if(!first){window.scrollTo(0,0);const h=$('h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true})}}
  first=false;
  document.title='Lucky Table · '+(v.url||r)+' · prototype';
}
addEventListener('hashchange',render);
render();
})();
