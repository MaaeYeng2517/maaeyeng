
// ===== App State =====
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let dpr = window.devicePixelRatio || 1;

let tool = 'brush';
let strokeColor='#06b6d4';
let fillColor='#ffffff';
let strokeWidth=4;
let opacity=1;
let drawing=false;
let currentPoint=null;

// Layers & history
let layers=[], activeLayerId=null;
let history=[], redoStack=[];

// Chat
let chatBox = document.getElementById('chatBox');

// ===== Helpers =====
const $ = (s)=>document.querySelector(s);
function resizeCanvas(){
  const rect=canvas.getBoundingClientRect();
  canvas.width = rect.width*dpr;
  canvas.height = rect.height*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  redrawAll();
}
function getCanvasPoint(e){
  const rect=canvas.getBoundingClientRect();
  return {x:e.clientX-rect.left, y:e.clientY-rect.top};
}
function getActiveLayer(){ return layers.find(l=>l.id===activeLayerId); }
function escapeHtml(s){return String(s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m];});}

// ===== Init =====
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ===== Tool selection =====
document.querySelectorAll('.tool-btn').forEach(b=>{
  b.addEventListener('click', ()=>{
    tool=b.dataset.tool;
    document.querySelectorAll('.tool-btn').forEach(btn=>btn.classList.remove('active'));
    b.classList.add('active');
  });
});

// ===== Sub-options =====
$('#strokeColor').addEventListener('input',e=>strokeColor=e.target.value);
$('#fillColor').addEventListener('input',e=>fillColor=e.target.value);
$('#strokeWidth').addEventListener('input',e=>strokeWidth=parseInt(e.target.value));
$('#opacity').addEventListener('input',e=>opacity=parseFloat(e.target.value));

// ===== Layers =====
function addLayer(name){ 
  const id='layer_'+Date.now(); 
  const layer={id,name:name||('Layer '+(layers.length+1)),visible:true,opacity:1,strokes:[]};
  layers.push(layer);
  activeLayerId=id;
  renderLayers(); redrawAll();
}
function renderLayers(){
  const container=$('#layers'); container.innerHTML='';
  layers.forEach(l=>{
    const div=document.createElement('div');
    div.className='layer'+(l.id===activeLayerId?' active':'');
    div.textContent=l.name;
    div.addEventListener('click',()=>{activeLayerId=l.id; renderLayers();});
    container.appendChild(div);
  });
}
$('#addLayer').addEventListener('click',()=>addLayer());

// ===== Drawing =====
canvas.addEventListener('pointerdown', e=>{
  drawing=true; currentPoint=getCanvasPoint(e);
  const layer=getActiveLayer();
  if(!layer) return;
  if(tool==='brush' || tool==='eraser'){
    const s={tool,points:[currentPoint],color:strokeColor,size:strokeWidth,opacity:opacity};
    layer.strokes.push(s);
    history.push({type:'stroke',layerId:layer.id,stroke:s});
    redoStack=[];
  } else if(['line','rect','ellipse','triangle','star','hexagon','arrow','text'].includes(tool)){
    const s={tool,start:currentPoint,end:currentPoint,color:strokeColor,fill:fillColor,size:strokeWidth,opacity:opacity,text:''};
    layer.strokes.push(s);
    history.push({type:'stroke',layerId:layer.id,stroke:s});
    redoStack=[];
  }
});

canvas.addEventListener('pointermove', e=>{
  if(!drawing) return;
  const p=getCanvasPoint(e);
  const layer=getActiveLayer();
  if(!layer) return;
  const stroke=layer.strokes[layer.strokes.length-1];
  if(stroke.tool==='brush' || stroke.tool==='eraser'){ stroke.points.push(p); drawStrokeSegment(stroke.points[stroke.points.length-2], p, stroke);}
  else{ stroke.end=p; redrawAll();}
});

canvas.addEventListener('pointerup', e=>{drawing=false; currentPoint=null; redrawAll();});

function drawStrokeSegment(a,b,s){
  ctx.save();
  ctx.globalAlpha=s.opacity;
  ctx.lineWidth=s.size;
  ctx.strokeStyle=s.color;
  if(s.tool==='eraser') ctx.globalCompositeOperation='destination-out'; else ctx.globalCompositeOperation='source-over';
  ctx.beginPath();
  ctx.moveTo(a.x,a.y);
  ctx.lineTo(b.x,b.y);
  ctx.stroke();
  ctx.restore();
}

function drawDiagram(s){
  ctx.save();
  ctx.globalAlpha=s.opacity;
  ctx.lineWidth=s.size;
  ctx.strokeStyle=s.color;
  ctx.fillStyle=s.fill;
  const startX=s.start.x, startY=s.start.y, endX=s.end.x, endY=s.end.y;
  const width=endX-startX, height=endY-startY;
  if(s.tool==='line'){ctx.beginPath();ctx.moveTo(startX,startY);ctx.lineTo(endX,endY);ctx.stroke();}
  else if(s.tool==='rect'){ctx.beginPath();ctx.rect(startX,startY,width,height);ctx.fill();ctx.stroke();}
  else if(s.tool==='ellipse'){ctx.beginPath();ctx.ellipse(startX+width/2,startY+height/2,Math.abs(width/2),Math.abs(height/2),0,0,Math.PI*2);ctx.fill();ctx.stroke();}
  else if(s.tool==='triangle'){ctx.beginPath();ctx.moveTo(startX+width/2,startY);ctx.lineTo(startX,endY);ctx.lineTo(endX,endY);ctx.closePath();ctx.fill();ctx.stroke();}
  else if(s.tool==='star'){ 
    const cx=startX+width/2,cy=startY+height/2,spikes=5,outerR=Math.abs(width)/2,innerR=outerR/2;
    let rot=Math.PI/2*3,x=cx,y=cy,step=Math.PI/spikes;
    ctx.beginPath();ctx.moveTo(cx,cy-outerR);
    for(let i=0;i<spikes;i++){x=cx+Math.cos(rot)*outerR;y=cy+Math.sin(rot)*outerR;ctx.lineTo(x,y);rot+=step;x=cx+Math.cos(rot)*innerR;y=cy+Math.sin(rot)*innerR;ctx.lineTo(x,y);rot+=step;}
    ctx.closePath();ctx.fill();ctx.stroke();
  }
  else if(s.tool==='hexagon'){const cx=startX+width/2,cy=startY+height/2,r=Math.abs(width)/2;ctx.beginPath();for(let i=0;i<6;i++){const a=Math.PI/3*i-Math.PI/2,x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.fill();ctx.stroke();}
  ctx.restore();
}

function redrawAll(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(const l of layers){
    if(!l.visible) continue;
    ctx.save(); ctx.globalAlpha=l.opacity;
    for(const s of l.strokes){
      if(s.tool==='brush'||s.tool==='eraser'){for(let i=1;i<s.points.length;i++) drawStrokeSegment(s.points[i-1],s.points[i],s);}
      else drawDiagram(s);
    }
    ctx.restore();
  }
}

// ===== Undo/Redo/Clear =====
$('#undo').addEventListener('click',()=>{
  if(history.length===0) return;
  const act=history.pop(); redoStack.push(act);
  if(act.type==='stroke'){ const layer=getActiveLayer(); layer.strokes=layer.strokes.filter(s=>s!==act.stroke);}
  redrawAll();
});
$('#redo').addEventListener('click',()=>{
  if(redoStack.length===0) return;
  const act=redoStack.pop(); history.push(act);
  if(act.type==='stroke'){ const layer=getActiveLayer(); layer.strokes.push(act.stroke);}
  redrawAll();
});
$('#clear').addEventListener('click',()=>{const layer=getActiveLayer(); if(!layer) return; layer.strokes=[]; history=[]; redoStack=[]; redrawAll();});

// ===== Export =====
$('#exportPng').addEventListener('click',()=>{
  const data=canvas.toDataURL('image/png'); const a=document.createElement('a'); a.href=data; a.download='drawing.png'; a.click();
});
$('#exportSvg').addEventListener('click',()=>{
  alert('SVG export simple placeholder'); // สามารถขยายเป็น SVG export เหมือน PNG
});

// ===== User =====
$('#saveUser').addEventListener('click',()=>{localStorage.setItem('username',$('#username').value);});

// ===== Chat =====
$('#sendChat').addEventListener('click',()=>{
  const msg=$('#chatMsg').value.trim();
  if(!msg) return;
  const user=$('#username').value||'Guest';
  const div=document.createElement('div'); div.className='msg'; div.textContent=`${user}: ${msg}`;
  chatBox.appendChild(div); chatBox.scrollTop=chatBox.scrollHeight;
  $('#chatMsg').value='';
});

// ===== Init Default Layer =====
addLayer('Background');
