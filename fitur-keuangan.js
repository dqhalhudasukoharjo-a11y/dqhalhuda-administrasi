/* ==== FITUR KEUANGAN v4 DQH AL-HUDA ==== */
(function(){
"use strict";
var st=document.createElement("style");
st.textContent=".fin-grid{display:grid;gap:16px;grid-template-columns:1fr;margin-bottom:16px;align-items:stretch}@media(min-width:1000px){.fin-grid{grid-template-columns:1.2fr .8fr}}.fin-card{display:flex;flex-direction:column;height:100%}.fin-card .fin-scroll{flex:1;min-height:300px}.fin-subtitle{font-size:11.5px;color:var(--muted);margin-top:-6px;margin-bottom:10px;line-height:1.5}.fin-table{width:100%;border-collapse:collapse;min-width:0}.fin-table th,.fin-table td{padding:9px 8px;border-bottom:1px solid var(--line);font-size:12.5px;text-align:left;vertical-align:middle}.fin-table th{color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.4px}.fin-table td.num,.fin-table th.num{text-align:right;font-variant-numeric:tabular-nums;font-weight:700}.fin-table tr.fin-total td{border-top:2px solid var(--teal-dark);border-bottom:none;font-weight:800;background:var(--teal-soft)}html[data-theme=\"gelap\"] .fin-table tr.fin-total td{background:#0f2f2e}.fin-bar{height:6px;border-radius:99px;background:var(--line);overflow:hidden;min-width:60px}.fin-bar i{display:block;height:100%;background:var(--grad-orange);border-radius:99px}.fin-chip{display:inline-block;padding:3px 8px;border-radius:999px;font-size:10.5px;font-weight:800;background:var(--teal-soft);color:var(--teal-dark)}html[data-theme=\"gelap\"] .fin-chip{background:#0f2f2e;color:#9fd8d0}.fin-scroll{max-height:420px;overflow-y:auto;border-radius:8px}.fin-footnote{font-size:11px;color:var(--muted);margin-top:10px;line-height:1.55;border-top:1px dashed var(--line);padding-top:8px}html[data-theme=\"gelap\"] .fin-footnote{border-color:#1c3a39}";
document.head.appendChild(st);
function monthName(k){var p=k.split("-");var n=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];return n[+p[1]-1]+" "+p[0];}
function compute(){
  var perMonth={},perTA={},taObl={},cut=sppNowIndex();
  state.pembayaran.forEach(function(p){
    var k=(p.tanggal||"").slice(0,7);if(!k)return;
    perMonth[k]=perMonth[k]||{sum:0,n:0};perMonth[k].sum+=Number(p.nominal||0);perMonth[k].n++;
    var ta=p.ta||"-";perTA[ta]=perTA[ta]||{sum:0,n:0};perTA[ta].sum+=Number(p.nominal||0);perTA[ta].n++;
  });
  state.spp.forEach(function(sp){taObl[sp.ta]=taObl[sp.ta]||0;MONTHS.forEach(function(m,i){var c=sp.months[m]||{t:0,b:0};if(i<=cut||c.b>0)taObl[sp.ta]+=c.t;});});
  state.items.forEach(function(i){taObl[i.ta]=(taObl[i.ta]||0)+i.tarif;});
  return {perMonth:perMonth,perTA:perTA,taObl:taObl};
}
function buildHTML(){
  var d=compute();
  var months=Object.keys(d.perMonth).sort();
  var maxM=Math.max.apply(null,months.map(function(k){return d.perMonth[k].sum;}).concat([1]));
  var grand=months.reduce(function(a,k){return a+d.perMonth[k].sum;},0);
  var rowsM=months.map(function(k){var v=d.perMonth[k];var p=Math.round(v.sum/maxM*100);
    return '<tr><td>'+monthName(k)+'</td><td class="num">'+rupiah(v.sum)+'</td><td class="num">'+v.n+' trx</td><td style="width:26%"><div class="fin-bar"><i style="width:'+p+'%"></i></div></td></tr>';}).join("");
  var tas=Object.keys(d.perTA).sort().reverse();
  var rowsTA=tas.map(function(ta){var v=d.perTA[ta];var obl=d.taObl[ta]||0;var pct=obl?Math.min(100,Math.round(v.sum/obl*100)):0;
    return '<tr><td>TA '+esc(ta)+'</td><td class="num">'+rupiah(v.sum)+'</td><td class="num">'+rupiah(obl)+'</td><td class="num"><span class="fin-chip">'+pct+'%</span></td></tr>';}).join("");
  var grandTA=tas.reduce(function(a,t){return a+d.perTA[t].sum;},0);
  var grandObl=Object.keys(d.taObl).reduce(function(a,t){return a+d.taObl[t];},0);
  var pctTA=grandObl?Math.min(100,Math.round(grandTA/grandObl*100)):0;
  return '<div class="fin-grid">'+
   '<div class="card fin-card"><h3>📅 Pemasukan per Bulan</h3>'+
   '<div class="fin-subtitle">Rincian total uang masuk & jumlah transaksi per bulan kalender, diurutkan dari bulan paling lama.</div>'+
   '<div class="fin-scroll"><table class="fin-table"><thead><tr><th>Bulan</th><th class="num">Total Masuk</th><th class="num">Jumlah Trx</th><th>Proporsi</th></tr></thead><tbody>'+rowsM+'<tr class="fin-total"><td>TOTAL SEMUA BULAN</td><td class="num">'+rupiah(grand)+'</td><td class="num">'+state.pembayaran.length+' trx</td><td></td></tr></tbody></table></div>'+
   '<div class="fin-footnote">Proporsi = total bulan itu dibanding bulan dengan pemasukan tertinggi. Tabel ini menghitung transaksi sejak 1 Juni 2026 (sesuai export Braja) + input manual; pembayaran sebelum itu sudah masuk di kartu "Sudah Dibayar".</div></div>'+
   '<div class="card fin-card"><h3>🎓 Pemasukan per Tahun Ajaran</h3>'+
   '<div class="fin-subtitle">Akumulasi pemasukan sejak tahun ajaran dimulai sampai hari ini. Berguna untuk melihat capaian tiap angkatan.</div>'+
   '<div class="fin-scroll"><table class="fin-table"><thead><tr><th>Tahun Ajaran</th><th class="num">Sudah Masuk</th><th class="num">Kewajiban</th><th class="num">Tercapai</th></tr></thead><tbody>'+rowsTA+'<tr class="fin-total"><td>TOTAL SEMUA TA</td><td class="num">'+rupiah(grandTA)+'</td><td class="num">'+rupiah(grandObl)+'</td><td class="num"><span class="fin-chip">'+pctTA+'%</span></td></tr></tbody></table></div>'+
   '<div class="fin-footnote">Kewajiban = total tagihan SPP (s/d bulan berjalan) + daftar ulang. Tercapai = sudah masuk ÷ kewajiban. TA aktif (2026/2027) akan terus naik seiring pembayaran masuk.</div></div>'+
   '</div>';
}
function injectFinance(){
  if(!(state.session&&state.session.role==="admin"))return;
  if(!document.querySelector(".insight-banner"))return;
  var grids=document.querySelectorAll(".admin-content .grid-eq");
  if(!grids.length)return;
  var old=document.getElementById("finCard");
  if(old){old.outerHTML='<div id="finCard">'+buildHTML()+'</div>';return;}
  var wrap=document.createElement("div");wrap.id="finCard";wrap.innerHTML=buildHTML();
  grids[0].parentNode.insertBefore(wrap,grids[0].nextSibling);
}
/* ---- Label TA pada tagihan nonbulanan ---- */
function nameItemsWithTA(){
  if(window._taNamed)return;window._taNamed=1;var ch=0;
  state.items.forEach(function(it){if(it.nama&&String(it.nama).indexOf(" TP ")===-1){it.nama=it.nama+" TP "+it.ta;ch=1;}});
  if(ch){saveState();}
}
/* ---- Form tambah tagihan nonbulanan ---- */
var KATS=["Pengembangan","Seragam","Pendaftaran","Kesehatan","FC Ujian","Extrakurikuler","Buku","Akhirussanah","Kegiatan Niha'i","Lainnya"];
function injectAddItem(){
  if(!(state.session&&state.session.role==="admin"))return;
  if(!document.getElementById("tarifSantriSel"))return;
  if(document.getElementById("addItemCard"))return;
  var host=document.querySelector(".admin-content .grid-2");if(!host)return;
  var card=document.createElement("div");card.className="card";card.id="addItemCard";
  card.innerHTML='<h3>➕ Tambah Tagihan Nonbulanan</h3><div class="fin-subtitle">Untuk menambahkan tagihan yang belum tercatat (mis. Ekstrakurikuler TA lama). Isi angka persis seperti di Braja.</div>'+
  '<label>Kategori</label><select id="aiKat">'+KATS.map(function(k){return '<option>'+k+'</option>';}).join("")+'</select>'+
  '<label>Tahun Ajaran</label><input id="aiTa" value="2025/2026"/>'+
  '<label>Tarif</label><input id="aiTarif" type="number" value="0"/>'+
  '<label>Sudah terbayar</label><input id="aiBayar" type="number" value="0"/>'+
  '<button class="btn btn-primary btn-block mt" id="aiSave">➕ Tambah Tagihan</button>';
  host.appendChild(card);
  document.getElementById("aiSave").onclick=function(){
    var sid=state.tarifSantri;if(!sid){showToast("Pilih santri dulu","error");return;}
    var kat=document.getElementById("aiKat").value;
    var ta=String(document.getElementById("aiTa").value).trim();
    var t=Number(document.getElementById("aiTarif").value)||0;
    var b=Number(document.getElementById("aiBayar").value)||0;
    if(!/^\d{4}\/\d{4}$/.test(ta)){showToast("Format TA salah (contoh 2025/2026)","error");return;}
    if(t<=0){showToast("Tarif harus lebih dari 0","error");return;}
    if(b>t)b=t;
    var ex=state.items.find(function(x){return x.santriId===sid&&x.ta===ta&&x.kategori===kat;});
    if(ex){showToast("Tagihan "+kat+" "+ta+" sudah ada untuk santri ini","error");return;}
    state.items.push({id:uid(),santriId:sid,ta:ta,nama:kat+" TP "+ta,kategori:kat,tarif:t,terbayar:b});
    saveState();render();showToast("Tagihan "+kat+" TP "+ta+" ditambahkan ✅");
  };
}
/* ---- BARU v4: dropdown pembayaran menampilkan SEMUA TA ---- */
window.buildTargets=function(sid){
  var tSel=document.getElementById("bayarTarget");var nIn=document.getElementById("bayarNominal");if(!tSel||!nIn)return;
  if(!sid){tSel.innerHTML='<option value="">Pilih santri dulu</option>';nIn.value="";return;}
  var tas=taListOf(sid).slice().reverse();
  var latest=latestTA(sid);var opts=[];
  tas.forEach(function(ta){
    var sp=getSpp(sid,ta);
    if(sp)MONTHS.forEach(function(m){var c=sp.months[m];if(c&&c.t>c.b){
      var v=(ta===latest)?("SPP:"+m):("SPPX:"+m+"|"+ta);
      opts.push({v:v,label:"SPP "+MONTH_ID[m]+" "+ta+" — sisa "+rupiah(c.t-c.b),sisa:c.t-c.b});
    }});
    state.items.forEach(function(i){if(i.santriId===sid&&i.ta===ta&&i.tarif>i.terbayar){
      opts.push({v:"ITEM:"+i.id,label:i.nama+" — sisa "+rupiah(i.tarif-i.terbayar),sisa:i.tarif-i.terbayar});
    }});
  });
  if(!opts.length){tSel.innerHTML='<option value="">Semua kewajiban lunas</option>';nIn.value="";return;}
  tSel.innerHTML=opts.map(function(o){return '<option value="'+o.v+'" data-sisa="'+o.sisa+'">'+esc(o.label)+'</option>';}).join("");
  nIn.value=opts[0].sisa;
};
/* ---- BARU v4: proses pembayaran SPP TA lama (selain TA terbaru) ---- */
document.addEventListener("submit",function(e){
  var f=e.target;if(!f||!f.dataset||f.dataset.form!=="add-bayar")return;
  var tSel=document.getElementById("bayarTarget");var tv=tSel?tSel.value:"";
  if(tv.indexOf("SPPX:")!==0)return;
  e.preventDefault();e.stopImmediatePropagation();
  var sid=document.getElementById("bayarSantri").value;
  var parts=tv.slice(5).split("|");var m=parts[0];var ta=parts[1];
  var nominal=Number(document.getElementById("bayarNominal").value);
  var metode=document.getElementById("bayarMetode").value;
  var tanggal=document.getElementById("bayarTanggal").value;
  var sp=getSpp(sid,ta);var c=sp&&sp.months[m];
  if(!c){showToast("Bulan tidak ditemukan","error");return;}
  var sisa=c.t-c.b;
  if(!nominal||nominal<=0){showToast("Nominal tidak valid","error");return;}
  if(nominal>sisa){showToast("Maksimal sisa "+rupiah(sisa),"error");return;}
  c.b+=nominal;
  var nama="SPP "+MONTH_ID[m]+" "+ta;
  state.pembayaran.push({id:uid(),santriId:sid,ta:ta,tipe:"SPP",bulan:m,nama:nama,nominal:nominal,metode:metode,tanggal:tanggal,no:noTrx()});
  addLog("Pembayaran "+nama+" "+rupiah(nominal));
  saveState();render();showToast("Pembayaran tercatat ✅");
},true);
/* ---- MESIN ---- */
function postFin(){
  injectFinance();nameItemsWithTA();injectAddItem();
  if(document.getElementById("bayarSantri")&&!window._pbOnce){window._pbOnce=1;setTimeout(function(){try{populateBayar();}catch(e){}},60);}
}
if(typeof window.render==="function"&&!window.render.__fin){var orig=window.render;window.render=function(){var r=orig.apply(null,arguments);try{postFin();}catch(e){}return r;};window.render.__fin=true;}
setTimeout(postFin,350);
/* ---- v5: daftar tunggakan & pesan WA mencakup semua TA ---- */
window.tunggakanList=function(){return state.santri.map(function(s){var ta=latestTA(s.id);var list=[];taListOf(s.id).slice().reverse().forEach(function(t){list=list.concat(sisaList(s.id,t));});return{s:s,ta:ta,sum:allSum(s.id),list:list};}).filter(function(v){return v.sum.sisa>0;}).sort(function(a,b){return b.sum.sisa-a.sum.sisa;});};
window.waMessage=function(v){var lines=[];taListOf(v.s.id).slice().reverse().forEach(function(ta){sisaList(v.s.id,ta).forEach(function(x){lines.push("• "+x.label+": "+rupiah(x.sisa));});});if(!lines.length)lines.push("• (tidak ada tunggakan)");return "Assalamu'alaikum warahmatullahi wabarakatuh\nYth. Bapak/Ibu "+v.s.waliNama+", wali dari ananda *"+v.s.nama+"* (Kelas "+v.s.kelas+").\n\nBerikut keterangan administrasi (seluruh tahun ajaran) yang belum tertunaikan:\n"+lines.join("\n")+"\n\n*Total sisa: "+rupiah(v.sum.sisa)+"*\n\nKami ingatkan bahwa batas maksimal pembayaran SPP adalah *tanggal 10 setiap bulan*. Apabila Bapak/Ibu belum mampu membayar tepat waktu, mohon berkenan *konfirmasi/izin kepada Mudir* pondok terlebih dahulu.\n\nTerima kasih atas perhatian dan kerja samanya. Jazakumullah khairan katsiran.\n— Administrasi DQH AL-HUDA Sukoharjo";};
})();
