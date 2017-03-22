///////////////////////////////////////////////////////////////
// OMMF2016
///////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////
// minified.js

var MINI = require('minified'); 
var $ = MINI.$, $$ = MINI.$$, EE = MINI.EE;

$(function(){

///////////////////////////////////////////////////////////////
// poorws.js

var host = "ws://mz4u.net:3004";
var ws = new poorws(host);
var status = 0;

ws.onStatusChange = function(sts){
  status = sts;
  if(sts == 0){
    $("#status").set("innerHTML","Connecting...");
  }else if(sts == 1){
    $("#status").set("innerHTML","Connected!");
    ws.ws.binaryType = 'arraybuffer';
  }else if(sts == 2){
    $("#status").set("innerHTML","Disconnecting...");
  }else if(sts == 3){
    $("#status").set("innerHTML","Re-Connecting...");
  }
};

ws.onOpen = function(e){
  ws.send("master");
};

ws.onMessage = function(mes){
  if(mes.data == "master ack"){
//    console.log("master ack received");
  }else{
    if(mes.data == "cheen"){
      startDuck();
    }else if(mes.data == "jireen"){
      startCheen();
    }      
  }
};


///////////////////////////////////////////////////////////////
// Web Audio

var freqTable = [
110.000,
116.541,
123.471,
130.813,
138.591,
146.832,
155.563,
164.814,
174.614,
184.997,
195.998,
207.652
];

window.AudioContext = window.AudioContext || window.webkitAudioContext;  

let context = new AudioContext();
let oscContext = new AudioContext();
var isAudioEnable = false;
var AudioBuffers = [];
var source;

var gainNode = oscContext.createGain();
let oscillator = oscContext.createOscillator();
oscillator.connect(gainNode);
gainNode.connect(oscContext.destination);

var freq = 220;
oscillator.frequency.value = freq; // 値はHz(ヘルツ)
oscillator.start();


var gainValue = 0;
gainNode.gain.value = gainValue;


bufferLoader = new BufferLoader(context,["./audio/crash.ogg","./audio/Perc04.wav"],finishedLoading);
bufferLoader.load();

function finishedLoading(bufferList) {
  // Create two sources and play them both together.
  for(var cnt = 0;cnt < bufferList.length;cnt++){
    AudioBuffers.push(bufferList[cnt]);
  }
}

var playSound = function(buffer) {
  source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
};

function gainUpdate(){
  if(sensorOn == 0){
    if(gainValue > 0){
      gainValue -= 0.05;
      if(gainValue < 0){
        gainValue = 0;
      }
    }
  }else{
    gainValue = 1;
  }
  gainNode.gain.value = gainValue;
}

var portaCnt = 0;
var portafreq = 0;
function portaUpdate(){
  if(portaCnt > 0){
    portaCnt--;
    oscillator.frequency.value += portafreq;
    if(portaCnt == 0){
      freq = newFreq;
      oscillator.frequency.value = freq;
    }
  }
}

///////////////////////////////////////////////////////////////
// Pixi.js

var stage = new PIXI.Container();
var width = window.innerWidth;
var height = window.innerHeight;
var renderer = PIXI.autoDetectRenderer(width, height, {autoResize: true});
renderer.backgroundColor = 0x000000;
renderer.antialias = false;
document.getElementById("pixiview").appendChild(renderer.view);

// wall
function initWall(){
  var wall = PIXI.Texture.fromImage('./img/wall.png');
  var wsprite = new PIXI.Sprite(wall);
  wsprite.scale.x = 2.2;
  wsprite.scale.y = 2.2;
  wsprite.position.x = width / 2;
  wsprite.position.y = height / 2;
  wsprite.anchor.x = 0.5;
  wsprite.anchor.y = 0.5;
  stage.addChild(wsprite);
}

initWall();

// tree
var treeContainer = new PIXI.Container();
stage.addChild(treeContainer);

var tsprite = null;
function initTree(){
  var tree = PIXI.Texture.fromImage('./img/tree.png');
  tsprite = new PIXI.Sprite(tree);
  tsprite.scale.x = 6.6;
  tsprite.scale.y = 6.6;
  tsprite.position.x = width / 2;
  tsprite.position.y = height / 2 + 200;
  tsprite.anchor.x = 0.5;
  tsprite.anchor.y = 0.5;
  tsprite.mode = 0;
  treeContainer.addChild(tsprite);
}

function updateTree(){
  if(tsprite.mode){
    treeContainer.position.y += 10;
  }else{
    treeContainer.position.y -= 10;
  }
  tsprite.mode ^= 1;
}

initTree();


// Sprites

var sprites = [];
var SPRITES_COLS = 6;
var SPRITES_ROWS = 4;

loader = new PIXI.loaders.Loader();
loader.add('loader','./img/sprites.json');
loader.load(onLoad);

function onLoad(){
  requestAnimationFrame(animate);
}

var MAX_SPRITES = 128

function addSprite(){
//  console.log(height);
  var posY = Math.random() * height;

  var wos = 640 - ((320 / 1080) * posY);
  var wrange = 640 + (((320 / 1080) * posY)*2);

  var posX = wos + (Math.random() * wrange);
  var r = Math.floor(Math.random() * SPRITES_ROWS);
  var c = Math.floor(Math.random() * SPRITES_COLS);
  var name = "test_r"+r+"_c"+c+".png";
  var sprite = PIXI.Sprite.fromFrame(name);
  sprite.scale.x = 16;
  sprite.scale.y = 16;
  sprite.position.x = posX;
  sprite.position.y = posY -140;
  sprite.anchor.x = 0.5;
  sprite.anchor.y = 0;
  sprite.sting = Math.floor(Math.random() * 3);
  sprite.rotation = (sprite.sting * 0.2) - 0.2;
  sprite.isRemoving = false;
  sprite.move = {};
  sprite.move.x = ((Math.random() * 50) - 25) * 4;
  sprite.move.y = ((Math.random() * 50) - 25) * 4;
  console.log("movex:"+sprite.move.x+" movey:"+sprite.move.y);
  sprites.push(sprite);
  if(sprites.length > MAX_SPRITES){
    treeContainer.removeChild(sprites[0]);
    sprites.shift();
  }
  treeContainer.addChild(sprite);
}

function updateSprites(){
  if(flushCnt == 0){
    for(var cnt=0;cnt < sprites.length;cnt++){
      sprites[cnt].sting++;
      sprites[cnt].sting %= 3;
      sprites[cnt].rotation = (sprites[cnt].sting * 0.2) - 0.2;
    }
  }
}

var flushCnt = 0;

function flushSprites(){
  ws.send("jireen");
  flushCnt = 120;
}

function flushUpdate(){
  if(flushCnt != 0){
    for(var cnt=0;cnt < sprites.length;cnt++){
      sprites[cnt].position.x += sprites[cnt].move.x;
      sprites[cnt].position.y += sprites[cnt].move.y;
      sprites[cnt].rotation += 0.2;
      sprites[cnt].scale.x -= 0.008;
      sprites[cnt].scale.y -= 0.008;
    }
    flushCnt --;
    if(flushCnt == 0){
      for(var cnt=0;cnt < sprites.length;cnt++){
        treeContainer.removeChild(sprites[cnt]);
      }
      sprites = [];
    }
  }else{
    for(var cnt=0;cnt < sprites.length;cnt++){
      if(sprites[cnt].scale.x > 1){
        sprites[cnt].scale.x /= 2;
        sprites[cnt].scale.y /= 2;
      }
    }
  }
}


// snow
var snow = true;
var texture = PIXI.Texture.fromImage('img/snow2.png');
var MAX_SNOW = 200;
var snowimgs = [];

function initSnow(){
  for(var cnt=0;cnt < MAX_SNOW;cnt ++){
    snowimgs.push(new PIXI.Sprite(texture));
    snowimgs[cnt].position.x = Math.random() * width;
    snowimgs[cnt].position.y = Math.random() * height;
    snowimgs[cnt].anchor.x = 0.5;
    snowimgs[cnt].anchor.y = 0.5;
    var base = Math.random();
    snowimgs[cnt].alpha = (base/2) + 0.4;
    snowimgs[cnt].scale.x = base/2;
    snowimgs[cnt].scale.y = base/2;
  }
}

function addSnow(){
  snow = true;
  for(var cnt=0;cnt < MAX_SNOW;cnt ++){
    stage.addChild(snowimgs[cnt]);
  }
}

initSnow();
addSnow();

function removeSnow(){
  snow = false;
  for(var cnt=0;cnt < MAX_SNOW;cnt ++){
    stage.removeChild(snowimgs[cnt]);
  }
}


// duck
var duckContainer = new PIXI.Container();
stage.addChild(duckContainer);

var ducks = [];
const DUCK_NUMS = 5;

initDuck();

function initDuck(){
  for(var cnt=0;cnt < DUCK_NUMS;cnt ++){
    var name = "./img/duck"+cnt+".png";
    var dtexture = PIXI.Texture.fromImage(name);
    var duckSprite = new PIXI.Sprite(dtexture);
    duckSprite.visible = false;
    ducks.push(duckSprite);
    duckContainer.addChild(duckSprite);
  }
}

var duckcount = [0,0,0,0,0];

function startDuck(){
  var ducknumber = Math.floor(Math.random()*DUCK_NUMS);
  if(duckcount[ducknumber] > 0){
    ducks[ducknumber].visible = false;
  }
  ducks[ducknumber].position.x = Math.random() * width;
  ducks[ducknumber].position.y = Math.random() * height;
  ducks[ducknumber].anchor.x = 0.5;
  ducks[ducknumber].anchor.y = 0.5;
  ducks[ducknumber].scale.x = 1;
  ducks[ducknumber].scale.y = 1;
  ducks[ducknumber].visible = true;
  ducks[ducknumber].move = {};
  ducks[ducknumber].move.x = ((Math.random() * 50) - 25) * 2;
  ducks[ducknumber].move.y = ((Math.random() * 50) - 25) * 2;
  cheenflg = true;
  duckcount[ducknumber] = 30;
  playSound(AudioBuffers[0]);
}

function updateDuck(){
  for(var cnt=0;cnt < DUCK_NUMS;cnt ++){
    if(duckcount[cnt] > 0){
      duckcount[cnt] --;
      ducks[cnt].position.x += ducks[cnt].move.x;
      ducks[cnt].position.y += ducks[cnt].move.y;
      ducks[cnt].scale.x *= 1.2;
      ducks[cnt].scale.y *= 1.2;
      ducks[cnt].rotation += 0.2;
      if(duckcount[cnt] == 0){
        ducks[cnt].visible = false;
      }
    }
  }
}

var cheenSprite = null;
var cheenCnt = 0;

initCheen();

function initCheen(){
  var name = "./img/cheen.png";
  var dtexture = PIXI.Texture.fromImage(name);
  cheenSprite = new PIXI.Sprite(dtexture);
  cheenSprite.visible = false;
  cheenSprite.move = {};
  cheenSprite.position.x = width / 2;
  cheenSprite.position.y = height / 2;
  cheenSprite.anchor.x = 0.5;
  cheenSprite.anchor.y = 0.5;
  duckContainer.addChild(cheenSprite);
}

function startCheen(){
  remoteflg = true;
  cheenCnt = 24;
  cheenSprite.visible = true;
  cheenSprite.alpha = 1;
}

function updateCheen(){
  if(cheenCnt > 0){
    cheenCnt --;
    if(cheenCnt == 0){
      cheenSprite.visible = false;
      cheenSprite.scale.x = 1;
      cheenSprite.scale.y = 1;
    }else{
      cheenSprite.scale.x *= 1.2;
      cheenSprite.scale.y *= 1.2;
      cheenSprite.rotation += 0.1;
      cheenSprite.alpha -= 0.04;
    }
  }
}


var fpsCnt = 0;
var oldS = 0;
function checkFps(){
  var res = fpsCnt;
  var ms = +new Date();
  var s = Math.floor(ms/1000);
  if(oldS != s){
    console.log("fpsCnt:"+fpsCnt);
    fpsCnt = 0;
    console.log("up");
  }else{
    fpsCnt ++;
    res = 0;
  }
  oldS = s;
  return res;
}

var frame = 0;

function animate(){
  frame ++;
  frame %= 60;
  requestAnimationFrame(animate); // 次の描画タイミングでanimateを呼び出す

  var f = checkFps();
  if(f != 0){
    $("#fps").set("innerHTML",f);
  }

  if(frame == 8){
    updateTree();
  }
  if(frame == 16){
    updateSprites();
  }
  if(frame == 24){
    updateSprites();
  }
  if(frame == 32){
    updateSprites();
  }
  if(frame == 40){
    UpdateLogo();
  }

  if((frame % 6) == 0){
    cheen.readSensor().then((v) => {
      console.log("v:"+v);
      isI2cEnable = true;
      checkSensor(v);
      if(cheenflg == true){
        cheen.cheen(1);
        cheenflg = false;
      }else if(remoteflg == true){
        cheen.jireen();
        remoteflg = false;
      }
    },(error) => {
      console.log("read error:"+error);
    });
  }


  if((frame % 2) == 0){
    flushUpdate();
    updateDuck();
    gainUpdate();
    updateCheen();
  }
  if((frame % 2) == 0){
    if(snow == true){
      for(cnt=0;cnt <MAX_SNOW;cnt++){
        var scale = snowimgs[cnt].scale.x;
        snowimgs[cnt].position.x += scale * (Math.random() - 0.5) * 4;
        snowimgs[cnt].position.y += (scale * 4) + 1;
        if(snowimgs[cnt].position.y > 1024){
          snowimgs[cnt].position.y = -10;
        }
      }
    }
  }
//  if((frame % 2)==1){
//    
//  }
  if((frame % 2)==1){
    portaUpdate();
    renderer.render(stage);   // 描画する
  }
}

// duck
var topContainer = new PIXI.Container();
stage.addChild(topContainer);
var remsprite = null;
var chrmsprite = null;
var crsprite = null;


function initLogo(){
  // QRCode (remocon)
  var qrcodeTex = PIXI.Texture.fromImage('img/QRcode.gif');
  var qrsprite = new PIXI.Sprite(qrcodeTex);
  qrsprite.position.x = 20;
  qrsprite.position.y = 20;
  qrsprite.scale.x = 0.7;
  qrsprite.scale.y = 0.7;
  topContainer.addChild(qrsprite);

  // QRCode2 (chirimen)
  var qrcode2Tex = PIXI.Texture.fromImage('img/QRcode2.gif');
  var qr2sprite = new PIXI.Sprite(qrcode2Tex);
  qr2sprite.position.x = 1776;
  qr2sprite.position.y = 20;
  qr2sprite.scale.x = 0.7;
  qr2sprite.scale.y = 0.7;
  topContainer.addChild(qr2sprite);

  // remocon
  var remoconTex = PIXI.Texture.fromImage('img/remocon.png');
  remsprite = new PIXI.Sprite(remoconTex);
  remsprite.position.x = 160;
  remsprite.position.y = 60;
  remsprite.scale.x = 0.6;
  remsprite.scale.y = 0.6;
  remsprite.cnt = 0;
  topContainer.addChild(remsprite);

    // remocon
  var echigoTex = PIXI.Texture.fromImage('img/echigo.png');
  chrmsprite = new PIXI.Sprite(echigoTex);
  chrmsprite.position.x = 1520;
  chrmsprite.position.y = 20;
  chrmsprite.scale.x = 0.6;
  chrmsprite.scale.y = 0.6;
  topContainer.addChild(chrmsprite);

  // ommf
  var ommfTex = PIXI.Texture.fromImage('img/ommf.png');
  var sprite = new PIXI.Sprite(ommfTex);
  sprite.position.x = 20;
  sprite.position.y = 960;
  sprite.scale.x = 0.5;
  sprite.scale.y = 0.5;
  topContainer.addChild(sprite);

  // chirimen
  var cfTex = PIXI.Texture.fromImage('img/chirimen-logo.png');
  crsprite = new PIXI.Sprite(cfTex);
  crsprite.position.x = width / 2;
  crsprite.position.y = 1000;
  crsprite.scale.x =0.6;
  crsprite.scale.y =0.6;
  crsprite.anchor.x = 0.5;
  crsprite.anchor.y = 0.5;

  topContainer.addChild(crsprite);

}
initLogo();

function UpdateLogo(){
  remsprite.cnt ++;
  remsprite.cnt %= 3;
  remsprite.position.x = 160 + (8*remsprite.cnt);
  chrmsprite.position.x = 1520 + (8*remsprite.cnt);
  crsprite.position.x = (width / 2) + (8 - (8*remsprite.cnt));
}


//remocon.png

///////////////////////////////////////////////////////////////
// WebI2C

var port = null;
var cheen = null;
var cheenflg = false;
var remoteflg = false;
var isI2cEnable = false;

navigator.requestI2CAccess().then((i2cAccess) => {
  port = i2cAccess.ports.get(0);
  cheen = new CheenRimen(port);
  var times = 1;
  cheen.init().then(() => {
    isI2cEnable = true;
    console.log("Cheen.init done");
  },(v) => {
    console.log("Cheen init error:"+v);
  });  
}).catch((e) => {
  console.error("Cheen I2C bus error!", e);
});

var sensors = [0,0,0,0,0];
var oldSensors = [0,0,0,0,0];
var sensorOn = 0;
var newFreq = freq;

function addOrnament(){
  addSprite();
  cheenflg = true;
  var octave = (1 + Math.floor(Math.random()*4));
  newFreq =  octave * freqTable[Math.floor(Math.random()*12)];
  portaCnt = 24;
  portafreq = (newFreq - freq) / 24;
  console.log("octave:"+octave+" freq:"+newFreq);
  gainNode.gain.value = 1.0;
}

function checkSensor(status){
  var son = 0;

  for(var cnt=0;cnt < sensors.length;cnt++){
    if(status & (1 << cnt)){
      son = 1;
      sensors[cnt] = 1;
      if(oldSensors[cnt]!= sensors[cnt]){
        if(flushCnt == 0){
          if(cnt == (sensors.length -1)){
            playSound(AudioBuffers[0]);
            flushSprites();
          }else{
            addOrnament();
          }
        }
      }
    }else{
      sensors[cnt] = 0;
      if(oldSensors[cnt]!= sensors[cnt]){
      }
    }
    oldSensors[cnt] = sensors[cnt];
  }
  if(son == 0){
    gainNode.gain.value = 0;
  }
  sensorOn = son;
}

// for PC test
$(document.body).on("keydown",function(ev){
  if(ev.keyCode == 13){        // リターンキー (touch sensor)
    addOrnament();
    sensorOn = 1;
  }else if(ev.keyCode == 32){  // space (cheen)
    playSound(AudioBuffers[0]);
    flushSprites();
  }else if(ev.keyCode == 48){  // 0
    startDuck();
  }
});
$(document.body).on("keyup",function(ev){
  if(ev.keyCode == 13){  // リターンキー (touch sensor)
    sensorOn = 0;
  }
});




}); // $(function(){



