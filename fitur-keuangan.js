/* ==== FITUR KEUANGAN v1 DQH AL-HUDA ==== */
(function(){
"use strict";
var st=document.createElement("style");
st.textContent=".fin-grid{display:grid;gap:16px;grid-template-columns:1fr;margin-bottom:16px}@media(min-width:1000px){.fin-grid{grid-template-columns:1.2fr .8fr}}.fin-table{width:100%;border-collapse:collapse;min-width:0}.fin-table th,.fin-table td{padding:9px 8px;border-bottom:1px solid var(--line);font-size:12.5px;text-align:left;vertical-align:middle}.fin-table th{color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.4px}.fin-table td.num,.fin-table th.num{text-align:right;font-variant-numeric:tabular-nums;font-weight:700}.fin-table tr.fin-total td{border-top:2px solid var(--teal-dark);border-bottom:none;font-weight:800;background:var(--teal-soft)}html[data-theme=\"gelap\"] .fin-table tr.fin-total td{background:#0f2f2e}.fin-bar{height:6px;border-radius:99px;background:var(--line);overflow:hidden;min-width:60px}.fin-bar i{display:block;height:100%;background:var(--grad-orange);border-radius:99px}.fin-chip{display:inline-block;padding:3px 8px;border-radius:999px;font-size:10.5px;font-weight:800;background:var(--teal-soft);color:var(--teal-dark)}html[data-theme=\"gelap\"] .fin-chip{background:#0f2f2e;color:#9fd8d0}.fin-scroll{max-height:340px;overflow-y:auto}";
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
  return '<div class="fin-grid">'+
   '<div class="card"><h3>📅 Pemasukan per Bulan</h3><div class="fin-scroll"><table class="fin-table"><thead><tr><th>Bulan</th><th class="num">Total Masuk</th><th class="num">Transaksi</th><th>Proporsi</th></tr></thead><tbody>'+rowsM+'<tr class="fin-total"><td>TOTAL SEMUA BULAN</td><td class="num">'+rupiah(grand)+'</td><td class="num">'+state.pembayaran.length+' trx</td><td></td></tr></tbody></table></div></div>'+
   '<div class="card"><h3>🎓 Pemasukan per Tahun Ajaran</h3><div class="fin-scroll"><table class="fin-table"><thead><tr><th>Tahun Ajaran</th><th class="num">Masuk</th><th class="num">Kewajiban</th><th class="num">Tercapai</th></tr></thead><tbody>'+rowsTA+'<tr class="fin-total"><td>TOTAL SEMUA TA</td><td class="num">'+rupiah(grandTA)+'</td><td class="num">'+rupiah(grandObl)+'</td><td></td></tr></tbody></table></div><div class="trend-note" style="margin-top:8px">Kewajiban = total tagihan santri pada TA itu (SPP s/d bulan berjalan + nonbulanan). Tercapai = masuk ÷ kewajiban.</div></div>'+
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
if(typeof window.render==="function"&&!window.render.__fin){var orig=window.render;window.render=function(){var r=orig.apply(null,arguments);try{injectFinance();}catch(e){}return r;};window.render.__fin=true;}
setTimeout(injectFinance,350);
})();