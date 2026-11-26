/* 3D lucky envelope (three.js r128). Exposes window.EnvelopeScene.mount(host, {onOpen,onReady}) -> boolean */
(function(){
  let R=null;
  const sp=(x=0,k=60,d=9)=>({x,v:0,t:x,k,d});
  const stepSp=(s,dt)=>{const a=(s.t-s.x)*s.k-s.v*s.d;s.v+=a*dt;s.x+=s.v*dt};
  const $=s=>document.querySelector(s);

  function openEnv(){if(R&&!R.open){R.open=true;R.ot=0;R.cb&&R.cb.onOpen&&R.cb.onOpen()}}

  function paperTex(base,rep){const c=document.createElement("canvas");c.width=c.height=512;const g=c.getContext("2d");g.fillStyle=base;g.fillRect(0,0,512,512);for(let i=0;i<16000;i++){const a=Math.random()*.08;g.fillStyle=Math.random()<.5?`rgba(255,225,210,${a})`:`rgba(40,0,0,${a})`;g.fillRect(Math.random()*512,Math.random()*512,Math.random()*6+1,1)}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t}
  function sealTex(){const c=document.createElement("canvas");c.width=c.height=256;const g=c.getContext("2d");const gr=g.createRadialGradient(100,100,10,128,128,130);gr.addColorStop(0,"#f1d58a");gr.addColorStop(1,"#b88a35");g.fillStyle=gr;g.fillRect(0,0,256,256);g.strokeStyle="#8a6420";g.lineWidth=5;g.beginPath();g.arc(128,128,112,0,7);g.stroke();g.lineWidth=3;g.beginPath();g.arc(128,128,100,0,7);g.stroke();g.fillStyle="#e8c870";g.lineWidth=4;[[-30,-30],[30,-30],[-30,30],[30,30]].forEach(([x,y])=>{g.beginPath();g.arc(128+x,128+y,34,0,7);g.fill();g.stroke()});g.strokeStyle="#8a6420";g.lineWidth=6;g.beginPath();g.moveTo(128,128);g.quadraticCurveTo(140,190,170,215);g.stroke();const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t}

  function build(){
    const T=THREE,r=new T.WebGLRenderer({antialias:true,alpha:true});
    r.setPixelRatio(Math.min(devicePixelRatio,2));r.outputEncoding=T.sRGBEncoding;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.05;r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;
    const sc=new T.Scene(),cam=new T.PerspectiveCamera(32,1,.1,50),pmg=new T.PMREMGenerator(r),es=new T.Scene();
    es.add(new T.Mesh(new T.BoxGeometry(24,24,24),new T.MeshBasicMaterial({color:0x9a8a76,side:T.BackSide})));
    [[0,9,3,10,.3,6],[-9,2,3,.3,7,6],[9,0,-3,.3,5,7],[0,-2,10,8,2,.3]].forEach(([x,y,z,w,h,d])=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial({color:new T.Color(0xfff2dc).multiplyScalar(9)}));m.position.set(x,y,z);es.add(m)});
    sc.environment=pmg.fromScene(es,.03).texture;
    const key=new T.DirectionalLight(0xfff1dc,1.1);key.position.set(3,5,6);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:1,far:20});key.shadow.radius=6;key.shadow.bias=-.0005;sc.add(key,new T.AmbientLight(0xfff6ea,.35));
    const glow=new T.PointLight(0xffe2a0,0,9);sc.add(glow);
    const gnd=new T.Mesh(new T.PlaneGeometry(12,12),new T.ShadowMaterial({opacity:.16}));gnd.rotation.x=-Math.PI/2;gnd.position.y=-2.1;gnd.receiveShadow=true;sc.add(gnd);
    const E=new T.Group();sc.add(E);
    const rr=(w,h,q)=>{const s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+q,y);s.lineTo(x+w-q,y);s.quadraticCurveTo(x+w,y,x+w,y+q);s.lineTo(x+w,y+h-q);s.quadraticCurveTo(x+w,y+h,x+w-q,y+h);s.lineTo(x+q,y+h);s.quadraticCurveTo(x,y+h,x,y+h-q);s.lineTo(x,y+q);s.quadraticCurveTo(x,y,x+q,y);return s};
    const ext=(s,d)=>new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:3,curveSegments:12});
    const mat=(c)=>{const t=paperTex(c,.32);return new T.MeshPhysicalMaterial({color:0xffffff,map:t,bumpMap:t,bumpScale:.6,roughness:.62,clearcoat:.12,clearcoatRoughness:.6,side:T.DoubleSide})};
    const body=new T.Mesh(ext(rr(3.2,2.1,.14),.05),mat("#a5121b"));body.castShadow=true;body.position.z=-.025;E.add(body);
    const fs=new T.Shape();fs.moveTo(-1.6,0);fs.lineTo(1.6,0);fs.lineTo(.18,-1.0);fs.quadraticCurveTo(0,-1.12,-.18,-1.0);fs.lineTo(-1.6,0);
    const FG=new T.Group();FG.position.set(0,1.05,0);E.add(FG);const flap=new T.Mesh(ext(fs,.02),mat("#b01a22"));flap.position.z=.085;flap.castShadow=true;FG.add(flap);
    const dc=document.createElement("canvas");dc.width=1024;dc.height=672;const g=dc.getContext("2d");g.lineCap="round";
    const crease=(a,b,c,d)=>{g.strokeStyle="rgba(50,0,0,.4)";g.lineWidth=4;g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.stroke();g.strokeStyle="rgba(255,190,180,.28)";g.lineWidth=2;g.beginPath();g.moveTo(a+3,b+3);g.lineTo(c+3,d+3);g.stroke()};
    crease(0,672,500,330);crease(1024,672,524,330);g.strokeStyle="rgba(50,0,0,.28)";g.lineWidth=3;g.strokeRect(26,26,972,620);
    const dt=new T.CanvasTexture(dc);dt.encoding=T.sRGBEncoding;
    const dec=new T.Mesh(new T.PlaneGeometry(3.2,2.1),new T.MeshStandardMaterial({map:dt,transparent:true,roughness:.8}));dec.position.z=.052;E.add(dec);
    const tc=document.createElement("canvas");tc.width=1024;tc.height=256;const tg=tc.getContext("2d");tg.fillStyle="#000";tg.fillRect(0,0,1024,256);tg.fillStyle="#fff";tg.textAlign="center";tg.textBaseline="middle";tg.font='600 176px "Cormorant Garamond","Iowan Old Style",Georgia,serif';if("letterSpacing" in tg)tg.letterSpacing="4px";tg.fillText("luckytable",512,132);
    const gold=[];const gm=(o)=>{const m=new T.MeshStandardMaterial(Object.assign({color:0xf2d27c,metalness:1,roughness:.3},o));gold.push(m);return m};
    const txt=new T.Mesh(new T.PlaneGeometry(2.7,.675),gm({alphaMap:new T.CanvasTexture(tc),transparent:true,depthWrite:false,roughness:.26}));txt.position.set(0,-.62,.056);E.add(txt);const sh=new T.Mesh(txt.geometry,new T.MeshBasicMaterial({color:0x3a0408,alphaMap:txt.material.alphaMap,transparent:true,opacity:.6,depthWrite:false}));sh.position.set(.014,-.634,.054);E.add(sh);
    const st=sealTex(),goldM=gm({transparent:true}),topM=gm({map:st,bumpMap:st,bumpScale:1.4,color:0xffffff,transparent:true});
    const SG=new T.Group();SG.position.set(0,-.12,.14);const seal=new T.Mesh(new T.CylinderGeometry(.3,.33,.08,56),[goldM,topM,goldM]);seal.rotation.x=Math.PI/2;seal.castShadow=true;SG.add(seal);E.add(SG);
    const cc=document.createElement("canvas");cc.width=1024;cc.height=638;const cg=cc.getContext("2d");cg.fillStyle="#fbf6ea";cg.fillRect(0,0,1024,638);for(let i=0;i<6000;i++){cg.fillStyle=`rgba(120,90,40,${Math.random()*.05})`;cg.fillRect(Math.random()*1024,Math.random()*638,Math.random()*5+1,1)}
    const gg=cg.createLinearGradient(0,0,1024,638);gg.addColorStop(0,"#b98a1e");gg.addColorStop(.5,"#7d570c");gg.addColorStop(1,"#b98a1e");
    cg.strokeStyle=gg;cg.lineWidth=4;cg.strokeRect(34,34,956,570);cg.lineWidth=1.5;cg.strokeRect(50,50,924,538);cg.textAlign="center";cg.fillStyle=gg;cg.font='500 46px Georgia,serif';cg.fillText("luckytable",512,130);cg.fillStyle="#4a3516";cg.font='34px Georgia,serif';cg.fillText("your exclusive reward",512,205);cg.fillStyle=gg;cg.font='700 140px Georgia,serif';if("letterSpacing" in cg)cg.letterSpacing="6px";cg.fillText("LUCKY888",512,365);if("letterSpacing" in cg)cg.letterSpacing="0px";cg.fillStyle="#4a3516";cg.font='32px Georgia,serif';cg.fillText("valid until Sunday 11:59 PM",512,500);
    const ct=new T.CanvasTexture(cc);ct.encoding=T.sRGBEncoding;const card=new T.Mesh(new T.BoxGeometry(2.6,1.62,.02),new T.MeshStandardMaterial({map:ct,roughness:.55}));card.position.set(0,0,-.2);card.castShadow=true;E.add(card);
    const N=140,pp=new Float32Array(N*3),pv=[],pg=new T.BufferGeometry();pg.setAttribute("position",new T.BufferAttribute(pp,3));const pmat=new T.PointsMaterial({color:0xf2c45c,size:.06,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending});const pts=new T.Points(pg,pmat);pts.frustumCulled=false;sc.add(pts);
    R={r,sc,cam,E,FG,SG,card,glow,gold,goldM,topM,pp,pv,pg,pmat,N,clk:new T.Clock(),run:false,cb:null,ro:null,reduce:matchMedia("(prefers-reduced-motion: reduce)").matches};
    R.reset=()=>{Object.assign(R,{open:false,ot:0,px:0,py:0,hov:false,tm:0,burst:false,shown:false,pAge:9});R.sp={tx:sp(),ty:sp(),hv:sp(0,50,8),idle:sp(1,20,8),op:sp(0,20,8),gl:sp(0,40,8),sl:sp(0,26,6),fl:sp(0,14,5),cy:sp(0,16,6),cz:sp(0,18,6),ey:sp(0,20,8)};pmat.opacity=0;goldM.opacity=topM.opacity=1;SG.visible=true};
    R.size=(host)=>{const w=host.clientWidth||300,h=host.clientHeight||300,a=w/h;r.setSize(w,h,false);cam.aspect=a;cam.position.set(0,.2,Math.max(9.2,6.9/a));cam.updateProjectionMatrix()};
    R.go=()=>{if(R.run)return;R.run=true;R.clk.getDelta();const loop=()=>{if(!R.r.domElement.isConnected){R.run=false;return}requestAnimationFrame(loop);
      const dt=Math.min(.033,R.clk.getDelta()),s=R.sp;R.tm+=dt;if(R.open)R.ot+=dt;const id=s.idle.x*(R.reduce?.25:1),o=s.op.x;
      s.idle.t=R.open?0:1;s.op.t=R.open?1:0;s.ty.t=R.px*.38*(1-.7*o)+Math.sin(R.tm*.55)*.3*id;s.tx.t=-R.py*.26*(1-.7*o)+Math.sin(R.tm*.8)*.05*id-.28*o;s.hv.t=R.hov&&!R.open?.55:0;s.gl.t=R.hov&&!R.open?1:0;s.sl.t=R.ot>0?1:0;s.fl.t=R.ot>.5?Math.PI*.72:0;s.cy.t=R.ot>3.4?.45:R.ot>1.3?1.85:0;s.cz.t=R.ot>2.6?1.2:0;s.ey.t=R.open?-.55:0;
      for(const k in s)stepSp(s[k],dt);
      E.rotation.set(s.tx.x,s.ty.x,0);E.position.set(0,Math.sin(R.tm*1.1)*.09*id+s.ey.x,s.hv.x);FG.rotation.x=s.fl.x;
      const f=s.sl.x;SG.position.set(0,-.12+f*.4-Math.max(0,f-.55)*1.6,.14+f*.9);SG.rotation.z=f*1.1;const sa=1-Math.min(1,Math.max(0,(f-.55)*3));goldM.opacity=topM.opacity=sa;SG.visible=sa>.01;
      card.position.set(0,s.cy.x,-.2+s.cz.x);const gi=1+s.gl.x*1.1;gold.forEach(m=>m.envMapIntensity=gi);glow.position.set(R.px*2.5,R.py*-1.8+.5,3.5);glow.intensity=s.gl.x*1.6;
      if(R.ot>3.6&&!R.burst){R.burst=true;R.pAge=0;for(let i=0;i<N;i++){const a=Math.random()*6.28,e=(Math.random()-.3)*2.2,sp1=1+Math.random()*2.2;pp.set([(Math.random()-.5)*.4,E.position.y+.6,1.3],i*3);pv[i]=[Math.cos(a)*sp1,e*sp1*.6+.8,Math.sin(a)*sp1*.5]}pmat.opacity=1}
      if(R.pAge<2){R.pAge+=dt;for(let i=0;i<N;i++){const v=pv[i];if(!v)continue;v[1]-=2.2*dt;pp[i*3]+=v[0]*dt;pp[i*3+1]+=v[1]*dt;pp[i*3+2]+=v[2]*dt;v[0]*=.985}pg.attributes.position.needsUpdate=true;pmat.opacity=Math.max(0,1-R.pAge/1.8)}
      if(R.ot>4.4&&!R.shown){R.shown=true;R.cb&&R.cb.onReady&&R.cb.onReady()}
      R.r.render(R.sc,R.cam)};loop()}
  }

  function mount(host,cb){
    if(!window.THREE)return false;
    try{
      if(!R)build();
      R.cb=cb||null;R.reset();
      host.appendChild(R.r.domElement);R.size(host);
      if(R.ro)R.ro.disconnect();
      if(window.ResizeObserver){R.ro=new ResizeObserver(()=>R.size(host));R.ro.observe(host)}
      host.onpointermove=e=>{const b=host.getBoundingClientRect();R.px=((e.clientX-b.left)/b.width-.5)*2;R.py=((e.clientY-b.top)/b.height-.5)*2;R.hov=true};
      host.onpointerleave=()=>{R.hov=false;R.px=R.py=0};
      host.onpointerdown=openEnv;
      host.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openEnv()}};
      R.go();
      return true;
    }catch(err){console.warn("3D envelope unavailable",err);R=null;return false}
  }
  window.EnvelopeScene={mount,open:openEnv};
})();
