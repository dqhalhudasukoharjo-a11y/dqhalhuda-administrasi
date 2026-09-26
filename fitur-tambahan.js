/* ==== FITUR TAMBAHAN v6 DQH AL-HUDA ==== */
(function(){
"use strict";
var st=document.createElement("style");
st.textContent=".theme-btn-on-dark{background:rgba(255,255,255,.18)!important;color:#fff!important}.sidebar .theme-btn{width:100%;text-align:left;border-radius:13px;padding:12px 14px;font-size:14px;font-weight:700;background:rgba(255,255,255,.08);color:rgba(255,255,255,.85)}";
document.head.appendChild(st);
/* ---------- KEAMANAN: password admin tidak pernah ke server ---------- */
var PW_HIDDEN="__HIDDEN__";
var SYNC_CODE="DQH-SINKRON-2026-ALHUDA";
function pwLocalGet(){return localStorage.getItem("dqh_admin_pw_local")||"";}
function pwLocalSet(p){localStorage.setItem("dqh_admin_pw_local",p);window._adminPwLocal=p;}
window._adminPwLocal=pwLocalGet();
function stateHidePw(){if(window.state&&window.state.users)window.state.users.forEach(function(u){if(u.username==="admin"&&u.password!==PW_HIDDEN){if(!window._adminPwLocal)pwLocalSet(u.password);u.password=PW_HIDDEN;}});}
stateHidePw();
document.addEventListener("submit",function(e){var f=e.target;if(!f||!f.dataset||f.dataset.form!=="login-admin")return;e.preventDefault();e.stopImmediatePropagation();var d=new FormData(f);var un=String(d.get("username")||"").trim();var pw=String(d.get("password")||"");var u=state.users.find(function(x){return x.username===un;});var ok=false;if(u){if(window._adminPwLocal){ok=(pw===window._adminPwLocal);}else if(u.password!==PW_HIDDEN){ok=(pw===u.password);if(ok)pwLocalSet(pw);}}if(!ok){showToast("Username/password salah","error");return;}stateHidePw();state.session={role:"admin"};state.page="dashboard";addLog("Admin login");saveState();render();},true);
function openPwModal(loggedIn){closePw();var hasLocal=!!window._adminPwLocal;var mask=document.createElement("div");mask.className="kw-mask";mask.id="pwMask";var box=document.createElement("div");box.className="kw-box";box.style.maxWidth="380px";
var html='<h3 style="margin-bottom:4px">🔑 '+(loggedIn&&hasLocal?"Ganti Password Admin":"Setel Password Admin")+'</h3>';
if(loggedIn&&hasLocal){html+='<label>Password Lama</label><input type="password" id="pwOld"/>';}
else{html+='<div style="font-size:12px;color:var(--muted);margin-bottom:8px">Perangkat ini belum menyimpan password admin. Masukkan Kode Sinkronisasi untuk membuktikan Anda admin.</div><label>Kode Sinkronisasi</label><input type="password" id="pwCode"/>';}
html+='<label>Password Baru (min. 6 karakter)</label><input type="password" id="pwNew"/><label>Ulangi Password Baru</label><input type="password" id="pwNew2"/><div class="kw-actions"><button class="btn btn-primary btn-sm" id="pwSave">💾 Simpan</button><button class="btn btn-danger btn-sm" id="pwCancel">Batal</button></div>';
box.innerHTML=html;mask.appendChild(box);document.body.appendChild(mask);
mask.addEventListener("click",function(ev){if(ev.target===mask)closePw();});
document.getElementById("pwCancel").onclick=closePw;
document.getElementById("pwSave").onclick=function(){var n=document.getElementById("pwNew").value,n2=document.getElementById("pwNew2").value;
if(!(loggedIn&&hasLocal)){var code=(document.getElementById("pwCode")||{}).value||"";if(code!==SYNC_CODE){showToast("Kode sinkronisasi salah","error");return;}}
else{var o=document.getElementById("pwOld").value;if(o!==window._adminPwLocal){showToast("Password lama salah","error");return;}}
if(n.length<6){showToast("Password baru minimal 6 karakter","error");return;}
if(n!==n2){showToast("Konfirmasi tidak sama","error");return;}
pwLocalSet(n);stateHidePw();saveState();if(window.SYNC)window.SYNC.push();closePw();showToast("Password admin tersimpan aman ✅ (hanya di perangkat ini)");};}
function closePw(){var m=document.getElementById("pwMask");if(m)m.remove();}
document.addEventListener("click",function(e){if(e.target.closest("[data-ft='pw']")){openPwModal(!!(state.session&&state.session.role==="admin"));}});
function injectLoginPw(){if(state.session)return;var card=document.querySelector(".login-card");if(!card||card.querySelector("[data-ft='pwlogin']"))return;var b=document.createElement("button");b.type="button";b.className="link-btn";b.setAttribute("data-ft","pwlogin");b.textContent="🔑 Setel password admin di perangkat ini";b.onclick=function(){openPwModal(false);};card.appendChild(b);}
function fixDemoBox(){var db=document.querySelector(".demo-box");if(db&&!db.dataset.ft){db.dataset.ft="1";db.innerHTML="<b>Login admin:</b> password tersimpan aman per perangkat (tidak dikirim ke server).<br/>Wali: NIS + PIN (6 digit terakhir NIS).";}}
/* ---------- TEMA ---------- */
function getTheme(){return localStorage.getItem("dqh_theme")||"terang";}
function applyTheme(t){document.documentElement.setAttribute("data-theme",t);localStorage.setItem("dqh_theme",t);}
function themeLabel(){return (getTheme()==="gelap")?"☀️ Terang":"🌙 Gelap";}
function refreshThemeLabels(){document.querySelectorAll("[data-ft='theme']").forEach(function(b){b.textContent=themeLabel();});}
document.addEventListener("click",function(e){var t=e.target.closest("[data-ft='theme']");if(!t)return;var n=(getTheme()==="gelap")?"terang":"gelap";applyTheme(n);refreshThemeLabels();});
applyTheme(getTheme());
/* ---------- TOMBOL ---------- */
function mkBtn(ft,cls,label){var b=document.createElement("button");b.type="button";b.className=cls;b.setAttribute("data-ft",ft);b.textContent=label;return b;}
function place(host,btn,ref){if(!host)return;if(host.querySelector("[data-ft='"+btn.getAttribute("data-ft")+"']"))return;if(ref&&host.contains(ref))host.insertBefore(btn,ref);else host.appendChild(btn);}
function injectControls(){
  var isAdmin=state.session&&state.session.role==="admin";
  var isWali=state.session&&state.session.role==="wali";
  if(isAdmin){
    var sb=document.querySelector(".sidebar");
    var sbOut=sb?sb.querySelector("[data-action='logout']"):null;
    place(sb,mkBtn("pw","theme-btn","🔑 Ganti Password"),sbOut);
    place(sb,mkBtn("theme","theme-btn",themeLabel()),sb?sb.querySelector("[data-ft='pw']"):null);
    var ah=document.querySelector(".admin-head");
    place(ah,mkBtn("pw","theme-btn","🔑"),null);
    place(ah,mkBtn("theme","theme-btn",themeLabel()),null);
  }
  if(isWali){
    place(document.querySelector(".wali-topbar"),mkBtn("theme","theme-btn",themeLabel()),null);
    var wht=document.querySelector(".wh-top");
    place(wht,mkBtn("theme","theme-btn theme-btn-on-dark",themeLabel()),wht?wht.querySelector(".wh-logout"):null);
  }
}
/* ---------- TAGIH BULAN DEPAN ---------- */
function injectBulkFill(){if(!(state.session&&state.session.role==="admin"))return;if(!document.querySelector("form[data-form='gen-ta']"))return;var ph=document.querySelector(".admin-content .page-head");if(!ph||ph.querySelector("[data-ft='bulkfill']"))return;var b=document.createElement("button");b.className="btn btn-primary btn-sm";b.setAttribute("data-ft","bulkfill");b.textContent="⚡ Tagihkan Bulan Depan (Semua Santri)";b.onclick=bulkFill;ph.appendChild(b);}
function bulkFill(){var cut=sppNowIndex();var n=0;state.santri.forEach(function(s){var ta=latestTA(s.id);var sp=getSpp(s.id,ta);if(!sp)return;var rate=sp.tarif||0;if(!rate)return;MONTHS.forEach(function(m,i){if(i<=cut)return;var c=sp.months[m]||{t:0,b:0};if(!c.t){c.t=rate;sp.months[m]=c;n++;}});});saveState();render();showToast(n+" bulan depan ditagihkan untuk semua santri ✅");}
document.addEventListener("submit",function(e){var f=e.target;if(f&&f.dataset&&f.dataset.form==="set-spp"){setTimeout(function(){var sid=state.tarifSantri;if(!sid)return;var sp=getSpp(sid,latestTA(sid));if(!sp)return;var rate=sp.tarif||0;MONTHS.forEach(function(m){var c=sp.months[m]||{t:0,b:0};if(!c.t&&rate)c.t=rate;sp.months[m]=c;});saveState();render();},0);}});
/* ---------- TOTAL & TUNGGAKAN HANYA JATUH TEMPO ---------- */
window.taSum=function(sid,ta){var t=0,b=0,cut=sppNowIndex();var sp=getSpp(sid,ta);if(sp)MONTHS.forEach(function(m,i){var c=sp.months[m]||{t:0,b:0};if(i<=cut||c.b>0){t+=c.t;b+=Math.min(c.b,c.t);}});state.items.forEach(function(x){if(x.santriId===sid&&x.ta===ta){t+=x.tarif;b+=Math.min(x.terbayar,x.tarif);}});return{total:t,dibayar:b,sisa:t-b};};
window.allSum=function(sid){var t=0,b=0,cut=sppNowIndex();state.spp.forEach(function(sp){if(!sid||sp.santriId===sid)MONTHS.forEach(function(m,i){var c=sp.months[m]||{t:0,b:0};if(i<=cut||c.b>0){t+=c.t;b+=Math.min(c.b,c.t);}});});state.items.forEach(function(x){if(!sid||x.santriId===sid){t+=x.tarif;b+=Math.min(x.terbayar,x.tarif);}});return{total:t,dibayar:b,sisa:t-b};};
window.sisaList=function(sid,ta){var out=[],cut=sppNowIndex();var sp=getSpp(sid,ta);if(sp)MONTHS.forEach(function(m,i){var c=sp.months[m];if(c&&c.t>c.b&&i<=cut)out.push({key:"SPP:"+m,label:"SPP "+MONTH_ID[m]+" "+ta,sisa:c.t-c.b,st:mStatus(c)});});state.items.forEach(function(x){if(x.santriId===sid&&x.ta===ta&&x.tarif>x.terbayar)out.push({key:"ITEM:"+x.id,label:x.nama,sisa:x.tarif-x.terbayar,st:x.terbayar>0?"seb":"belum"});});return out;};
/* ---------- CHIP AKURAT ---------- */
function fixChips(){if(!(state.session&&state.session.role==="wali"))return;var wrap=document.querySelector(".wb-chips");if(!wrap)return;var s=state.santri.find(function(x){return x.id===state.session.santriId;});if(!s)return;var tas=taListOf(s.id);var ta=state.waliTA||(tas.indexOf(currentTA())>=0?currentTA():latestTA(s.id));var cut=sppNowIndex();var L=0,S=0,B=0;var sp=getSpp(s.id,ta);if(sp)MONTHS.forEach(function(m,i){var c=sp.months[m];if(!c||!c.t)return;if(i>cut&&c.b===0)return;var st2=mStatus(c);if(st2==="lunas")L++;else if(st2==="seb")S++;else B++;});state.items.forEach(function(i){if(i.santriId===s.id&&i.ta===ta&&i.tarif>0){if(i.terbayar>=i.tarif)L++;else if(i.terbayar>0)S++;else B++;}});wrap.innerHTML='<span class="wb-chip">🟢 Lunas '+L+'</span><span class="wb-chip">🟠 Sebagian '+S+'</span><span class="wb-chip">⚪ Belum '+B+'</span>';}
/* ---------- TREN ---------- */
function monthKeys(){var o=[],d=new Date();for(var i=11;i>=0;i--){var x=new Date(d.getFullYear(),d.getMonth()-i,1);o.push(x.toISOString().slice(0,7));}return o;}
function trendSVG(sid){var ks=monthKeys(),vs=ks.map(function(k){var s=0;state.pembayaran.forEach(function(p){if(p.santriId===sid&&(p.tanggal||"").slice(0,7)===k)s+=Number(p.nominal||0);});return s;});var max=Math.max.apply(null,vs.concat([1])),W=300,H=90,P=8;var pts=vs.map(function(v,i){var x=P+i*(W-2*P)/11,y=H-P-(v/max)*(H-2*P);return x.toFixed(1)+","+y.toFixed(1);});var dots=vs.map(function(v,i){var x=P+i*(W-2*P)/11,y=H-P-(v/max)*(H-2*P);return '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="3" fill="#0B7285"/>';}).join("");return '<svg class="trend-svg" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none"><polyline fill="none" stroke="#F76707" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="'+pts.join(" ")+'"/>'+dots+'</svg>';}
function injectTrend(){var tl=document.querySelector(".tl");if(!tl||document.getElementById("ftTrend"))return;var sid=state.session&&state.session.santriId;if(!sid)return;var c=document.createElement("div");c.className="card";c.id="ftTrend";c.innerHTML='<h3>Tren Pembayaran 12 Bulan</h3>'+trendSVG(sid)+'<div class="trend-note">Titik = total pembayaran per bulan (12 bulan terakhir).</div>';tl.parentNode.insertBefore(c,tl);}
/* ---------- NOTIF ---------- */
function maybeNotify(){if(!(state.session&&state.session.role==="admin"))return;var t=tunggakanList();if(!t.length)return;if(new Date().getDate()<=10)return;if(!("Notification" in window))return;if(Notification.permission==="default"){Notification.requestPermission();return;}if(Notification.permission!=="granted")return;if(localStorage.getItem("dqh_notif_"+today()))return;localStorage.setItem("dqh_notif_"+today(),"1");new Notification("DQH AL-HUDA • Pengingat Tunggakan",{body:t.length+" santri menunggak, total "+rupiah(allSum().sisa)+". Buka Laporan & WA untuk kirim pengingat."});}
/* ---------- KWITANSI MODERN ---------- */
function terbilang(n){var a=["","satu","dua","tiga","empat","lima","enam","tujuh","delapan","sembilan","sepuluh","sebelas"];function t(x){if(x<12)return a[x];if(x<20)return t(x-10)+" belas";if(x<100)return t(Math.floor(x/10))+" puluh "+t(x%10);if(x<200)return "seratus "+t(x-100);if(x<1000)return t(Math.floor(x/100))+" ratus "+t(x%100);if(x<2000)return "seribu "+t(x-1000);if(x<1e6)return t(Math.floor(x/1000))+" ribu "+t(x%1000);if(x<1e9)return t(Math.floor(x/1e6))+" juta "+t(x%1e6);return "";}return (t(Math.floor(n))+" rupiah").replace(/\s+/g," ").trim();}
function rr(c,X,Y,W,H,R){c.beginPath();c.moveTo(X+R,Y);c.arcTo(X+W,Y,X+W,Y+H,R);c.arcTo(X+W,Y+H,X,Y+H,R);c.arcTo(X,Y+H,X,Y,R);c.arcTo(X,Y,X+W,Y,R);c.closePath();}
function wrapText(c,text,x,y,maxW,lh){var words=String(text).split(" "),line="";for(var i=0;i<words.length;i++){var t=line+words[i]+" ";if(c.measureText(t).width>maxW&&i>0){c.fillText(line,x,y);line=words[i]+" ";y+=lh;}else line=t;}c.fillText(line,x,y);return y+lh;}
function buatKwitansi(pay){var s=state.santri.find(function(x){return x.id===pay.santriId;})||{nama:"-",waliNama:"-",nik:"-",kelas:"-"};var sum=taSum(s.id,pay.ta);var img=new Image();img.onload=function(){render(img);};img.onerror=function(){render(null);};img.src="logo.png";
function render(logo){var W=900,H=1240,cv=document.createElement("canvas");cv.width=W;cv.height=H;var c=cv.getContext("2d");
c.fillStyle="#F4F9FA";c.fillRect(0,0,W,H);
rr(c,24,24,W-48,H-48,28);c.fillStyle="#FFFFFF";c.fill();c.lineWidth=2;c.strokeStyle="#DCEBED";c.stroke();
c.save();rr(c,24,24,W-48,H-48,28);c.clip();var g0=c.createLinearGradient(24,0,W-24,0);g0.addColorStop(0,"#073B44");g0.addColorStop(1,"#0B7285");c.fillStyle=g0;c.fillRect(24,24,W-48,14);c.restore();
if(logo){c.save();rr(c,64,76,104,104,22);c.clip();c.drawImage(logo,64,76,104,104);c.restore();c.lineWidth=2;c.strokeStyle="#E3EEF0";rr(c,64,76,104,104,22);c.stroke();}
c.textAlign="left";c.fillStyle="#073B44";c.font="800 27px 'Segoe UI',Arial";c.fillText("PONDOK PESANTREN DARUL QURAN",200,112);c.fillText("WAL HADITS AL-HUDA SUKOHARJO",200,144);
c.fillStyle="#6B8A90";c.font="400 14px 'Segoe UI',Arial";c.fillText("Karanganyar Rt.02/Rw.06, Weru, Sukoharjo — Jawa Tengah 57562",200,170);c.fillText("WA 088215602211 • Portal Administrasi Santri",200,190);
c.strokeStyle="#073B44";c.lineWidth=2.5;c.beginPath();c.moveTo(64,224);c.lineTo(W-64,224);c.stroke();c.strokeStyle="#E3EEF0";c.lineWidth=1;c.beginPath();c.moveTo(64,229);c.lineTo(W-64,229);c.stroke();
c.textAlign="center";c.fillStyle="#0B7285";c.font="800 26px 'Segoe UI',Arial";c.fillText("K W I T A N S I   P E M B A Y A R A N",W/2,280);
var meta="No. "+(pay.no||"-")+"   •   "+(pay.tanggal||"");c.font="600 14px 'Segoe UI',Arial";var mw=c.measureText(meta).width+36;rr(c,W/2-mw/2,298,mw,34,17);c.fillStyle="#E6F7F9";c.fill();c.fillStyle="#0B7285";c.fillText(meta,W/2,320);
var y=386;function row(label,value){c.textAlign="left";c.fillStyle="#7A9BA0";c.font="600 12px 'Segoe UI',Arial";c.fillText(label.toUpperCase(),64,y);c.fillStyle="#12333A";c.font="600 17px 'Segoe UI',Arial";c.fillText(value,300,y);c.strokeStyle="#EDF4F5";c.lineWidth=1;c.beginPath();c.moveTo(64,y+14);c.lineTo(W-64,y+14);c.stroke();y+=46;}
row("Diterima dari",s.waliNama||"-");
row("Nama santri",s.nama+"  (NIS "+s.nik+")");
row("Kelas / Tahun Ajaran",s.kelas+"  /  "+pay.ta);
row("Untuk pembayaran",pay.nama);
row("Metode",pay.metode||"-");
var py=y+10;var g1=c.createLinearGradient(64,py,W-64,py);g1.addColorStop(0,"#0B7285");g1.addColorStop(1,"#12B0BE");rr(c,64,py,W-128,120,20);c.fillStyle=g1;c.fill();
c.textAlign="left";c.fillStyle="rgba(255,255,255,.85)";c.font="600 12px 'Segoe UI',Arial";c.fillText("TOTAL DIBAYAR",96,py+40);
c.fillStyle="#FFFFFF";c.font="800 40px 'Segoe UI',Arial";c.fillText("Rp "+Number(pay.nominal).toLocaleString("id-ID"),96,py+90);
c.textAlign="left";c.fillStyle="#5E7680";c.font="italic 400 14px 'Segoe UI',Arial";var ty=wrapText(c,"Terbilang: "+terbilang(pay.nominal),64,py+152,W-128,20);
var sy=ty+14;rr(c,64,sy,W-128,52,14);c.fillStyle="#FFF6E6";c.fill();c.lineWidth=1.5;c.strokeStyle="#FDBA74";c.stroke();c.fillStyle="#B54708";c.font="600 15px 'Segoe UI',Arial";c.fillText("Sisa kewajiban setelah pembayaran:  Rp "+Number(sum.sisa).toLocaleString("id-ID"),92,sy+32);
var fy=H-252;c.textAlign="right";c.fillStyle="#12333A";c.font="600 15px 'Segoe UI',Arial";c.fillText("Sukoharjo, "+(pay.tanggal||""),W-72,fy);c.fillText("Bendahara,",W-72,fy+26);c.strokeStyle="#9BB5BA";c.lineWidth=1;c.beginPath();c.moveTo(W-260,fy+96);c.lineTo(W-72,fy+96);c.stroke();c.fillStyle="#5E7680";c.font="400 13px 'Segoe UI',Arial";c.fillText("( ................................ )",W-72,fy+118);
c.textAlign="center";c.fillStyle="#9BB5BA";c.font="400 12px 'Segoe UI',Arial";c.fillText("Kwitansi otomatis Portal Administrasi DQH AL-HUDA — sah tanpa stempel & tanda tangan basah.",W/2,H-64);
showModal(cv,pay,s);};}
function showModal(canvas,pay,s){closeKw();var mask=document.createElement("div");mask.className="kw-mask";mask.id="kwMask";var box=document.createElement("div");box.className="kw-box";var im=document.createElement("img");im.src=canvas.toDataURL("image/png");var act=document.createElement("div");act.className="kw-actions";var b1=document.createElement("button");b1.className="btn btn-primary btn-sm";b1.textContent="⬇ Unduh PNG";b1.onclick=function(){var a=document.createElement("a");a.download="kwitansi-"+(pay.no||"trx")+".png";a.href=im.src;a.click();};var b2=document.createElement("button");b2.className="btn btn-light btn-sm";b2.textContent="🖨 Cetak";b2.onclick=function(){var w=window.open("");w.document.write('<img src="'+im.src+'" style="width:100%"/>');w.document.close();w.focus();w.print();};var b3=document.createElement("button");b3.className="btn btn-orange btn-sm";b3.textContent="📲 WA Wali";b3.onclick=function(){var num=waNum(s.waliHp);if(!num){showToast("Nomor WA wali kosong","error");return;}var txt="Assalamu'alaikum "+s.waliNama+", kwitansi pembayaran "+pay.nama+" ananda "+s.nama+" sebesar Rp "+Number(pay.nominal).toLocaleString("id-ID")+" pada "+pay.tanggal+". (Gambar kwitansi dilampirkan menyusul.)";window.open("https://wa.me/"+num+"?text="+encodeURIComponent(txt));};var b4=document.createElement("button");b4.className="btn btn-danger btn-sm";b4.textContent="Tutup";b4.onclick=closeKw;act.appendChild(b1);act.appendChild(b2);act.appendChild(b3);act.appendChild(b4);box.appendChild(im);box.appendChild(act);mask.appendChild(box);document.body.appendChild(mask);}
function closeKw(){var m=document.getElementById("kwMask");if(m)m.remove();}
function injectRiwayatKw(){if(!(state.session&&state.session.role==="wali"))return;var items=document.querySelectorAll(".tl-item");if(!items.length)return;var rs=state.pembayaran.filter(function(p){return p.santriId===state.session.santriId;}).sort(function(a,b){return (b.tanggal||"").localeCompare(a.tanggal||"");});items.forEach(function(el,i){if(el.querySelector("[data-ft='kw']"))return;var p=rs[i];if(!p)return;var b=document.createElement("button");b.className="btn btn-light btn-sm";b.setAttribute("data-ft","kw");b.textContent="🧾";b.onclick=function(){buatKwitansi(p);};var top=el.querySelector(".tl-top");if(top)top.appendChild(b);});}
function injectAdminKw(){if(!(state.session&&state.session.role==="admin"))return;if(!document.getElementById("tableBayar"))return;var ph=document.querySelector(".admin-content .page-head");if(!ph||ph.querySelector("[data-ft='kwlast']"))return;var b=document.createElement("button");b.className="btn btn-light btn-sm";b.setAttribute("data-ft","kwlast");b.textContent="🧾 Kwitansi Terakhir";b.onclick=function(){var p=state.pembayaran[state.pembayaran.length-1];if(p)buatKwitansi(p);else showToast("Belum ada pembayaran");};var qa=ph.querySelector(".qa-row");if(qa)qa.appendChild(b);else ph.appendChild(b);}
/* ---------- MESIN ---------- */
var lastLen=null;
function postRender(){injectControls();injectBulkFill();injectLoginPw();fixDemoBox();fixChips();injectTrend();injectAdminKw();injectRiwayatKw();maybeNotify();var n=state.pembayaran.length;if(lastLen===null){lastLen=n;}else if(n>lastLen&&state.session&&state.session.role==="admin"){var p=state.pembayaran[state.pembayaran.length-1];if(p)buatKwitansi(p);}lastLen=n;}
if(typeof window.render==="function"&&!window.render.__ft){var orig=window.render;window.render=function(){var r=orig.apply(null,arguments);try{postRender();}catch(e){}return r;};window.render.__ft=true;}
setTimeout(postRender,300);
setTimeout(function(){try{render();}catch(e){}},80);
})();
