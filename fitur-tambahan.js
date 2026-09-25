/* ==== FITUR TAMBAHAN DQH AL-HUDA ==== */
(function(){
"use strict";
function getTheme(){return localStorage.getItem("dqh_theme")||"terang";}
function applyTheme(t){document.documentElement.setAttribute("data-theme",t);localStorage.setItem("dqh_theme",t);}
function injectThemeBtn(){
  var host=document.querySelector(".admin-head")||document.querySelector(".wali-topbar");
  if(!host||host.querySelector("[data-ft='theme']"))return;
  var b=document.createElement("button");b.type="button";b.className="theme-btn";b.setAttribute("data-ft","theme");
  b.textContent=(getTheme()==="gelap")?"☀️ Terang":"🌙 Gelap";host.appendChild(b);
}
document.addEventListener("click",function(e){
  var t=e.target.closest("[data-ft='theme']");if(!t)return;
  var n=(getTheme()==="gelap")?"terang":"gelap";applyTheme(n);
  t.textContent=(n==="gelap")?"☀️ Terang":"🌙 Gelap";
});
applyTheme(getTheme());
function monthKeys(){var o=[],d=new Date();for(var i=11;i>=0;i--){var x=new Date(d.getFullYear(),d.getMonth()-i,1);o.push(x.toISOString().slice(0,7));}return o;}
function trendSVG(sid){
  var ks=monthKeys(),vs=ks.map(function(k){var s=0;state.pembayaran.forEach(function(p){if(p.santriId===sid&&(p.tanggal||"").slice(0,7)===k)s+=Number(p.nominal||0);});return s;});
  var max=Math.max.apply(null,vs.concat([1])),W=300,H=90,P=8;
  var pts=vs.map(function(v,i){var x=P+i*(W-2*P)/11,y=H-P-(v/max)*(H-2*P);return x.toFixed(1)+","+y.toFixed(1);});
  var dots=vs.map(function(v,i){var x=P+i*(W-2*P)/11,y=H-P-(v/max)*(H-2*P);return '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="3" fill="#0B7285"/>';}).join("");
  return '<svg class="trend-svg" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none"><polyline fill="none" stroke="#F76707" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="'+pts.join(" ")+'"/>'+dots+'</svg>';
}
function injectTrend(){
  var tl=document.querySelector(".tl");if(!tl||document.getElementById("ftTrend"))return;
  var sid=state.session&&state.session.santriId;if(!sid)return;
  var c=document.createElement("div");c.className="card";c.id="ftTrend";
  c.innerHTML='<h3>Tren Pembayaran 12 Bulan</h3>'+trendSVG(sid)+'<div class="trend-note">Titik = total pembayaran per bulan (12 bulan terakhir).</div>';
  tl.parentNode.insertBefore(c,tl);
}
function maybeNotify(){
  if(!(state.session&&state.session.role==="admin"))return;
  var t=tunggakanList();if(!t.length)return;
  if(new Date().getDate()<=10)return;
  if(!("Notification" in window))return;
  if(Notification.permission==="default"){Notification.requestPermission();return;}
  if(Notification.permission!=="granted")return;
  if(localStorage.getItem("dqh_notif_"+today()))return;
  localStorage.setItem("dqh_notif_"+today(),"1");
  new Notification("DQH AL-HUDA • Pengingat Tunggakan",{body:t.length+" santri menunggak, total "+rupiah(allSum().sisa)+". Buka Laporan & WA untuk kirim pengingat."});
}
function terbilang(n){var a=["","satu","dua","tiga","empat","lima","enam","tujuh","delapan","sembilan","sepuluh","sebelas"];
function t(x){if(x<12)return a[x];if(x<20)return t(x-10)+" belas";if(x<100)return t(Math.floor(x/10))+" puluh "+t(x%10);if(x<200)return "seratus "+t(x-100);if(x<1000)return t(Math.floor(x/100))+" ratus "+t(x%100);if(x<2000)return "seribu "+t(x-1000);if(x<1e6)return t(Math.floor(x/1000))+" ribu "+t(x%1000);if(x<1e9)return t(Math.floor(x/1e6))+" juta "+t(x%1e6);return "";}
return (t(Math.floor(n))+" rupiah").replace(/\s+/g," ").trim();}
function buatKwitansi(pay){
  var s=state.santri.find(function(x){return x.id===pay.santriId;})||{nama:"-",waliNama:"-",nik:"-",kelas:"-"};
  var sum=taSum(s.id,pay.ta);
  var img=new Image();img.onload=function(){render(img);};img.onerror=function(){render(null);};img.src="logo.png";
  function render(logo){
    var W=900,H=1150,c=document.createElement("canvas");c.width=W;c.height=H;var x=c.getContext("2d");
    x.fillStyle="#fff";x.fillRect(0,0,W,H);
    x.strokeStyle="#073B44";x.lineWidth=6;x.strokeRect(20,20,W-40,H-40);
    x.strokeStyle="#F76707";x.lineWidth=2;x.strokeRect(30,30,W-60,H-60);
    var y=70;
    if(logo)x.drawImage(logo,50,y-10,110,110);
    x.fillStyle="#073B44";x.font="bold 28px Arial";x.textAlign="left";
    x.fillText("PONDOK PESANTREN DARUL QURAN WAL HADITS",180,y+20);
    x.fillText("AL-HUDA SUKOHARJO",180,y+52);
    x.font="15px Arial";x.fillStyle="#333";
    x.fillText("Karanganyar Rt.02/Rw.06, Weru, Sukoharjo - Jawa Tengah 57562",180,y+80);
    x.fillText("WA 088215602211",180,y+102);
    y+=150;x.strokeStyle="#073B44";x.lineWidth=3;x.beginPath();x.moveTo(50,y);x.lineTo(W-50,y);x.stroke();
    y+=50;x.fillStyle="#073B44";x.font="bold 34px Arial";x.textAlign="center";
    x.fillText("KWITANSI PEMBAYARAN",W/2,y);
    y+=34;x.font="18px Arial";x.fillStyle="#333";
    x.fillText("No: "+(pay.no||"-")+"   |   Tanggal: "+(pay.tanggal||""),W/2,y);
    y+=60;x.textAlign="left";x.font="22px Arial";x.fillStyle="#111";
    x.fillText("Sudah terima dari    : "+(s.waliNama||"-"),70,y);
    y+=40;x.fillText("Nama santri             : "+s.nama+"  (NIS "+s.nik+")",70,y);
    y+=40;x.fillText("Kelas / Tahun Ajaran : "+s.kelas+"  /  "+pay.ta,70,y);
    y+=40;x.fillText("Untuk pembayaran   : "+pay.nama,70,y);
    y+=40;x.fillText("Metode                      : "+(pay.metode||"-"),70,y);
    y+=60;x.font="bold 40px Arial";x.fillStyle="#0B7285";
    x.fillText("Rp "+Number(pay.nominal).toLocaleString("id-ID"),70,y);
    y+=36;x.font="italic 20px Arial";x.fillStyle="#333";
    x.fillText("Terbilang: "+terbilang(pay.nominal),70,y);
    y+=50;x.font="20px Arial";
    x.fillText("Sisa kewajiban setelah ini: Rp "+Number(sum.sisa).toLocaleString("id-ID"),70,y);
    x.textAlign="right";x.font="20px Arial";x.fillStyle="#111";
    x.fillText("Sukoharjo, "+(pay.tanggal||""),W-70,H-190);
    x.fillText("Bendahara,",W-70,H-160);
    x.fillText("( ............................ )",W-70,H-90);
    x.textAlign="center";x.font="14px Arial";x.fillStyle="#666";
    x.fillText("Kwitansi otomatis Portal Administrasi DQH AL-HUDA",W/2,H-50);
    showModal(c,pay,s);
  }
}
function showModal(canvas,pay,s){
  closeKw();
  var mask=document.createElement("div");mask.className="kw-mask";mask.id="kwMask";
  var box=document.createElement("div");box.className="kw-box";
  var im=document.createElement("img");im.src=canvas.toDataURL("image/png");
  var act=document.createElement("div");act.className="kw-actions";
  var b1=document.createElement("button");b1.className="btn btn-primary btn-sm";b1.textContent="⬇ Unduh PNG";
  b1.onclick=function(){var a=document.createElement("a");a.download="kwitansi-"+(pay.no||"trx")+".png";a.href=im.src;a.click();};
  var b2=document.createElement("button");b2.className="btn btn-light btn-sm";b2.textContent="🖨 Cetak";
  b2.onclick=function(){var w=window.open("");w.document.write('<img src="'+im.src+'" style="width:100%"/>');w.document.close();w.focus();w.print();};
  var b3=document.createElement("button");b3.className="btn btn-orange btn-sm";b3.textContent="📲 WA Wali";
  b3.onclick=function(){var num=waNum(s.waliHp);if(!num){showToast("Nomor WA wali kosong","error");return;}
    var txt="Assalamu'alaikum "+s.waliNama+", kwitansi pembayaran "+pay.nama+" ananda "+s.nama+" sebesar Rp "+Number(pay.nominal).toLocaleString("id-ID")+" pada "+pay.tanggal+". (Gambar kwitansi dilampirkan menyusul.)";
    window.open("https://wa.me/"+num+"?text="+encodeURIComponent(txt));};
  var b4=document.createElement("button");b4.className="btn btn-danger btn-sm";b4.textContent="Tutup";b4.onclick=closeKw;
  act.appendChild(b1);act.appendChild(b2);act.appendChild(b3);act.appendChild(b4);
  box.appendChild(im);box.appendChild(act);mask.appendChild(box);document.body.appendChild(mask);
}
function closeKw(){var m=document.getElementById("kwMask");if(m)m.remove();}
function injectRiwayatKw(){
  if(!(state.session&&state.session.role==="wali"))return;
  var items=document.querySelectorAll(".tl-item");if(!items.length)return;
  var rs=state.pembayaran.filter(function(p){return p.santriId===state.session.santriId;}).sort(function(a,b){return (b.tanggal||"").localeCompare(a.tanggal||"");});
  items.forEach(function(el,i){
    if(el.querySelector("[data-ft='kw']"))return;var p=rs[i];if(!p)return;
    var b=document.createElement("button");b.className="btn btn-light btn-sm";b.setAttribute("data-ft","kw");b.textContent="🧾";
    b.onclick=function(){buatKwitansi(p);};
    var top=el.querySelector(".tl-top");if(top)top.appendChild(b);
  });
}
function injectAdminKw(){
  if(!(state.session&&state.session.role==="admin"))return;
  if(!document.getElementById("tableBayar"))return;
  var ph=document.querySelector(".admin-content .page-head");if(!ph||ph.querySelector("[data-ft='kwlast']"))return;
  var b=document.createElement("button");b.className="btn btn-light btn-sm";b.setAttribute("data-ft","kwlast");b.textContent="🧾 Kwitansi Terakhir";
  b.onclick=function(){var p=state.pembayaran[state.pembayaran.length-1];if(p)buatKwitansi(p);else showToast("Belum ada pembayaran");};
  var qa=ph.querySelector(".qa-row");if(qa)qa.appendChild(b);else ph.appendChild(b);
}
var lastLen=null;
function postRender(){
  injectThemeBtn();injectTrend();injectAdminKw();injectRiwayatKw();maybeNotify();
  var n=state.pembayaran.length;
  if(lastLen===null){lastLen=n;}
  else if(n>lastLen&&state.session&&state.session.role==="admin"){
    var p=state.pembayaran[state.pembayaran.length-1];if(p)buatKwitansi(p);
  }
  lastLen=n;
}
if(typeof window.render==="function"&&!window.render.__ft){
  var orig=window.render;
  window.render=function(){var r=orig.apply(null,arguments);try{postRender();}catch(e){}return r;};
  window.render.__ft=true;
}
setTimeout(postRender,300);
})();

/* ==== FITUR TAMBAHAN v2 DQH AL-HUDA ==== */
(function(){
"use strict";
function getTheme(){return localStorage.getItem("dqh_theme")||"terang";}
function applyTheme(t){document.documentElement.setAttribute("data-theme",t);localStorage.setItem("dqh_theme",t);}
function injectThemeBtn(){var host=document.querySelector(".admin-head")||document.querySelector(".wali-topbar");if(!host||host.querySelector("[data-ft='theme']"))return;var b=document.createElement("button");b.type="button";b.className="theme-btn";b.setAttribute("data-ft","theme");b.textContent=(getTheme()==="gelap")?"☀️ Terang":"🌙 Gelap";host.appendChild(b);}
document.addEventListener("click",function(e){var t=e.target.closest("[data-ft='theme']");if(!t)return;var n=(getTheme()==="gelap")?"terang":"gelap";applyTheme(n);t.textContent=(n==="gelap")?"☀️ Terang":"🌙 Gelap";});
applyTheme(getTheme());
function fixChips(){if(!(state.session&&state.session.role==="wali"))return;var wrap=document.querySelector(".wb-chips");if(!wrap)return;var s=state.santri.find(function(x){return x.id===state.session.santriId;});if(!s)return;var tas=taListOf(s.id);var ta=state.waliTA||(tas.indexOf(currentTA())>=0?currentTA():latestTA(s.id));var L=0,S=0,B=0;var sp=getSpp(s.id,ta);if(sp)MONTHS.forEach(function(m){var c=sp.months[m];if(!c||!c.t)return;var st=mStatus(c);if(st==="lunas")L++;else if(st==="seb")S++;else B++;});state.items.forEach(function(i){if(i.santriId===s.id&&i.ta===ta&&i.tarif>0){if(i.terbayar>=i.tarif)L++;else if(i.terbayar>0)S++;else B++;}});wrap.innerHTML='<span class="wb-chip">🟢 Lunas '+L+'</span><span class="wb-chip">🟠 Sebagian '+S+'</span><span class="wb-chip">⚪ Belum '+B+'</span>';}
function monthKeys(){var o=[],d=new Date();for(var i=11;i>=0;i--){var x=new Date(d.getFullYear(),d.getMonth()-i,1);o.push(x.toISOString().slice(0,7));}return o;}
function trendSVG(sid){var ks=monthKeys(),vs=ks.map(function(k){var s=0;state.pembayaran.forEach(function(p){if(p.santriId===sid&&(p.tanggal||"").slice(0,7)===k)s+=Number(p.nominal||0);});return s;});var max=Math.max.apply(null,vs.concat([1])),W=300,H=90,P=8;var pts=vs.map(function(v,i){var x=P+i*(W-2*P)/11,y=H-P-(v/max)*(H-2*P);return x.toFixed(1)+","+y.toFixed(1);});var dots=vs.map(function(v,i){var x=P+i*(W-2*P)/11,y=H-P-(v/max)*(H-2*P);return '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="3" fill="#0B7285"/>';}).join("");return '<svg class="trend-svg" viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none"><polyline fill="none" stroke="#F76707" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="'+pts.join(" ")+'"/>'+dots+'</svg>';}
function injectTrend(){var tl=document.querySelector(".tl");if(!tl||document.getElementById("ftTrend"))return;var sid=state.session&&state.session.santriId;if(!sid)return;var c=document.createElement("div");c.className="card";c.id="ftTrend";c.innerHTML='<h3>Tren Pembayaran 12 Bulan</h3>'+trendSVG(sid)+'<div class="trend-note">Titik = total pembayaran per bulan (12 bulan terakhir).</div>';tl.parentNode.insertBefore(c,tl);}
function maybeNotify(){if(!(state.session&&state.session.role==="admin"))return;var t=tunggakanList();if(!t.length)return;if(new Date().getDate()<=10)return;if(!("Notification" in window))return;if(Notification.permission==="default"){Notification.requestPermission();return;}if(Notification.permission!=="granted")return;if(localStorage.getItem("dqh_notif_"+today()))return;localStorage.setItem("dqh_notif_"+today(),"1");new Notification("DQH AL-HUDA • Pengingat Tunggakan",{body:t.length+" santri menunggak, total "+rupiah(allSum().sisa)+". Buka Laporan & WA untuk kirim pengingat."});}
function terbilang(n){var a=["","satu","dua","tiga","empat","lima","enam","tujuh","delapan","sembilan","sepuluh","sebelas"];function t(x){if(x<12)return a[x];if(x<20)return t(x-10)+" belas";if(x<100)return t(Math.floor(x/10))+" puluh "+t(x%10);if(x<200)return "seratus "+t(x-100);if(x<1000)return t(Math.floor(x/100))+" ratus "+t(x%100);if(x<2000)return "seribu "+t(x-1000);if(x<1e6)return t(Math.floor(x/1000))+" ribu "+t(x%1000);if(x<1e9)return t(Math.floor(x/1e6))+" juta "+t(x%1e6);return "";}return (t(Math.floor(n))+" rupiah").replace(/\s+/g," ").trim();}
function buatKwitansi(pay){var s=state.santri.find(function(x){return x.id===pay.santriId;})||{nama:"-",waliNama:"-",nik:"-",kelas:"-"};var sum=taSum(s.id,pay.ta);var img=new Image();img.onload=function(){render(img);};img.onerror=function(){render(null);};img.src="logo.png";
function render(logo){var W=900,H=1150,c=document.createElement("canvas");c.width=W;c.height=H;var x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,W,H);x.strokeStyle="#073B44";x.lineWidth=6;x.strokeRect(20,20,W-40,H-40);x.strokeStyle="#F76707";x.lineWidth=2;x.strokeRect(30,30,W-60,H-60);var y=70;if(logo)x.drawImage(logo,50,y-10,110,110);x.fillStyle="#073B44";x.font="bold 28px Arial";x.textAlign="left";x.fillText("PONDOK PESANTREN DARUL QURAN WAL HADITS",180,y+20);x.fillText("AL-HUDA SUKOHARJO",180,y+52);x.font="15px Arial";x.fillStyle="#333";x.fillText("Karanganyar Rt.02/Rw.06, Weru, Sukoharjo - Jawa Tengah 57562",180,y+80);x.fillText("WA 088215602211",180,y+102);y+=150;x.strokeStyle="#073B44";x.lineWidth=3;x.beginPath();x.moveTo(50,y);x.lineTo(W-50,y);x.stroke();y+=50;x.fillStyle="#073B44";x.font="bold 34px Arial";x.textAlign="center";x.fillText("KWITANSI PEMBAYARAN",W/2,y);y+=34;x.font="18px Arial";x.fillStyle="#333";x.fillText("No: "+(pay.no||"-")+"   |   Tanggal: "+(pay.tanggal||""),W/2,y);y+=60;x.textAlign="left";x.font="22px Arial";x.fillStyle="#111";x.fillText("Sudah terima dari    : "+(s.waliNama||"-"),70,y);y+=40;x.fillText("Nama santri             : "+s.nama+"  (NIS "+s.nik+")",70,y);y+=40;x.fillText("Kelas / Tahun Ajaran : "+s.kelas+"  /  "+pay.ta,70,y);y+=40;x.fillText("Untuk pembayaran   : "+pay.nama,70,y);y+=40;x.fillText("Metode                      : "+(pay.metode||"-"),70,y);y+=60;x.font="bold 40px Arial";x.fillStyle="#0B7285";x.fillText("Rp "+Number(pay.nominal).toLocaleString("id-ID"),70,y);y+=36;x.font="italic 20px Arial";x.fillStyle="#333";x.fillText("Terbilang: "+terbilang(pay.nominal),70,y);y+=50;x.font="20px Arial";x.fillText("Sisa kewajiban setelah ini: Rp "+Number(sum.sisa).toLocaleString("id-ID"),70,y);x.textAlign="right";x.font="20px Arial";x.fillStyle="#111";x.fillText("Sukoharjo, "+(pay.tanggal||""),W-70,H-190);x.fillText("Bendahara,",W-70,H-160);x.fillText("( ............................ )",W-70,H-90);x.textAlign="center";x.font="14px Arial";x.fillStyle="#666";x.fillText("Kwitansi otomatis Portal Administrasi DQH AL-HUDA",W/2,H-50);showModal(c,pay,s);};}
function showModal(canvas,pay,s){closeKw();var mask=document.createElement("div");mask.className="kw-mask";mask.id="kwMask";var box=document.createElement("div");box.className="kw-box";var im=document.createElement("img");im.src=canvas.toDataURL("image/png");var act=document.createElement("div");act.className="kw-actions";var b1=document.createElement("button");b1.className="btn btn-primary btn-sm";b1.textContent="⬇ Unduh PNG";b1.onclick=function(){var a=document.createElement("a");a.download="kwitansi-"+(pay.no||"trx")+".png";a.href=im.src;a.click();};var b2=document.createElement("button");b2.className="btn btn-light btn-sm";b2.textContent="🖨 Cetak";b2.onclick=function(){var w=window.open("");w.document.write('<img src="'+im.src+'" style="width:100%"/>');w.document.close();w.focus();w.print();};var b3=document.createElement("button");b3.className="btn btn-orange btn-sm";b3.textContent="📲 WA Wali";b3.onclick=function(){var num=waNum(s.waliHp);if(!num){showToast("Nomor WA wali kosong","error");return;}var txt="Assalamu'alaikum "+s.waliNama+", kwitansi pembayaran "+pay.nama+" ananda "+s.nama+" sebesar Rp "+Number(pay.nominal).toLocaleString("id-ID")+" pada "+pay.tanggal+". (Gambar kwitansi dilampirkan menyusul.)";window.open("https://wa.me/"+num+"?text="+encodeURIComponent(txt));};var b4=document.createElement("button");b4.className="btn btn-danger btn-sm";b4.textContent="Tutup";b4.onclick=closeKw;act.appendChild(b1);act.appendChild(b2);act.appendChild(b3);act.appendChild(b4);box.appendChild(im);box.appendChild(act);mask.appendChild(box);document.body.appendChild(mask);}
function closeKw(){var m=document.getElementById("kwMask");if(m)m.remove();}
function injectRiwayatKw(){if(!(state.session&&state.session.role==="wali"))return;var items=document.querySelectorAll(".tl-item");if(!items.length)return;var rs=state.pembayaran.filter(function(p){return p.santriId===state.session.santriId;}).sort(function(a,b){return (b.tanggal||"").localeCompare(a.tanggal||"");});items.forEach(function(el,i){if(el.querySelector("[data-ft='kw']"))return;var p=rs[i];if(!p)return;var b=document.createElement("button");b.className="btn btn-light btn-sm";b.setAttribute("data-ft","kw");b.textContent="🧾";b.onclick=function(){buatKwitansi(p);};var top=el.querySelector(".tl-top");if(top)top.appendChild(b);});}
function injectAdminKw(){if(!(state.session&&state.session.role==="admin"))return;if(!document.getElementById("tableBayar"))return;var ph=document.querySelector(".admin-content .page-head");if(!ph||ph.querySelector("[data-ft='kwlast']"))return;var b=document.createElement("button");b.className="btn btn-light btn-sm";b.setAttribute("data-ft","kwlast");b.textContent="🧾 Kwitansi Terakhir";b.onclick=function(){var p=state.pembayaran[state.pembayaran.length-1];if(p)buatKwitansi(p);else showToast("Belum ada pembayaran");};var qa=ph.querySelector(".qa-row");if(qa)qa.appendChild(b);else ph.appendChild(b);}
var lastLen=null;
function postRender(){injectThemeBtn();fixChips();injectTrend();injectAdminKw();injectRiwayatKw();maybeNotify();var n=state.pembayaran.length;if(lastLen===null){lastLen=n;}else if(n>lastLen&&state.session&&state.session.role==="admin"){var p=state.pembayaran[state.pembayaran.length-1];if(p)buatKwitansi(p);}lastLen=n;}
if(typeof window.render==="function"&&!window.render.__ft){var orig=window.render;window.render=function(){var r=orig.apply(null,arguments);try{postRender();}catch(e){}return r;};window.render.__ft=true;}
setTimeout(postRender,300);
})();
