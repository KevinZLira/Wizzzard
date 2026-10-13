(function () {
  "use strict";
  var bridge=window.KVN.Hotkey,capturing=null,captureTimer=null,buttons={},inputs={},stateLabels={};
  var cep=window.__adobe_cep__,diagnostics=[];
  var statusEl=document.getElementById("status");
  function log(message) {
    diagnostics.push(new Date().toISOString()+" "+message); if (diagnostics.length>100) diagnostics.shift();
    try {
      if (cep && window.cep && window.cep.fs) {
        var root=decodeURI(cep.getSystemPath("userData")).replace(/^file:\/\/\//,"");
        window.cep.fs.writeFile(root+"/KVN Console/capture.log",diagnostics.join("\n"));
      }
    } catch (_) { }
  }
  window.addEventListener("error",function (event) { log("error: "+event.message); statusEl.textContent="Erro ao capturar: "+event.message; });
  function keyInterest(enabled) {
    if (!cep || typeof cep.registerKeyEventsInterest!=="function") return;
    try {
      var interests=[];
      if (enabled) for (var key=8;key<=254;key++) for (var mods=0;mods<8;mods++) {
        interests.push({keyCode:key,ctrlKey:!!(mods&2),altKey:!!(mods&1),shiftKey:!!(mods&4)});
      }
      cep.registerKeyEventsInterest(enabled ? JSON.stringify(interests) : "");
      log(enabled ? "key interest registered" : "key interest released");
    } catch (error) { log("key interest: "+error.message); }
  }
  var names={palette:["KVN Console","Abrir a busca de efeitos e transições"],shortcuts:["KVN Console - Atalhos","Abrir este hub de atalhos"]};
  var scanCodes={Backquote:0x29,Minus:0x0c,Equal:0x0d,BracketLeft:0x1a,BracketRight:0x1b,Backslash:0x2b,Semicolon:0x27,Quote:0x28,Comma:0x33,Period:0x34,Slash:0x35,IntlBackslash:0x56};
  function cloneBindings() { return bridge.getStatus().bindings.map(function (b) { return {id:b.id,label:b.label,key:b.key,scanCode:b.scanCode,modifiers:b.modifiers}; }); }
  function endCapture() {
    capturing=null; clearTimeout(captureTimer); keyInterest(false);
    Object.keys(inputs).forEach(function (id) { inputs[id].style.display="none"; buttons[id].style.display=""; });
    bridge.resume(); renderStatus(bridge.getStatus());
  }
  function beginCapture(id) {
    if (capturing) endCapture(); capturing=id; bridge.suspend(); keyInterest(true); log("capture begin: "+id);
    Object.keys(buttons).forEach(function (key) { buttons[key].className="key"; });
    buttons[id].textContent="Pressione uma tecla…"; buttons[id].className="key recording";
    statusEl.textContent="Pressione a tecla desejada. Esc cancela.";
    buttons[id].style.display="none"; inputs[id].style.display=""; inputs[id].value=""; inputs[id].focus();
    captureTimer=setTimeout(endCapture,25000);
  }
  function renderStatus(status) {
    status.bindings.forEach(function (b) {
      if (capturing!==b.id) { buttons[b.id].textContent=b.key ? b.label : "Escolher tecla"; buttons[b.id].className="key"; }
      stateLabels[b.id].textContent=b.state==="conflict" ? "Tecla em uso: escolha outra" : b.state==="active" ? "Ativo" : "";
    });
    if (!capturing) statusEl.textContent=status.message;
    statusEl.className="status"+(["error","invalid","conflict"].indexOf(status.type)>=0 ? " error" : "");
  }
  Object.keys(names).forEach(function (id) {
    var row=document.createElement("div"); row.className="row";
    var name=document.createElement("div"); name.className="name";
    var title=document.createElement("strong"); title.textContent=names[id][0]; name.appendChild(title);
    var description=document.createElement("small"); description.textContent=names[id][1]; name.appendChild(description);
    var badge=document.createElement("span"); badge.className="badge"; stateLabels[id]=badge; name.appendChild(badge);
    var button=document.createElement("button"); button.className="key"; button.onclick=function () { beginCapture(id); }; buttons[id]=button;
    var input=document.createElement("input"); input.type="text"; input.className="key capture-input";
    input.placeholder="Pressione uma tecla…"; input.setAttribute("aria-label","Nova tecla para "+names[id][0]);
    input.setAttribute("autocomplete","off"); input.style.display="none"; inputs[id]=input;
    var remove=document.createElement("button"); remove.className="remove"; remove.textContent="×"; remove.title="Remover atalho";
    remove.onclick=function () { endCapture(); var bindings=cloneBindings(); var b=bindings.filter(function (b) { return b.id===id; })[0]; b.key=0; b.scanCode=0; b.modifiers=0; b.label="Sem atalho"; bridge.configure(bindings); };
    row.appendChild(name); row.appendChild(button); row.appendChild(input); row.appendChild(remove); document.getElementById("bindings").appendChild(row);
  });
  document.addEventListener("keydown",function (event) {
    if (!capturing) return;
    log("keydown: key="+event.key+" code="+event.code+" virtualKey="+(event.keyCode || event.which));
    event.preventDefault(); event.stopPropagation();
    if (event.key==="Escape") { endCapture(); return; }
    if (["Control","Alt","Shift","Meta","AltGraph"].indexOf(event.key)>=0 || event.repeat) return;
    if (event.metaKey || event.keyCode===123 || !event.keyCode || event.keyCode>254) { statusEl.textContent="Escolha outra tecla (sem a tecla Windows ou F12)."; return; }
    var eventKey=event.key || String.fromCharCode(event.keyCode || event.which);
    var modifiers=(event.ctrlKey ? 2 : 0)|(event.altKey ? 1 : 0)|(event.shiftKey ? 4 : 0);
    var label=(event.ctrlKey ? "Ctrl+" : "")+(event.altKey ? "Alt+" : "")+(event.shiftKey ? "Shift+" : "")+
      (eventKey===" " ? "Espaço" : eventKey==="Dead" ? (event.code==="Quote" ? "'" : event.code) : eventKey);
    var bindings=cloneBindings(),selected=bindings.filter(function (b) { return b.id===capturing; })[0];
    selected.key=event.keyCode; selected.scanCode=scanCodes[event.code] || 0; selected.modifiers=modifiers; selected.label=label;
    log("save request: "+JSON.stringify(selected));
    endCapture(); bridge.configure(bindings);
  },true);
  document.getElementById("open").onclick=function () { endCapture(); if (window.__adobe_cep__) window.__adobe_cep__.requestOpenExtension("com.kvn.command.main",""); };
  document.getElementById("done").onclick=function () { endCapture(); if (window.__adobe_cep__) window.__adobe_cep__.closeExtension(); };
  window.addEventListener("unload",function () { keyInterest(false); bridge.resume(); });
  bridge.subscribe(function (status) { log("status: "+status.type); renderStatus(status); }); renderStatus(bridge.getStatus());
  log("hub loaded");
})();
