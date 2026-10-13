"use strict";
const assert=require("node:assert/strict"), fs=require("node:fs"), vm=require("node:vm"), path=require("node:path");
function hub() {
  const elements={},handlers={},commands=[],timers=new Map(); let timer=0;
  function element() { return {children:[],style:{},textContent:"",className:"",setAttribute(){},appendChild(child){this.children.push(child);},focus(){this.focused=true;}}; }
  ["status","bindings","open","done"].forEach(id=>elements[id]=element());
  let status={message:"Pronto",type:"waiting",bindings:[{id:"palette",label:"Ctrl+Alt+K",key:75,scanCode:0,modifiers:3},{id:"shortcuts",label:"Sem atalho",key:0,scanCode:0,modifiers:0}]};
  const bridge={getStatus:()=>status,suspend:()=>commands.push({type:"suspend"}),resume:()=>commands.push({type:"resume"}),
    configure(bindings){commands.push({type:"configure",bindings});status={...status,bindings};},subscribe(callback){this.listener=callback;}};
  const interests=[];
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,"../kvn-command/client/shortcuts/app.js"),"utf8"),{
    window:{KVN:{Hotkey:bridge},__adobe_cep__:{registerKeyEventsInterest:value=>interests.push(value)},addEventListener(){}},document:{getElementById:id=>elements[id],createElement:element,addEventListener:(type,fn)=>handlers[type]=fn},
    setTimeout:(fn)=>{timers.set(++timer,fn);return timer;},clearTimeout:id=>timers.delete(id)
  });
  function key(overrides){const event={key:"'",code:"Quote",keyCode:222,ctrlKey:false,altKey:false,shiftKey:false,metaKey:false,repeat:false,preventDefault(){},stopPropagation(){},...overrides};handlers.keydown(event);}
  return {elements,commands,key,timers,interests};
}
const h=hub();
h.elements.bindings.children[0].children[1].onclick();
assert.equal(h.commands.at(-1).type,"suspend");
assert.ok(h.elements.bindings.children[0].children[2].focused,"CEP capture must focus a text input, not a button");
assert.equal(h.elements.bindings.children[0].children[1].style.display,"none");
assert.ok(JSON.parse(h.interests.at(-1)).some(key=>key.keyCode===222 && !key.ctrlKey && !key.altKey && !key.shiftKey));
h.key();
assert.equal(h.commands.at(-1).type,"configure");
assert.equal(h.commands.at(-1).bindings[0].label,"'");
assert.equal(h.commands.at(-1).bindings[0].modifiers,0);
assert.equal(h.commands.at(-1).bindings[0].scanCode,0x28);
assert.equal(h.timers.size,0);
assert.equal(h.interests.at(-1),"","release key interests after saving");
const br=hub();br.elements.bindings.children[0].children[1].onclick();
br.key({key:"'",code:"Backquote",keyCode:192});
assert.equal(br.commands.at(-1).bindings[0].scanCode,0x29,"physical ABNT quote key mapped separately from US Quote");
const cancel=hub();cancel.elements.bindings.children[0].children[1].onclick();cancel.key({key:"Escape",keyCode:27});
assert.equal(cancel.commands.at(-1).type,"resume");assert.ok(!cancel.commands.some(command=>command.type==="configure"));
const held=hub();held.elements.bindings.children[0].children[1].onclick();held.key({key:"Control",keyCode:17});
assert.ok(!held.commands.some(command=>command.type==="configure"));
held.key({key:"j",code:"KeyJ",keyCode:74,ctrlKey:true,shiftKey:true});assert.equal(held.commands.at(-1).bindings[0].modifiers,6);
console.log("PASS: click KVN Console, capture single quote, ABNT physical key, cancel and modifier combinations");
