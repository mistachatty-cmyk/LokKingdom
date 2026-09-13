// Zero-dependency runtime smoke test for the single-file browser game.
// It supplies the minimum DOM/canvas surface needed to execute one frame.
const fs = require("node:fs");
const vm = require("node:vm");

const html = fs.readFileSync("index.html", "utf8");
const source = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
if (!source) throw new Error("index.html does not contain the game script");

function classList() {
  const values = new Set();
  return { add:v=>values.add(v), remove:v=>values.delete(v), toggle:(v,on)=>on ? values.add(v) : values.delete(v), contains:v=>values.has(v) };
}
const canvasContext = {
  fillStyle:"", fillRect(){}, save(){}, restore(){}, translate(){}, rotate(){},
  beginPath(){}, moveTo(){}, lineTo(){}, closePath(){}, fill(){},
};
const elements = new Map();
function element(id) {
  if (!elements.has(id)) {
    const listeners = {};
    elements.set(id, {
      id, textContent:"", innerHTML:"", hidden:id === "map-panel", style:{},
      classList:classList(),
      addEventListener(type, fn){ (listeners[type] ||= []).push(fn); },
      dispatch(type){ for (const fn of listeners[type] || []) fn({ stopPropagation(){} }); },
      closest(){ return null; }, requestPointerLock(){},
      getContext(){ return canvasContext; }, width:168, height:168,
    });
  }
  return elements.get(id);
}

let nextFrame = null;
const windowListeners = {};
const document = {
  body:{ addEventListener(){}, appendChild(){} },
  pointerLockElement:null,
  getElementById:element,
  createElement:()=>element("generated"),
  addEventListener(){},
};
const window = {
  innerWidth:1280, innerHeight:720, DeviceOrientationEvent:undefined,
  matchMedia:()=>({matches:false}),
  addEventListener(type, fn){ (windowListeners[type] ||= []).push(fn); },
  removeEventListener(){},
};
const context = {
  console, Math, Map, Set, Uint8Array, Array, Infinity,
  document, window, navigator:{maxTouchPoints:0},
  URL, URLSearchParams, location:{search:"?seed=smoke-realm",href:"http://localhost/?seed=smoke-realm"},
  localStorage:{getItem(){return null;},setItem(){}},
  performance:{now:()=>1000},
  requestAnimationFrame(fn){ nextFrame=fn; },
};

vm.createContext(context);
vm.runInContext(source, context, {filename:"index.html"});
if (!nextFrame) throw new Error("game loop did not schedule a frame");
const frame = nextFrame; nextFrame = null; frame(1016);
if (!element("screen").innerHTML.includes("<span")) throw new Error("renderer produced no colored realm output");
if (!element("pos").textContent.includes("48.5")) throw new Error("player did not spawn in Lokhaven");
if (context.tileAt(7.5,44.5)!==1 || context.tileAt(8.5,45.5)!==0) throw new Error("the original maze layout was not preserved");
if (context.tileAt(31.5,53.5)!==0) throw new Error("the original maze has no accessible eastern gate");
context.drawMinimap();
context.interact();
if (!element("context").textContent.includes("Lokhaven Hold")) throw new Error("landmark interaction is not connected");
console.log("Lokrealm smoke test passed: seeded chunks, original maze, renderer, map, and interaction initialized.");
