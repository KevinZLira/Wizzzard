/* Private IPC with a standalone helper. No native keyboard code runs in CEP. */
(function () {
  "use strict";
  var fs=require("fs"), path=require("path"), spawn=require("child_process").spawn;
  var cep=window.__adobe_cep__, child=null, stopping=false, restarts=0, restartTimer, startupTimer;
  var folder=path.join(process.env.APPDATA || process.env.HOME || __dirname,"KVN Console");
  var settingsPath=path.join(folder,"hotkey.json"), logPath=path.join(folder,"shortcut.log");
  var legacySettingsPath=path.join(process.env.APPDATA || process.env.HOME || __dirname,"Wizzzard","hotkey.json");
  var statusPath=path.join(folder,"shortcut-status.json"),controlPath=path.join(folder,"capture-control.json");
  var revision="",lastSettings="",suspended=false,pollTimer=null,heartbeatTimer=null;
  var bindings=[{id:"palette",label:"Ctrl+Alt+K",key:75,scanCode:0,modifiers:3},{id:"shortcuts",label:"Sem atalho",key:0,scanCode:0,modifiers:0}];
  var status={type:"starting",message:"Iniciando atalhos…",bindings:bindings,shortcut:bindings[0].label};
  function log(message) {
    try { if (!fs.existsSync(folder)) fs.mkdirSync(folder); if (fs.existsSync(logPath) && fs.statSync(logPath).size>262144) fs.writeFileSync(logPath,"");
      fs.appendFileSync(logPath,new Date().toISOString()+" "+message+"\n","utf8"); } catch (_) { }
  }
  function publish(next) {
    status=next; if (!status.bindings) status.bindings=bindings;
    status.shortcut=status.bindings[0].label;
    status.revision=revision; status.updatedAt=Date.now();
    log(JSON.stringify(status));
    persistStatus();
    var label=document.getElementById("hotkey-status"); if (label) label.textContent=status.message;
  }
  function persistStatus() {
    try { if (!fs.existsSync(folder)) fs.mkdirSync(folder); status.updatedAt=Date.now(); fs.writeFileSync(statusPath,JSON.stringify(status),"utf8"); }
    catch (error) { log("status file: "+error.message); }
  }
  function valid(list) {
    if (!Array.isArray(list) || list.length!==2 || !list[0] || !list[1] || list[0].id!=="palette" || list[1].id!=="shortcuts") return false;
    if (!list.every(function (b) { return typeof b.label==="string" && b.label.length<=80 && Number.isInteger(b.key) && b.key>=0 && b.key<=254 && b.key!==123 && [16,17,18,91,92].indexOf(b.key)<0 && Number.isInteger(b.scanCode) && b.scanCode>=0 && b.scanCode<=127 && Number.isInteger(b.modifiers) && b.modifiers>=0 && b.modifiers<=7; })) return false;
    return !list[0].key || !list[1].key || list[0].key!==list[1].key || list[0].scanCode!==list[1].scanCode || list[0].modifiers!==list[1].modifiers;
  }
  function clean(list) { return list.map(function (b) { return {id:b.id,label:b.label,key:b.key,scanCode:b.scanCode,modifiers:b.modifiers}; }); }
  function write(command) { if (child && child.stdin && child.stdin.writable) child.stdin.write(JSON.stringify(command)+"\n"); }
  function configure(event) {
    try {
      var command=typeof event.data==="string" ? JSON.parse(event.data) : event.data;
      if (!command || !valid(command.bindings)) throw new Error("Escolha teclas diferentes e validas para as acoes");
      var next=clean(command.bindings);
      if (!fs.existsSync(folder)) fs.mkdirSync(folder);
      bindings=next; revision=typeof command.revision==="string" ? command.revision : "";
      write({type:"configure",bindings:bindings});
      publish({type:"starting",message:"Aplicando atalhos…",bindings:bindings});
    } catch (error) { publish({type:"invalid",message:error.message,bindings:bindings}); write({type:"resume"}); }
  }
  function pollFiles() {
    try {
      var raw=fs.readFileSync(settingsPath,"utf8");
      if (raw!==lastSettings) {
        var saved=JSON.parse(raw);
        // A partially written request is retried next tick, never accepted as defaults.
        if (!valid(saved.bindings)) throw new Error("Configuracao de tecla invalida");
        lastSettings=raw; log("configuration read: "+raw); configure({data:saved});
      }
    } catch (error) { if (error.code!=="ENOENT" && error.name!=="SyntaxError") log("configuration: "+error.message); }
    try {
      var control=JSON.parse(fs.readFileSync(controlPath,"utf8"));
      var next=Number(control.expiresAt)>Date.now();
      if (next!==suspended) { suspended=next; write({type:next ? "suspend" : "resume"}); }
    } catch (_) { }
  }
  function start() {
    if (stopping) return;
    try {
      var root=decodeURI(cep.getSystemPath("extension")).replace(/^file:\/\/\//,"");
      var executable=path.join(root,"helper","KVNConsoleHotkey.exe"); log("spawn: "+executable+" CEP pid "+process.pid);
      if (!fs.existsSync(executable)) throw new Error("Auxiliar ausente. Reinstale o KVN Console.");
      var current=spawn(executable,["--cep-pid",String(process.pid)],{windowsHide:true,stdio:["pipe","pipe","pipe"]}); child=current;
      var buffer="",ready=false,finished=false;
      startupTimer=setTimeout(function () { publish({type:"error",message:"Auxiliar nao respondeu"}); current.kill(); },8000);
      current.stdin.on("error",function (error) { log("pipe: "+error.message); });
      current.stdout.on("data",function (chunk) {
        buffer+=chunk.toString("utf8"); if (buffer.length>16384) { current.kill(); return; }
        var newline;
        while ((newline=buffer.indexOf("\n"))>=0) {
          var line=buffer.slice(0,newline); buffer=buffer.slice(newline+1);
          try {
            var message=JSON.parse(line);
            if (message.type==="ready") { ready=true; clearTimeout(startupTimer); write({type:"configure",bindings:bindings}); }
            else if (message.type==="open" && ready) {
              var id=message.action==="shortcuts" ? "com.kvn.command.shortcuts" : "com.kvn.command.main";
              log("open request: "+id); cep.requestOpenExtension(id,"");
            } else if (["active","waiting","conflict","invalid","capturing"].indexOf(message.type)>=0) publish(message);
          } catch (error) { log("message: "+error.message); }
        }
      });
      current.stderr.on("data",function (chunk) { log("helper: "+chunk.toString()); });
      function ended(error) {
        if (finished) return; finished=true; clearTimeout(startupTimer); if (child===current) child=null;
        if (stopping) return;
        publish({type:"error",message:error ? error.message : "Auxiliar encerrado"});
        if (restarts<3) { restarts++; restartTimer=setTimeout(start,restarts*1500); }
      }
      current.on("error",ended); current.on("exit",function () { ended(); });
    } catch (error) { publish({type:"error",message:error.message}); }
  }
  function stop() {
    stopping=true; clearTimeout(restartTimer); clearTimeout(startupTimer);
    clearInterval(pollTimer); clearInterval(heartbeatTimer);
    if (child) { var current=child; write({type:"stop"}); current.stdin.end(); current.kill(); child=null; }
  }
  window.addEventListener("unload",stop); cep.addEventListener("applicationBeforeQuit",stop,null);
  if (process.platform!=="win32") { publish({type:"manual",message:"Use o Atalho de Aplicativo do macOS"}); return; }
  // Carry forward the user's working shortcut when the product data folder changes.
  try { if (!fs.existsSync(settingsPath) && fs.existsSync(legacySettingsPath)) {
    var previous=fs.readFileSync(legacySettingsPath,"utf8");
    if (valid(JSON.parse(previous).bindings)) { if (!fs.existsSync(folder)) fs.mkdirSync(folder); fs.writeFileSync(settingsPath,previous,"utf8"); }
  } } catch (error) { log("shortcut migration: "+error.message); }
  try { lastSettings=fs.readFileSync(settingsPath,"utf8"); var saved=JSON.parse(lastSettings);
    if (valid(saved.bindings)) { bindings=clean(saved.bindings); revision=saved.revision || ""; } else lastSettings="";
  } catch (_) { lastSettings=""; }
  publish({type:"starting",message:"Iniciando atalhos…",bindings:bindings}); start();
  pollTimer=setInterval(pollFiles,250); heartbeatTimer=setInterval(persistStatus,2000);
})();
