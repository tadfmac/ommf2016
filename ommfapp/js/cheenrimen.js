// Source : http://wiki.seeedstudio.com/wiki/Grove_-_Gesture_v1.0

var CheenRimen = function(i2cPort){
  this.i2cPort = i2cPort;
  this.slaveAddress = 0x30;
  this.sensor = [0,0,0,0,0];
  this.isPlay = false;
  this.i2cSlave = null;
  this.isLedOn = false;
};

CheenRimen.prototype = {
  init: function(){
    return new Promise((resolve, reject) => {
      this.i2cPort.open(this.slaveAddress).then((i2cSlave) => {
        this.i2cSlave = i2cSlave;
        console.log("i2cPort.open");
        resolve();
      });
    });
  },
  readSensor : function(){
    return new Promise((resolve, reject) => {
      if(this.i2cSlave){
        this.i2cSlave.read8(0,0).then((v) => {
          v = v & 0x00ff;
          resolve(v);
        },(error) => {
          console.log("error"+error);
        }).catch(reject);
      }else{
        console.log("i2cSlave is gone.....");
      }
    });
  },
  cheen : function(times){
    if(this.i2cSlave){
      console.log("cheen!");
      if(times <= 4 && times >= 1){
        this.i2cSlave.write8(0x20,times);
      }
      this.i2cSlave.write8(0x10,0x01);
    }
  },
  jireen : function(){
    if(this.i2cSlave){
      console.log("jireen!");
      this.i2cSlave.write8(0x20,16);
      this.i2cSlave.write8(0x21,10);
      this.i2cSlave.write8(0x10,0x01);
    }
  },
  led: function(){
    if(this.i2cSlave){
      if(this.isLedOn){
        console.log("LED OFF");
        this.i2cSlave.write8(0x30,0);
      }else{
        console.log("LED ON");
        this.i2cSlave.write8(0x31,0);
      }
      this.isLedOn ^= 1;
    }
  }
};
