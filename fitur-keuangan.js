/* ==== FITUR KEUANGAN v7 DQH AL-HUDA ==== */
(function(){
"use strict";
var st=document.createElement("style");
st.textContent=".fin-grid{display:grid;gap:16px;grid-template-columns:1fr;margin-bottom:16px;align-items:stretch}@media(min-width:1000px){.fin-grid{grid-template-columns:1.2fr .8fr}}.fin-card{display:flex;flex-direction:column;height:100%}.fin-card .fin-scroll{flex:1;min-height:300px}.fin-subtitle{font-size:11.5px;color:var(--muted);margin-top:-6px;margin-bottom:10px;line-height:1.5}.fin-table{width:100%;border-collapse:collapse;min-width:0}.fin-table th,.fin-table td{padding:9px 8px;border-bottom:1px solid var(--line);font-size:12.5px;text-align:left;vertical-align:middle}.fin-table th{color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.4px}.fin-table td.num,.fin-table th.num{text-align:right;font-variant-numeric:tabular-nums;font-weight:700}.fin-table tr.fin-total td{border-top:2px solid var(--teal-dark);border-bottom:none;font-weight:800;background:var(--teal-soft)}html[data-theme=\"gelap\"] .fin-table tr.fin-total td{background:#0f2f2e}.fin-bar{height:6px;border-radius:99px;background:var(--line);overflow:hidden;min-width:60px}.fin-bar i{display:block;height:100%;background:var(--grad-orange);border-radius:99px}.fin-chip{display:inline-block;padding:3px 8px;border-radius:999px;font-size:10.5px;font-weight:800;background:var(--teal-soft);color:var(--teal-dark)}html[data-theme=\"gelap\"] .fin-chip{background:#0f2f2e;color:#9fd8d0}.fin-scroll{max-height:420px;overflow-y:auto;border-radius:8px}.fin-footnote{font-size:11px;color:var(--muted);margin-top:10px;line-height:1.55;border-top:1px dashed var(--line);padding-top:8px}html[data-theme=\"gelap\"] .fin-footnote{border-color:#1c3a39}.bk-row{display:flex;gap:8px;align-items:center;padding:7px 0;border-bottom:1px dashed var(--line)}.bk-row input[type=checkbox]{width:auto;min-width:18px}.bk-row .bk-l{flex:1;font-size:12.5px;font-weight:700}.bk-row .bk-s{font-size:11px;color:var(--muted);font-weight:600}.bk-row input[data-bkn]{width:120px;padding:8px;text-align:right}";
document.head.appendChild(st);
/* ---------- FORMAT CURRENCY ---------- */
function rawNum(v){return String(v==null?"":v).replace(/[^\d]/g,"");}
function fmtCur(v){var n=rawNum(v);if(n==="")return "";return Number(n).toLocaleString("id-ID");}
function curify(inp){if(!inp)return;inp.setAttribute("type","text");inp.setAttribute("inputmode","numeric");if(!inp.dataset.cur){inp.dataset.cur="1";inp.addEventListener("input",function(){inp.value=fmtCur(inp.value);});}if(document.activeElement!==inp)inp.value=fmtCur(inp.value);}
function curifyPage(){
  document.querySelectorAll(".admin-content input[type=number]").forEach(curify);
  document.querySelectorAll(".admin-content input[data-cur]").forEach(function(i){if(document.activeElement!==i)i.value=fmtCur(i.value);});
  var bt=document.getElementById("bayarTarget");
  if(bt&&!bt.__cur){bt.__cur=1;bt.addEventListener("change",function(){var nn=document.getElementById("bayarNominal");if(nn)setTimeout(function(){curify(nn);},0);});}
}
document.addEventListener("submit",function(e){var f=e.target;if(!f||!f.querySelectorAll)return;f.querySelectorAll("input[data-cur]").forEach(function(i){i.value=rawNum(i.value);});},true);
/* ---------- DASHBOARD KEUANGAN ---------- */
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
function nameItemsWithTA(){
  if(window._taNamed)return;window._taNamed=1;var ch=0;
  state.items.forEach(function(it){if(it.nama&&String(it.nama).indexOf(" TP ")===-1){it.nama=it.nama+" TP "+it.ta;ch=1;}});
  if(ch){saveState();}
}
/* ---------- TAMBAH TAGIHAN NONBULANAN ---------- */
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
    var t=Number(rawNum(document.getElementById("aiTarif").value))||0;
    var b=Number(rawNum(document.getElementById("aiBayar").value))||0;
    if(!/^\d{4}\/\d{4}$/.test(ta)){showToast("Format TA salah (contoh 2025/2026)","error");return;}
    if(t<=0){showToast("Tarif harus lebih dari 0","error");return;}
    if(b>t)b=t;
    var ex=state.items.find(function(x){return x.santriId===sid&&x.ta===ta&&x.kategori===kat;});
    if(ex){showToast("Tagihan "+kat+" "+ta+" sudah ada untuk santri ini","error");return;}
    state.items.push({id:uid(),santriId:sid,ta:ta,nama:kat+" TP "+ta,kategori:kat,tarif:t,terbayar:b});
    saveState();render();showToast("Tagihan "+kat+" TP "+ta+" ditambahkan ✅");
  };
}
/* ---------- BARU v7: BUAT CATATAN SPP 12 BULAN ---------- */
function injectCreateSpp(){
  if(!(state.session&&state.session.role==="admin"))return;
  if(!document.getElementById("tarifSantriSel"))return;
  var host=document.querySelector(".admin-content .grid-2");if(!host)return;
  var old=document.getElementById("createSppCard");if(old)old.remove();
  var sid=state.tarifSantri;if(!sid)return;
  if(getSpp(sid,latestTA(sid)))return;
  var card=document.createElement("div");card.className="card";card.id="createSppCard";
  card.innerHTML='<h3>📅 Buat Catatan SPP 12 Bulan</h3><div class="fin-subtitle">Santri ini belum punya catatan SPP untuk TA berjalan. Buat dulu supaya bulan JUL–JUN tertagih dan bisa dibayar.</div>'+
  '<label>Tahun Ajaran</label><input id="csTa" value="'+latestTA(sid)+'"/>'+
  '<label>Tarif SPP per bulan</label><input id="csTarif" type="number" value="0"/>'+
  '<button class="btn btn-primary btn-block mt" id="csSave">📅 Buat & Tagihkan 12 Bulan</button>';
  host.insertBefore(card,host.firstChild);
  document.getElementById("csSave").onclick=function(){
    var ta=String(document.getElementById("csTa").value).trim();
    var t=Number(rawNum(document.getElementById("csTarif").value))||0;
    if(!/^\d{4}\/\d{4}$/.test(ta)){showToast("Format TA salah (contoh 2026/2027)","error");return;}
    if(t<=0){showToast("Tarif harus lebih dari 0","error");return;}
    if(getSpp(sid,ta)){showToast("Catatan SPP TA "+ta+" sudah ada","error");return;}
    var months={};MONTHS.forEach(function(m){months[m]={t:t,b:0};});
    state.spp.push({id:uid(),santriId:sid,ta:ta,tarif:t,months:months});
    saveState();render();showToast("Catatan SPP 12 bulan dibuat ✅ Santri siap dibayarkan");
  };
}
/* ---------- DROPDOWN PEMBAYARAN LINTAS TA ---------- */
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
document.addEventListener("submit",function(e){
  var f=e.target;if(!f||!f.dataset||f.dataset.form!=="add-bayar")return;
  var tSel=document.getElementById("bayarTarget");var tv=tSel?tSel.value:"";
  if(tv.indexOf("SPPX:")!==0)return;
  e.preventDefault();e.stopImmediatePropagation();
  var sid=document.getElementById("bayarSantri").value;
  var parts=tv.slice(5).split("|");var m=parts[0];var ta=parts[1];
  var nominal=Number(rawNum(document.getElementById("bayarNominal").value));
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
/* ---------- TUNGGAKAN & WA LINTAS TA ---------- */
window.tunggakanList=function(){return state.santri.map(function(s){var ta=latestTA(s.id);var list=[];taListOf(s.id).slice().reverse().forEach(function(t){list=list.concat(sisaList(s.id,t));});return{s:s,ta:ta,sum:allSum(s.id),list:list};}).filter(function(v){return v.sum.sisa>0;}).sort(function(a,b){return b.sum.sisa-a.sum.sisa;});};
window.waMessage=function(v){var lines=[];taListOf(v.s.id).slice().reverse().forEach(function(ta){sisaList(v.s.id,ta).forEach(function(x){lines.push("• "+x.label+": "+rupiah(x.sisa));});});if(!lines.length)lines.push("• (tidak ada tunggakan)");return "Assalamu'alaikum warahmatullahi wabarakatuh\nYth. Bapak/Ibu "+v.s.waliNama+", wali dari ananda *"+v.s.nama+"* (Kelas "+v.s.kelas+").\n\nBerikut keterangan administrasi (seluruh tahun ajaran) yang belum tertunaikan:\n"+lines.join("\n")+"\n\n*Total sisa: "+rupiah(v.sum.sisa)+"*\n\nKami ingatkan bahwa batas maksimal pembayaran SPP adalah *tanggal 10 setiap bulan*. Apabila Bapak/Ibu belum mampu membayar tepat waktu, mohon berkenan *konfirmasi/izin kepada Mudir* pondok terlebih dahulu.\n\nTerima kasih atas perhatian dan kerja samanya. Jazakumullah khairan katsiran.\n— Administrasi DQH AL-HUDA Sukoharjo";};
/* ---------- PEMBAYARAN GABUNGAN ---------- */
function injectBulkBtns(){
  if(!(state.session&&state.session.role==="admin"))return;
  if(!document.getElementById("tableBayar"))return;
  var ph=document.querySelector(".admin-content .page-head");if(!ph)return;
  var qa=ph.querySelector(".qa-row")||ph;
  if(!qa.querySelector("[data-ft='bulk']")){var b=document.createElement("button");b.className="btn btn-primary btn-sm";b.setAttribute("data-ft","bulk");b.textContent="💳 Pembayaran Gabungan";qa.appendChild(b);}
  if(window._lastBulkPays&&!qa.querySelector("[data-ft='kwbulk']")){var b2=document.createElement("button");b2.className="btn btn-light btn-sm";b2.setAttribute("data-ft","kwbulk");b2.textContent="🧾 Kwitansi Gabungan Terakhir";qa.appendChild(b2);}
}
document.addEventListener("click",function(e){
  if(e.target.closest("[data-ft='bulk']")){openBulkModal();return;}
  var k=e.target.closest("[data-ft='kwbulk']");
  if(k&&window._lastBulkPays)openKwitansiGabungan(window._lastBulkPays);
});
function openBulkModal(){
  closeBulk();
  var mask=document.createElement("div");mask.className="kw-mask";mask.id="bulkMask";
  var box=document.createElement("div");box.className="kw-box";box.style.maxWidth="520px";
  box.innerHTML='<h3 style="margin-bottom:4px">💳 Pembayaran Gabungan</h3><div class="fin-subtitle">Pilih santri, centang tagihan yang dibayar sekaligus, sesuaikan nominal bila perlu. Satu kwitansi bertotal akan terbit dan cukup dikirim sekali ke wali.</div>'+
  '<label>Santri</label><select id="bkSantri"><option value="">Pilih santri</option>'+state.santri.map(function(s){return '<option value="'+s.id+'">'+esc(s.nama)+' — '+esc(s.kelas)+' — NIS '+esc(s.nik)+'</option>';}).join("")+'</select>'+
  '<div id="bkList" class="fin-scroll" style="max-height:260px;margin-top:10px"></div>'+
  '<div style="display:flex;gap:8px;margin-top:10px"><div style="flex:1"><label>Metode</label><select id="bkMetode"><option>TUNAI</option><option>TRANSFER</option><option>QRIS</option></select></div><div style="flex:1"><label>Tanggal</label><input id="bkTanggal" type="date" value="'+today()+'"/></div></div>'+
  '<div class="fin-footnote" id="bkTotal" style="font-weight:800;color:var(--text)">Total dipilih: Rp 0</div>'+
  '<div class="kw-actions"><button class="btn btn-primary btn-sm" id="bkSave">💾 Simpan & Terbitkan Kwitansi</button><button class="btn btn-danger btn-sm" id="bkCancel">Batal</button></div>';
  mask.appendChild(box);document.body.appendChild(mask);
  mask.addEventListener("click",function(ev){if(ev.target===mask)closeBulk();});
  document.getElementById("bkCancel").onclick=closeBulk;
  document.getElementById("bkSantri").onchange=function(){buildBulkList(this.value);};
  box.addEventListener("input",updateBulkTotal);
  box.addEventListener("change",updateBulkTotal);
  document.getElementById("bkSave").onclick=saveBulk;
}
function closeBulk(){var m=document.getElementById("bulkMask");if(m)m.remove();}
function bulkRows(sid){
  var out=[];if(!sid)return out;
  taListOf(sid).slice().reverse().forEach(function(ta){
    var sp=getSpp(sid,ta);
    if(sp)MONTHS.forEach(function(m){var c=sp.months[m];if(c&&c.t>c.b)out.push({kind:"SPP",ref:m,ta:ta,label:"SPP "+MONTH_ID[m]+" "+ta,sisa:c.t-c.b});});
    state.items.forEach(function(i){if(i.santriId===sid&&i.ta===ta&&i.tarif>i.terbayar)out.push({kind:"ITEM",ref:i.id,ta:ta,label:i.nama,sisa:i.tarif-i.terbayar});});
  });
  return out;
}
function buildBulkList(sid){
  var host=document.getElementById("bkList");if(!host)return;
  var rows=bulkRows(sid);window._bulkRows=rows;
  if(!rows.length){host.innerHTML='<div class="empty" style="padding:14px">Tidak ada tagihan belum lunas untuk santri ini.</div>';updateBulkTotal();return;}
  host.innerHTML=rows.map(function(r,i){return '<div class="bk-row"><input type="checkbox" data-bk="'+i+'" checked/><div class="bk-l">'+esc(r.label)+'<div class="bk-s">Sisa '+rupiah(r.sisa)+'</div></div><input type="text" inputmode="numeric" data-bkn="'+i+'" value="'+fmtCur(r.sisa)+'"/></div>';}).join("");
  host.querySelectorAll("input[data-bkn]").forEach(function(inp){inp.addEventListener("input",function(){inp.value=fmtCur(inp.value);updateBulkTotal();});});
  updateBulkTotal();
}
function updateBulkTotal(){
  var host=document.getElementById("bkList");if(!host)return;var t=0;
  host.querySelectorAll("input[type=checkbox]").forEach(function(cb){
    if(!cb.checked)return;
    var i=+cb.dataset.bk;var r=(window._bulkRows||[])[i];if(!r)return;
    var inp=host.querySelector('input[data-bkn="'+i+'"]');var v=Number(rawNum(inp&&inp.value))||0;
    if(v>r.sisa)v=r.sisa;if(v<0)v=0;t+=v;
  });
  var el=document.getElementById("bkTotal");if(el)el.textContent="Total dipilih: "+rupiah(t);
}
function saveBulk(){
  var sid=document.getElementById("bkSantri").value;
  if(!sid){showToast("Pilih santri dulu","error");return;}
  var host=document.getElementById("bkList");
  var pays=[];var err="";
  host.querySelectorAll("input[type=checkbox]").forEach(function(cb){
    if(!cb.checked||err)return;
    var i=+cb.dataset.bk;var r=(window._bulkRows||[])[i];if(!r){err="Baris tidak valid";return;}
    var inp=host.querySelector('input[data-bkn="'+i+'"]');var v=Number(rawNum(inp&&inp.value))||0;
    if(v<=0){err=r.label+": nominal harus lebih dari 0";return;}
    if(v>r.sisa){err=r.label+": melebihi sisa "+rupiah(r.sisa);return;}
    var metode=document.getElementById("bkMetode").value;var tanggal=document.getElementById("bkTanggal").value;
    if(r.kind==="SPP"){
      var sp=getSpp(sid,r.ta);var c=sp&&sp.months[r.ref];
      if(!c){err=r.label+": bulan tidak ditemukan";return;}
      c.b+=v;
      pays.push({id:uid(),santriId:sid,ta:r.ta,tipe:"SPP",bulan:r.ref,nama:"SPP "+MONTH_ID[r.ref]+" "+r.ta,nominal:v,metode:metode,tanggal:tanggal,no:noTrx()});
    }else{
      var it=state.items.find(function(x){return x.id===r.ref;});
      if(!it){err=r.label+": item tidak ditemukan";return;}
      it.terbayar+=v;
      pays.push({id:uid(),santriId:sid,ta:r.ta,tipe:"ITEM",refId:it.id,nama:it.nama,nominal:v,metode:metode,tanggal:tanggal,no:noTrx()});
    }
  });
  if(err){showToast(err,"error");return;}
  if(!pays.length){showToast("Centang minimal satu tagihan","error");return;}
  var total=pays.reduce(function(a,p){return a+p.nominal;},0);
  pays.forEach(function(p){state.pembayaran.push(p);});
  addLog("Pembayaran gabungan "+pays.length+" tagihan "+rupiah(total));
  closeBulk();
  window._bulkPays=pays;window._lastBulkPays=pays;
  saveState();render();showToast(pays.length+" pembayaran tercatat ✅ Kwitansi gabungan terbit");
}
/* ---------- KWITANSI GABUNGAN ---------- */
function terbilang(n){var a=["","satu","dua","tiga","empat","lima","enam","tujuh","delapan","sembilan","sepuluh","sebelas"];function t(x){if(x<12)return a[x];if(x<20)return t(x-10)+" belas";if(x<100)return t(Math.floor(x/10))+" puluh "+t(x%10);if(x<200)return t(Math.floor(x/100))+" ratus "+t(x%100);if(x<1000)return t(Math.floor(x/100))+" ratus "+t(x%100);if(x<2000)return "seribu "+t(x-1000);if(x<1e6)return t(Math.floor(x/1000))+" ribu "+t(x%1000);if(x<1e9)return t(Math.floor(x/1e6))+" juta "+t(x%1e6);return "";}return (t(Math.floor(n))+" rupiah").replace(/\s+/g," ").trim();}
function rr(c,X,Y,W,H,R){c.beginPath();c.moveTo(X+R,Y);c.arcTo(X+W,Y,X+W,Y+H,R);c.arcTo(X+W,Y+H,X,Y+H,R);c.arcTo(X,Y+H,X,Y,R);c.arcTo(X,Y,X+W,Y,R);c.closePath();}
function openKwitansiGabungan(pays){
  var s=state.santri.find(function(x){return x.id===pays[0].santriId;})||{nama:"-",waliNama:"-",nik:"-",kelas:"-"};
  var total=pays.reduce(function(a,p){return a+p.nominal;},0);
  var sisa=allSum(s.id).sisa;
  var _lg=null,_td=null,_dn=0;function _ck(){if(_dn>1)draw(_lg,_td);}
  var img=new Image();img.onload=function(){_lg=img;_dn++;_ck();};img.onerror=function(){_dn++;_ck();};img.src="logo.png";
  var img2=new Image();img2.onload=function(){_td=img2;_dn++;_ck();};img2.onerror=function(){_dn++;_ck();};img2.src="ttd.png";
  function draw(logo,ttd){
    var W=900,H=1000+pays.length*44,cv=document.createElement("canvas");cv.width=W;cv.height=H;var c=cv.getContext("2d");
    c.fillStyle="#F4F9FA";c.fillRect(0,0,W,H);
    rr(c,24,24,W-48,H-48,28);c.fillStyle="#FFFFFF";c.fill();c.lineWidth=2;c.strokeStyle="#DCEBED";c.stroke();
    c.save();rr(c,24,24,W-48,H-48,28);c.clip();var g0=c.createLinearGradient(24,0,W-24,0);g0.addColorStop(0,"#073B44");g0.addColorStop(1,"#0B7285");c.fillStyle=g0;c.fillRect(24,24,W-48,14);c.restore();
    if(logo){c.save();rr(c,64,76,104,104,22);c.clip();c.drawImage(logo,64,76,104,104);c.restore();c.lineWidth=2;c.strokeStyle="#E3EEF0";rr(c,64,76,104,104,22);c.stroke();}
    c.textAlign="left";c.fillStyle="#073B44";c.font="800 27px 'Segoe UI',Arial";c.fillText("PONDOK PESANTREN DARUL QURAN",200,112);c.fillText("WAL HADITS AL-HUDA SUKOHARJO",200,144);
    c.fillStyle="#6B8A90";c.font="400 14px 'Segoe UI',Arial";c.fillText("Karanganyar Rt.02/Rw.06, Weru, Sukoharjo — Jawa Tengah 57562",200,170);c.fillText("WA 088215602211 • Portal Administrasi Santri",200,190);
    c.strokeStyle="#073B44";c.lineWidth=2.5;c.beginPath();c.moveTo(64,224);c.lineTo(W-64,224);c.stroke();
    c.textAlign="center";c.fillStyle="#0B7285";c.font="800 26px 'Segoe UI',Arial";c.fillText("K W I T A N S I   P E M B A Y A R A N",W/2,278);
    var meta="No. "+pays[0].no+(pays.length>1?" s/d "+pays[pays.length-1].no:"")+"   •   "+pays[0].tanggal;
    c.font="600 14px 'Segoe UI',Arial";var mw=c.measureText(meta).width+36;rr(c,W/2-mw/2,296,mw,34,17);c.fillStyle="#E6F7F9";c.fill();c.fillStyle="#0B7285";c.fillText(meta,W/2,318);
    c.textAlign="left";c.fillStyle="#12333A";c.font="600 16px 'Segoe UI',Arial";c.fillText("Diterima dari : "+(s.waliNama||"-"),64,368);
    c.fillText("Nama santri    : "+s.nama+"  (NIS "+s.nik+")  —  Kelas "+s.kelas,64,396);
    c.fillStyle="#7A9BA0";c.font="600 12px 'Segoe UI',Arial";c.fillText("RINCIAN PEMBAYARAN",64,436);
    var y=464;
    pays.forEach(function(p){
      c.fillStyle="#12333A";c.font="600 16px 'Segoe UI',Arial";c.textAlign="left";c.fillText(p.nama,64,y);
      c.textAlign="right";c.fillText("Rp "+Number(p.nominal).toLocaleString("id-ID"),W-64,y);
      c.strokeStyle="#EDF4F5";c.lineWidth=1;c.beginPath();c.moveTo(64,y+12);c.lineTo(W-64,y+12);c.stroke();
      y+=44;
    });
    var py=y+6;var g1=c.createLinearGradient(64,py,W-64,py);g1.addColorStop(0,"#0B7285");g1.addColorStop(1,"#12B0BE");rr(c,64,py,W-128,120,20);c.fillStyle=g1;c.fill();
    c.textAlign="left";c.fillStyle="rgba(255,255,255,.85)";c.font="600 12px 'Segoe UI',Arial";c.fillText("TOTAL DIBAYAR ("+pays.length+" TAGIHAN)",96,py+40);
    c.fillStyle="#FFFFFF";c.font="800 40px 'Segoe UI',Arial";c.fillText("Rp "+Number(total).toLocaleString("id-ID"),96,py+90);
    c.textAlign="left";c.fillStyle="#5E7680";c.font="italic 400 14px 'Segoe UI',Arial";c.fillText("Terbilang: "+terbilang(total),64,py+152);
    var sy=py+176;rr(c,64,sy,W-128,52,14);c.fillStyle="#FFF6E6";c.fill();c.lineWidth=1.5;c.strokeStyle="#FDBA74";c.stroke();c.fillStyle="#B54708";c.font="600 15px 'Segoe UI',Arial";c.fillText("Sisa seluruh kewajiban setelah pembayaran:  Rp "+Number(sisa).toLocaleString("id-ID"),92,sy+32);
    var fy=H-232;c.textAlign="right";c.fillStyle="#12333A";c.font="600 15px 'Segoe UI',Arial";c.fillText("Sukoharjo, "+pays[0].tanggal,W-72,fy);c.fillText("TU (Tata Usaha),",W-72,fy+26);if(ttd){try{c.drawImage(ttd,W-242,fy+34,170,85);}catch(e){}}c.strokeStyle="#9BB5BA";c.lineWidth=1;c.beginPath();c.moveTo(W-260,fy+124);c.lineTo(W-72,fy+124);c.stroke();c.fillStyle="#12333A";c.font="700 14px 'Segoe UI',Arial";c.fillText("( Dinastiar )",W-72,fy+146);
    c.textAlign="center";c.fillStyle="#9BB5BA";c.font="400 12px 'Segoe UI',Arial";c.fillText("Kwitansi gabungan otomatis Portal Administrasi DQH AL-HUDA — sah tanpa stempel & tanda tangan basah.",W/2,H-56);
    showKwGabungan(cv,pays,s,total);
  }
}
function showKwGabungan(canvas,pays,s,total){
  closeKw();
  var mask=document.createElement("div");mask.className="kw-mask";mask.id="kwMask";
  var box=document.createElement("div");box.className="kw-box";
  var im=document.createElement("img");im.src=canvas.toDataURL("image/png");
  var act=document.createElement("div");act.className="kw-actions";
  var b1=document.createElement("button");b1.className="btn btn-primary btn-sm";b1.textContent="⬇ Unduh PNG";
  b1.onclick=function(){var a=document.createElement("a");a.download="kwitansi-gabungan-"+pays[0].no+".png";a.href=im.src;a.click();};
  var b2=document.createElement("button");b2.className="btn btn-light btn-sm";b2.textContent="🖨 Cetak";
  b2.onclick=function(){var w=window.open("");w.document.write('<img src="'+im.src+'" style="width:100%"/>');w.document.close();w.focus();w.print();};
  var b3=document.createElement("button");b3.className="btn btn-orange btn-sm";b3.textContent="📲 WA Wali (sekali kirim)";
  b3.onclick=function(){var num=waNum(s.waliHp);if(!num){showToast("Nomor WA wali kosong","error");return;}
    var lines=pays.map(function(p){return "• "+p.nama+": Rp "+Number(p.nominal).toLocaleString("id-ID");}).join("\n");
    var txt="Assalamu'alaikum "+s.waliNama+", berikut kwitansi pembayaran ananda "+s.nama+" pada "+pays[0].tanggal+":\n"+lines+"\n*Total: Rp "+Number(total).toLocaleString("id-ID")+"*\nTerima kasih. (Gambar kwitansi dilampirkan menyusul.)";
    window.open("https://wa.me/"+num+"?text="+encodeURIComponent(txt));};
  var b4=document.createElement("button");b4.className="btn btn-danger btn-sm";b4.textContent="Tutup";b4.onclick=closeKw;
  act.appendChild(b1);act.appendChild(b2);act.appendChild(b3);act.appendChild(b4);
  box.appendChild(im);box.appendChild(act);mask.appendChild(box);document.body.appendChild(mask);
}
function closeKw(){var m=document.getElementById("kwMask");if(m)m.remove();}
/* ---------- BARU v8: BATALKAN TRANSAKSI ---------- */
function injectCancelBtns(){
  if(!(state.session&&state.session.role==="admin"))return;
  var tb=document.getElementById("tableBayar");if(!tb)return;
  var thead=tb.querySelector("thead tr");
  if(thead&&thead.children.length===6&&!thead.querySelector("th[data-act-col]")){var th=document.createElement("th");th.setAttribute("data-act-col","1");th.textContent="Aksi";thead.appendChild(th);}
  tb.querySelectorAll("tbody tr").forEach(function(tr){
    if(tr.querySelector("[data-ft='cancel']"))return;
    var no=tr.children[1]?String(tr.children[1].textContent).trim():"";
    if(!no)return;
    var td=document.createElement("td");
    var b=document.createElement("button");b.type="button";b.className="btn btn-danger btn-sm";b.setAttribute("data-ft","cancel");b.setAttribute("data-no",no);b.textContent="🗑";b.title="Batalkan transaksi "+no;
    td.appendChild(b);tr.appendChild(td);
  });
  document.querySelectorAll(".admin-content .mcard").forEach(function(mc){
    if(mc.querySelector("[data-ft='cancel']"))return;
    var m=String(mc.textContent).match(/SIS\d{10,}/);if(!m)return;
    var b=document.createElement("button");b.type="button";b.className="btn btn-danger btn-sm mt";b.setAttribute("data-ft","cancel");b.setAttribute("data-no",m[0]);b.textContent="🗑 Batalkan";
    mc.appendChild(b);
  });
  var sc=document.getElementById("cariBayar");
  if(sc&&!sc.__cx){sc.__cx=1;sc.addEventListener("input",function(){setTimeout(injectCancelBtns,0);});}
}
function cancelTrx(no){
  var p=state.pembayaran.find(function(x){return x.no===no;});
  if(!p){showToast("Transaksi tidak ditemukan","error");return;}
  var s=state.santri.find(function(x){return x.id===p.santriId;})||{};
  if(!window.confirm("Batalkan transaksi "+p.no+"?\n"+(s.nama||"-")+" — "+p.nama+"\nNominal "+rupiah(p.nominal)+" • "+p.tanggal+"\n\nSisa tagihan akan dikembalikan dan perubahan tersinkron ke semua perangkat."))return;
  if(p.tipe==="SPP"){var sp=getSpp(p.santriId,p.ta);var c=sp&&sp.months[p.bulan];if(c)c.b=Math.max(0,c.b-p.nominal);}
  else if(p.tipe==="ITEM"){var it=state.items.find(function(x){return x.id===p.refId;});if(it)it.terbayar=Math.max(0,it.terbayar-p.nominal);}
  state.pembayaran=state.pembayaran.filter(function(x){return x.id!==p.id;});
  addLog("Pembayaran DIBATALKAN "+p.no+" "+rupiah(p.nominal)+" ("+(s.nama||"-")+")");
  saveState();render();showToast("Transaksi "+p.no+" dibatalkan & sisa dikembalikan ✅");
}
document.addEventListener("click",function(e){var t=e.target.closest("[data-ft='cancel']");if(t)cancelTrx(t.getAttribute("data-no"));});
/* ---------- MESIN ---------- */
function postFin(){
  injectFinance();nameItemsWithTA();injectAddItem();injectCreateSpp();injectBulkBtns();curifyPage();injectCancelBtns();
  if(window._bulkPays){var ps=window._bulkPays;window._bulkPays=null;openKwitansiGabungan(ps);}
  if(document.getElementById("bayarSantri")&&!window._pbOnce){window._pbOnce=1;setTimeout(function(){try{populateBayar();curifyPage();}catch(e){}},60);}
}
if(typeof window.render==="function"&&!window.render.__fin){var orig=window.render;window.render=function(){var r=orig.apply(null,arguments);try{postFin();}catch(e){}return r;};window.render.__fin=true;}
setTimeout(postFin,350);
})();
