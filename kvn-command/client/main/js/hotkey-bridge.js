window.KVN=window.KVN || {};
window.KVN.Hotkey=(function () {
  var cep=window.__adobe_cep__,windows=/Win/.test(navigator.platform),listeners=[],timer=null,pending=null;
  var fileApi=window.cep && window.cep.fs,folder="",lastRaw="";
  var status={type:"starting",message:"Conectando aos atalhos…",shortcut:windows ? "Ctrl+Alt+K" : "Ctrl+Cmd+K",
    bindings:[{id:"palette",label:"Ctrl+Alt+K",key:75,scanCode:0,modifiers:3},{id:"shortcuts",label:"Sem atalho",key:0,scanCode:0,modifiers:0}]};
  function notify() { listeners.forEach(function (listener) { listener(status); }); }
  function fail(message) { status.type="error"; status.message=message; notify(); }
  function write(name,data) {
    if (!fileApi || !folder) throw new Error("Acesso ao arquivo de atalhos indisponivel");
    var result=fileApi.writeFile(folder+"/"+name,JSON.stringify(data));
    if (result.err) throw new Error("Nao foi possivel salvar os atalhos (erro "+result.err+")");
  }
  function poll() {
    if (pending && Date.now()-pending.started>10000) { pending=null; fail("Sem confirmacao do auxiliar. A tecla ainda nao foi aplicada."); }
    if (!fileApi || !folder) return;
    try {
      var result=fileApi.readFile(folder+"/shortcut-status.json");
      if (result.err || result.data===lastRaw) return;
      var next=JSON.parse(result.data);
      if (!Array.isArray(next.bindings) || next.bindings.length!==2 || Date.now()-next.updatedAt>6000) return;
      if (pending && (next.revision!==pending.revision || next.type==="starting")) return;
      pending=null; lastRaw=result.data; status=next; notify();
    } catch (_) { }
  }
  function configure(bindings) {
    if (!Array.isArray(bindings) || bindings.length!==2) { fail("Configuracao invalida"); return; }
    if (bindings[0].key && bindings[1].key && bindings[0].key===bindings[1].key && bindings[0].scanCode===bindings[1].scanCode && bindings[0].modifiers===bindings[1].modifiers) {
      fail("Escolha uma tecla diferente para cada acao"); return;
    }
    try {
      var revision=Date.now().toString(36)+"-"+Math.random().toString(36).slice(2);
      write("hotkey.json",{version:2,revision:revision,bindings:bindings});
      pending={revision:revision,started:Date.now()};
      status={type:"saving",message:"Salvando e aplicando a nova tecla…",bindings:bindings,shortcut:bindings[0].label}; notify();
    } catch (error) { fail(error.message); }
  }
  function capture(active) {
    try { write("capture-control.json",{expiresAt:active ? Date.now()+30000 : 0}); }
    catch (error) { fail(error.message); }
  }
  if (cep && windows) {
    try {
      folder=decodeURI(cep.getSystemPath("userData")).replace(/^file:\/\/\//,"")+"/KVN Console";
      if (fileApi) fileApi.makedir(folder);
      cep.requestOpenExtension("com.kvn.command.bg",""); poll(); timer=setInterval(poll,350);
    } catch (error) { fail(error.message); }
    window.addEventListener("unload",function () { clearInterval(timer); });
  } else { status.type=cep ? "manual" : "preview"; status.message=cep ? "Use o Atalho de Aplicativo do macOS" : "Atalhos disponiveis no Premiere"; }
  return {windows:windows,getStatus:function () { return status; },subscribe:function (listener) { listeners.push(listener); },
    openHub:function () { if (cep) cep.requestOpenExtension("com.kvn.command.shortcuts",""); },
    configure:configure,suspend:function () { capture(true); },resume:function () { capture(false); }};
})();
