"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const {EventEmitter}=require("node:events"),{spawn}=require("node:child_process");
const backgroundSource=fs.readFileSync(path.join(__dirname,"../kvn-command/client/bg/app.js"),"utf8");
const bridgeSource=fs.readFileSync(path.join(__dirname,"../kvn-command/client/main/js/hotkey-bridge.js"),"utf8");
function environment(options={}) {
  const files=new Map(),intervals=new Map(),timeouts=new Map(),children=[],opened=[],unload={}; let next=0;
  const normalize=p=>p.replace(/\\/g,"/").toLowerCase();
  const read=p=>{if(!files.has(normalize(p))) {const e=Error("Missing");e.code="ENOENT";throw e;}return files.get(normalize(p));};
  const write=(p,text)=>files.set(normalize(p),text);
  if(options.saved)write("C:/User/AppData/KVN Console/hotkey.json",options.saved);
  if(options.legacy)write("C:/User/AppData/Wizzzard/hotkey.json",options.legacy);
  const fakeFs={existsSync:p=>!options.missing && (/\.exe$/i.test(p)||files.has(normalize(p))),mkdirSync(){},readFileSync:read,writeFileSync:write,
    statSync:p=>({size:read(p).length}),appendFileSync:(p,text)=>write(p,(files.get(normalize(p))||"")+text)};
  const clock={setInterval(fn,delay){intervals.set(++next,{fn,delay});return next;},clearInterval:id=>intervals.delete(id),setTimeout(fn,delay){timeouts.set(++next,{fn,delay});return next;},clearTimeout:id=>timeouts.delete(id)};
  function childProcess(){const child=new EventEmitter(); child.stdin=new EventEmitter();child.writes=[];child.stdin.writable=true;
    child.stdin.write=line=>child.writes.push(JSON.parse(line));child.stdin.end=()=>child.ended=true;child.stdout=new EventEmitter();child.stderr=new EventEmitter();child.kill=()=>{child.killed=true;child.emit("exit",1);};children.push(child);return child;}
  const cep={getSystemPath:type=>type==="extension" ? "file:///C:/Plugin" : "file:///C:/User/AppData",addEventListener(){},requestOpenExtension:id=>opened.push(id)};
  vm.runInNewContext(backgroundSource,{require:name=>name==="fs"?fakeFs:name==="path"?path.win32:{spawn:childProcess},process:{platform:options.platform||"win32",pid:123,env:{APPDATA:"C:/User/AppData"}},
    __dirname:"C:/Plugin",window:{__adobe_cep__:cep,addEventListener:(type,fn)=>unload[type]=fn},document:{getElementById:()=>null},console,...clock});
  const uiFiles={makedir(){return{err:0};},readFile:p=>{try{return{err:0,data:read(p)};}catch{return{err:3};}},
    writeFile:(p,text)=>{if(options.writeFailure)return{err:3};write(p,text);return{err:0};}};
  const uiWindow={__adobe_cep__:cep,cep:{fs:uiFiles},addEventListener(){}};
  if(options.platform!=="darwin") vm.runInNewContext(bridgeSource,{window:uiWindow,navigator:{platform:"Win32"},console,...clock});
  return {files,intervals,timeouts,children,opened,unload,bridge:uiWindow.KVN&&uiWindow.KVN.Hotkey,read,write,
    send:message=>children.at(-1).stdout.emit("data",Buffer.from(JSON.stringify(message)+"\n")),tick:delay=>[...intervals.values()].filter(t=>t.delay===delay).forEach(t=>t.fn())};
}
const bindings=[{id:"palette",label:"'",key:192,scanCode:41,modifiers:0},{id:"shortcuts",label:"Sem atalho",key:0,scanCode:0,modifiers:0}];
const b=environment();b.send({type:"open"});assert.equal(b.opened.filter(id=>id==="com.kvn.command.main").length,0);
b.send({type:"ready"});assert.equal(b.children[0].writes.at(-1).bindings[0].key,75);
b.bridge.suspend();b.tick(250);assert.equal(b.children[0].writes.at(-1).type,"suspend");
b.bridge.resume();b.tick(250);assert.equal(b.children[0].writes.at(-1).type,"resume");
b.bridge.configure(bindings);assert.equal(b.bridge.getStatus().type,"saving");
const request=JSON.parse(b.read("C:/User/AppData/KVN Console/hotkey.json"));assert.equal(request.bindings[0].key,192);
b.tick(350);assert.equal(b.bridge.getStatus().bindings[0].label,"'","old default status must not replace pending selection");
b.tick(250);assert.equal(b.children[0].writes.at(-1).type,"configure");assert.equal(b.children[0].writes.at(-1).bindings[0].scanCode,41);
b.send({type:"active",message:"Ativo",bindings:bindings.map(item=>({...item,registered:!!item.key,state:item.key?"active":"disabled"}))});
b.tick(350);assert.equal(b.bridge.getStatus().type,"active");assert.equal(b.bridge.getStatus().bindings[0].modifiers,0);
assert.equal(b.bridge.getStatus().revision,request.revision,"helper acknowledgement must match the request");
const saved=b.read("C:/User/AppData/KVN Console/hotkey.json");
const restarted=environment({saved});restarted.send({type:"ready"});assert.equal(restarted.children[0].writes.at(-1).bindings[0].label,"'","saved key must survive restart");restarted.unload.unload();
const migrated=environment({legacy:saved});migrated.send({type:"ready"});assert.equal(migrated.children[0].writes.at(-1).bindings[0].label,"'","rename must preserve the user's working shortcut");assert.equal(migrated.read("C:/User/AppData/KVN Console/hotkey.json"),saved);migrated.unload.unload();
b.bridge.configure([bindings[0],{...bindings[0],id:"shortcuts"}]);assert.equal(b.bridge.getStatus().type,"error");assert.equal(b.read("C:/User/AppData/KVN Console/hotkey.json"),saved);
b.send({type:"open",action:"palette"});assert.equal(b.opened.at(-1),"com.kvn.command.main");
b.send({type:"open",action:"shortcuts"});assert.equal(b.opened.at(-1),"com.kvn.command.shortcuts");
b.unload.unload();assert.ok(b.children[0].killed && b.children[0].ended);assert.ok(![...b.intervals.values()].some(t=>t.delay===250||t.delay===2000));
const failed=environment({writeFailure:true});failed.bridge.configure(bindings);assert.equal(failed.bridge.getStatus().type,"error");assert.match(failed.bridge.getStatus().message,/salvar/);failed.unload.unload();
const missing=environment({missing:true});assert.equal(missing.children.length,0);missing.unload.unload();
const mac=environment({platform:"darwin"});assert.equal(mac.children.length,0);
const crashes=environment();for(let i=0;i<4;i++){crashes.children.at(-1).emit("error",Error("crash"));crashes.children.at(-1).emit("exit",1);const retry=[...crashes.timeouts.values()].find(t=>t.delay<8000);crashes.timeouts.clear();if(retry)retry.fn();}
assert.equal(crashes.children.length,4);crashes.unload.unload();

async function helperLifecycle(){
  const helper=spawn(path.join(__dirname,"../kvn-command/helper/KVNConsoleHotkey.exe"),[],{windowsHide:true,stdio:["pipe","pipe","pipe"]});let output="",errors="";
  helper.stdout.on("data",chunk=>{output+=chunk;if(output.includes('"ready"')&&!helper.sent){helper.sent=true;helper.stdin.write('{"type":"configure","bindings":[]}\n');}if(output.includes('"invalid"'))helper.stdin.end();});helper.stderr.on("data",chunk=>errors+=chunk);
  const timeout=setTimeout(()=>helper.kill(),5000);const code=await new Promise((resolve,reject)=>{helper.on("exit",resolve);helper.on("error",reject);});clearTimeout(timeout);assert.equal(code,0,errors||output);assert.match(output,/"invalid"/);
  const orphan=spawn(path.join(__dirname,"../kvn-command/helper/KVNConsoleHotkey.exe"),[],{windowsHide:true,stdio:["pipe","pipe","pipe"]});const lease=setTimeout(()=>orphan.kill(),5000);orphan.stdout.once("data",()=>orphan.stdin.end());
  const orphanCode=await new Promise((resolve,reject)=>{orphan.on("exit",resolve);orphan.on("error",reject);});clearTimeout(lease);assert.equal(orphanCode,0);
}
helperLifecycle().then(()=>console.log("PASS: shared-file remap, persistence, matching acknowledgement, stale defaults, duplicates, errors, helper IPC and EOF"),error=>{console.error(error);process.exitCode=1;});
