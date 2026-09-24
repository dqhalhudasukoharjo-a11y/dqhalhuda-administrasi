/* ==== SYNC DQH AL-HUDA (Supabase) ==== */
(function(){
  var CONFIG = {
    SUPABASE_URL: "https://mmntvfmwiganpovdupxv.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tbnR2Zm13aWdhbnBvdmR1cHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMTA2MzYsImV4cCI6MjEwNTc4NjYzNn0.rhju1BowQBtzLV3y_GLSrC71oQq81Rx7MurXvdnG-5c",
    VERSION_KEY: "dqh_sync_version",
    SECRET_KEY: "dqh_sync_secret",
    PUSH_DEBOUNCE: 1500,
    PULL_EVERY: 60000
  };
  function configured(){ return CONFIG.SUPABASE_URL.indexOf("GANTI-")===-1 && CONFIG.SUPABASE_ANON_KEY.indexOf("GANTI-")===-1; }
  function hdr(){ return { "apikey": CONFIG.SUPABASE_ANON_KEY, "Content-Type": "application/json" }; }
  function localState(){ try{ return JSON.parse(localStorage.getItem(window.STORAGE_KEY)||"null"); }catch(e){ return null; } }
  function getPayload(){ var s=JSON.parse(JSON.stringify(window.state||{})); delete s.session; return s; }
  function serverVersion(){ return Number(localStorage.getItem(CONFIG.VERSION_KEY)||0); }
  function applyServer(payload, version){
    var base=(window.seed?window.seed():{});
    var keep=(window.state?window.state.session:null);
    window.state=Object.assign(base,payload);
    window.state.session=keep||null;
    localStorage.setItem(window.STORAGE_KEY, JSON.stringify(window.state));
    localStorage.setItem(CONFIG.VERSION_KEY, String(version));
  }
  function pull(opts){
    opts=opts||{};
    return fetch(CONFIG.SUPABASE_URL+"/rest/v1/rpc/get_state",{method:"POST",headers:hdr(),body:"{}"})
      .then(function(r){ if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); })
      .then(function(res){
        var version=Number(res.version||0);
        var payload=res.payload||{};
        if(!(payload&&payload.santri&&payload.santri.length)) return false;
        var local=localState();
        var localEmpty=!(local&&local.santri&&local.santri.length);
        if(opts.force||localEmpty||version>serverVersion()){ applyServer(payload,version); return true; }
        return false;
      });
  }
  var pushTimer=null;
  function doPush(){
    var secret=localStorage.getItem(CONFIG.SECRET_KEY);
    if(!secret){
      secret=window.prompt("Masukkan Kode Sinkronisasi Admin (sekali saja):","");
      if(!secret) return Promise.resolve(false);
      localStorage.setItem(CONFIG.SECRET_KEY, secret);
    }
    return fetch(CONFIG.SUPABASE_URL+"/rest/v1/rpc/save_state",{method:"POST",headers:hdr(),
        body:JSON.stringify({p_secret:secret,p_payload:getPayload()})})
      .then(function(r){ if(!r.ok){ return r.json().then(function(j){ throw new Error(j.message||("HTTP "+r.status)); }); } return r.json(); })
      .then(function(v){
        localStorage.setItem(CONFIG.VERSION_KEY,String(v));
        if(window.showToast) window.showToast("Tersinkron ke server ✅");
        return true;
      })
      .catch(function(e){
        if(String(e.message||"").indexOf("sinkronisasi")>=0){ localStorage.removeItem(CONFIG.SECRET_KEY); }
        if(window.showToast) window.showToast("Gagal sinkron: "+e.message,"error");
        return false;
      });
  }
  function queuePush(){
    if(!window.state||!window.state.session||window.state.session.role!=="admin") return;
    clearTimeout(pushTimer);
    pushTimer=setTimeout(doPush, CONFIG.PUSH_DEBOUNCE);
  }
  function start(){
    if(typeof window.saveState==="function" && !window.saveState.__syncHooked){
      var orig=window.saveState;
      window.saveState=function(){ var r=orig.apply(null,arguments); queuePush(); return r; };
      window.saveState.__syncHooked=true;
    }
    setInterval(function(){
      if(document.hidden) return;
      if(window.state&&window.state.session&&window.state.session.role==="admin") return;
      pull({}).then(function(changed){
        if(changed&&window.render){ window.render(); if(window.showToast) window.showToast("Data diperbarui 🔄"); }
      }).catch(function(){});
    }, CONFIG.PULL_EVERY);
  }
  function init(){
    if(!configured()){ start(); return; }
    pull({}).then(function(changed){
      if(changed&&window.render) window.render();
      start();
    }).catch(function(){ start(); });
  }
  if(document.readyState==="loading"){ document.addEventListener("DOMContentLoaded",function(){ setTimeout(init,0); }); }
  else{ setTimeout(init,0); }
  window.SYNC={pull:pull,push:doPush,config:CONFIG};
})();
