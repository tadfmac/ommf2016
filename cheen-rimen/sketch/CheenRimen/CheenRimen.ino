
// --------------------------------------------
// CheenRimen for CHIRIMEN-OH
// (CC)2016 by D.F.Mac. @TripArts Music
// 2016.11.16
// --------------------------------------------

/*
###########################################
# ATmega8A
#
# 25:PC2/ADC2/●D16(LED2)---------------+
# 26:PC3/ADC3/●D17(LED1)-------------+ |
# 27:PC4/ADC4/SDA/●D18(SDA)--------+ | |
# 28:PC5/ADC5/SCL/●D19(SCL)------+ | | | 
# 29:PC6/RESET       ----------+ | | | |
# 30:PD0/RXD/●D0(SOT5-CH)----+ | | | | |
# 31:PD1/TXD/●D1(SIN5-CH)--+ | | | | | |
# 32:PD2/INT0/●D2   -----+ | | | | | | |
#                      +-+-+-+-+-+-+-+-+-+
# 01:PD3/INT1/●D3      | ●               | 24:PC1/ADC1/●D15(LED4)
# 02:PD4/XCK/T0/●D4    |                 | 23:PC0/ADC0/●D14(LED3)
# 03:GND               |                 | 22:ADC7
# 04:VCC               |                 | 21:GND
# 05:GND               |                 | 20:AREF
# 06:VCC               |                 | 19:ADC6
# 07:PB6/XTAL1         |                 | 18:AVCC
# 08:PB7/XTAL2(SIN-1)  |                 | 17:PB5/SCK/●D13(CHEEN OUT)
#                      +-+-+-+-+-+-+-+-+-+
# 09:PD5/●D5(SIN-4) -----+ | | | | | | |
# 10:PD6/●D6(SOT-4) -------+ | | | | | |
# 11:PD7/●D7(SOT-3)  --------+ | | | | |
# 12:PB0/●D8(SIN-3)  ----------+ | | | |
# 13:PB1/OC1A/●D9(SOT-2)---------+ | | | 
# 14:PB2/SS/OC1B/●D10(SIN-2)-------+ | |
# 15:PB3/MOSI/OC2/●D11(SOT-1)--------+ |
# 16:PB4/MISO/●D12---------------------+
#
###########################################

*/
#include <Wire2.h>
#include <avr/sfr_defs.h>
#include "Adafruit_NeoPixel.h"

//////////////////////////////////////////////
// Color LED

/*
#define PIXEL_COUNT 8
#define PIXEL_PIN 17

#define COLOR_NUMS 16 
uint8_t colorNums[] = {
  255,128,  0,  7,211, 32,  3,  9,
  18 , 12, 42, 80,239,141, 69, 53
};
uint8_t colorCnt = 0;

Adafruit_NeoPixel strip = Adafruit_NeoPixel(PIXEL_COUNT, PIXEL_PIN, NEO_GRB + NEO_KHZ800);

void colorLedOn(){
  int cnt = 0;
  uint8_t r = colorNums[random(16)];
  uint8_t g = colorNums[random(16)];
  uint8_t b = colorNums[random(16)];
  for(cnt = 0;cnt <PIXEL_COUNT;cnt ++){
    strip.setPixelColor(cnt,strip.Color(r,g,b));
  }
}

void colorLedOff(){
  int cnt = 0;
  for(cnt = 0;cnt <PIXEL_COUNT;cnt ++){
    strip.setPixelColor(cnt,0);
  }
}
*/

#define SENSOR_NUM 5

/////////////////////////////////////////////
// LED functions

#define LEDNUM 4  

typedef struct _REG_DATA_STR{
  uint8_t *pDDR;
  uint8_t *pPORT;
  uint8_t *pPIN;
  uint8_t pin;
  uint8_t dummy;
}REG_DATA_STR;

REG_DATA_STR Leds[LEDNUM] = {
  {(uint8_t *)_SFR_ADDR(DDRC),(uint8_t *)_SFR_ADDR(PORTC),NULL,PC3,0},
  {(uint8_t *)_SFR_ADDR(DDRC),(uint8_t *)_SFR_ADDR(PORTC),NULL,PC2,0},
  {(uint8_t *)_SFR_ADDR(DDRC),(uint8_t *)_SFR_ADDR(PORTC),NULL,PC0,0},
  {(uint8_t *)_SFR_ADDR(DDRC),(uint8_t *)_SFR_ADDR(PORTC),NULL,PC1,0}
};

void Led_Init(){}

void Led_On(uint8_t num){
  *(Leds[num].pDDR) |= (1 << Leds[num].pin);
  *(Leds[num].pPORT) |= (1 << Leds[num].pin);
}

void Led_Off(uint8_t num){
  *(Leds[num].pPORT) &= ~(1 << Leds[num].pin);
  *(Leds[num].pDDR) &= ~(1 << Leds[num].pin);
}

void Led_AllOn(void){
  DDRC |= ((1 << PC3)|(1 << PC2)|(1 << PC0)|(1 << PC1));
  PORTC |= ((1 << PC3)|(1 << PC2)|(1 << PC0)|(1 << PC1));
}

void Led_AllOff(void){
  PORTC &= ~((1 << PC3)|(1 << PC2)|(1 << PC0)|(1 << PC1));
  DDRC &= ~((1 << PC3)|(1 << PC2)|(1 << PC0)|(1 << PC1));
}


/////////////////////////////////////////////
// Sensor functions

#define SENSORNUM 5  

#define SENSOR_MARGIN_BASE   6 //13
#define SENSOR_MARGIN_DIV    40  //384 
#define SENSOR_MARGIN_LIMIT   6
#define SENSOR_DOWN_VALUE     3
#define SENSOR_UP_VALUE       4
#define SENSOR_CHECK_NUM      5
#define SENSOR_CALIB_TIMES   64

REG_DATA_STR SensorOuts[SENSORNUM] = {
  {(uint8_t *)_SFR_ADDR(DDRB),(uint8_t *)_SFR_ADDR(PORTB),NULL,PB3,0},
  {(uint8_t *)_SFR_ADDR(DDRB),(uint8_t *)_SFR_ADDR(PORTB),NULL,PB1,0},
  {(uint8_t *)_SFR_ADDR(DDRD),(uint8_t *)_SFR_ADDR(PORTD),NULL,PD7,0},
  {(uint8_t *)_SFR_ADDR(DDRD),(uint8_t *)_SFR_ADDR(PORTD),NULL,PD6,0},
  {(uint8_t *)_SFR_ADDR(DDRD),(uint8_t *)_SFR_ADDR(PORTD),NULL,PD1,0}
};

REG_DATA_STR SensorIns[SENSORNUM] = {
  {(uint8_t *)_SFR_ADDR(DDRB),NULL,(uint8_t *)_SFR_ADDR(PINB),PB7,0},
  {(uint8_t *)_SFR_ADDR(DDRB),NULL,(uint8_t *)_SFR_ADDR(PINB),PB2,0},
  {(uint8_t *)_SFR_ADDR(DDRB),NULL,(uint8_t *)_SFR_ADDR(PINB),PB0,0},
  {(uint8_t *)_SFR_ADDR(DDRD),NULL,(uint8_t *)_SFR_ADDR(PIND),PD5,0},
  {(uint8_t *)_SFR_ADDR(DDRD),NULL,(uint8_t *)_SFR_ADDR(PIND),PD0,0}
};

#define SENSOR_MARGIN   8

void Sensor_Init(){
  uint8_t cnt;
  for(cnt=0;cnt<SENSORNUM;cnt++){
    *(SensorOuts[cnt].pDDR) |= (1 << SensorOuts[cnt].pin);
    *(SensorIns[cnt].pDDR) &= ~(1 << SensorIns[cnt].pin);
  }
}

void Sensor_Out(uint8_t sensor){
  *(SensorOuts[sensor].pPORT) |= (1 << SensorOuts[sensor].pin);
}

void Sensot_Clear(uint8_t sensor){
  *(SensorOuts[sensor].pPORT) &= ~(1 << SensorOuts[sensor].pin);
}

uint8_t Sensor_Check(uint8_t sensor){
  uint8_t p = _SFR_MEM8(SensorIns[sensor].pPIN);
  return (p & (1 << SensorIns[sensor].pin));
}

// Global
int val[] = {0,0,0,0,0};
int comp[] = {-1,-1,-1,-1,-1};
int compH[] = {-1,-1,-1,-1,-1};
int compL[] = {0x7fff,0x7fff,0x7fff,0x7fff,0x7fff};
uint8_t seq[] = {0,0,0,0,0,0};
uint8_t latch[] = {0,0,0,0,0,0};


void calibration(){
  uint8_t sensor;
  uint8_t cnt;
  int calc;

  Led_On(0);
  delay(100);
  Led_Off(0);

  for(sensor = 0;sensor < SENSOR_NUM; sensor ++){
    val[sensor] = 0;
    comp[sensor] = -1;
    compH[sensor] = -1;
    compL[sensor] = 0x7fff;
  }

  for(cnt = 0;cnt < SENSOR_CALIB_TIMES;cnt ++){
    for(sensor = 0;sensor < SENSOR_NUM; sensor ++){
      measure1(sensor);
      calc = SENSOR_MARGIN_DIV / (val[sensor] + SENSOR_MARGIN_BASE);
      if(calc < SENSOR_MARGIN_LIMIT){
        calc = SENSOR_MARGIN_LIMIT;
      }
      comp[sensor] += ((val[sensor] + calc) - comp[sensor])/2;
      if(comp[sensor] > compH[sensor]){
        compH[sensor] = comp[sensor];
      }
      if(comp[sensor] < compL[sensor]){
        compL[sensor] = comp[sensor];
      }
    }
    delay(3);
  }
  for(sensor = 0;sensor < SENSOR_NUM; sensor ++){
    comp[sensor] = compH[sensor]+((compH[sensor]-compL[sensor])/2);
  }

  Led_On(0);
  delay(100);
  Led_Off(0);

}

void measure1(uint8_t sensor){
  uint8_t p;
  int cnt;

  cnt = 0;
  Sensor_Out(sensor);
  while(1){
    if(Sensor_Check(sensor) !=0){
      break;
    }
    cnt ++;
  }
  Sensot_Clear(sensor);
  val[sensor] +=  (cnt - val[sensor])/2;
}

/////////////////////////////////////////////
// Cheen

// Read Sensor data : 
// [S][A:W][CHEEN_MODE_READ_SENSOR][P]  [S][A:R][sensorFlg][P]
// or
// [S][A:W][CHEEN_MODE_READ_SENSOR][SR][A:R][sensorFlg][P]
#define CHEEN_MODE_READ_SENSOR    0x00

// Read Cheen SeqTime : 
// [S][A:W][CHEEN_MODE_READ_CHEEN_SEQTIMES][P]  [S][A:R][seqTimes][P]
// or
// [S][A:W][CHEEN_MODE_READ_CHEEN_SEQTIMES][SR][A:R][seqTimes][P]
#define CHEEN_MODE_READ_CHEEN_SEQTIMES  0x01

// Read Cheen IntervalTime : 
// [S][A:W][CHEEN_MODE_READ_CHEEN_INTTIME][P]  [S][A:R][IntervalTime][P]
// or
// [S][A:W][CHEEN_MODE_READ_CHEEN_INTTIME][SR][A:R][IntervalTime][P]
#define CHEEN_MODE_READ_CHEEN_INTTIME  0x02

// Cheen Play : [S][A:W][CHEEN_MODE_PLAY][CHEEN_PLAY_START][P]
// Cheen Stop : [S][A:W][CHEEN_MODE_PLAY][CHEEN_PLAY_STOP][P]
#define CHEEN_MODE_PLAY    0x10
#define CHEEN_PLAY_STOP    0x00
#define CHEEN_PLAY_START   0x01

// Cheen Set <SeqTimes> : [S][A:W][CHEEN_MODE_SET_SEQTIMES][seqTimes][P]
#define CHEEN_MODE_SET_SEQTIMES  0x20

// Cheen Set <IntervalTime> : [S][A:W][CHEEN_MODE_SET_INTTIME][IntervalTime][P]
#define CHEEN_MODE_SET_INTTIME  0x21

// Cheen Led Off <color> : [S][A:W][CHEEN_MODE_LED_OFF][Dummy][P]
// #define CHEEN_MODE_LED_OFF 0x30

// Cheen Led On <color> : [S][A:W][CHEEN_MODE_LED_ON][Color][P]
// #define CHEEN_MODE_LED_ON  0x31

uint8_t reg = CHEEN_MODE_READ_SENSOR;
uint8_t flgs = 0;  // sensor onoff flags
uint8_t req_isPlay = 0;  // 0x80:req-on 0x01:start(0n) stop(off)

uint8_t isSeqPlay = 0;
uint8_t isSeqInterval = 0;
uint8_t cntSeq = 0;
#define DEFAULT_MAX_SEQ_CNT 1
#define MIN_SEQ_CNT 1 
#define MAX_SEQ_CNT 16 
#define DEFAULT_MAX_CHEEN_CNT 3
#define DEFAULT_MAX_SEQ_INTERVAL 37 
#define MIN_SEQ_INTERVAL 10 
#define MAX_SEQ_INTERVAL 1000 
uint16_t cntSeqInterval = 0;
uint16_t maxSeqCnt = DEFAULT_MAX_SEQ_CNT;
uint16_t maxSeqInterval = DEFAULT_MAX_SEQ_INTERVAL;

uint8_t isCheenPlay = 0;
uint8_t cntCheen = 0;
uint8_t maxCheenCnt = DEFAULT_MAX_CHEEN_CNT;

#define CheenInit() (DDRB |= (1 << PB5))
#define CheenOn() (PORTB |= (1 << PB5))
#define CheenOff() (PORTB &= ~(1 << PB5))

void CheenStart(){
  Led_On(3);

  cntCheen = 0;
  isCheenPlay = 1;
  CheenOn();
}

void CheenStop(){
  Led_Off(3);
  CheenOff();
  isCheenPlay = 0;
  cntCheen = 0;
}

void CheenStartCheck(){
  if((req_isPlay & 0x80)!= 0){
    if((req_isPlay & 0x7f) == CHEEN_PLAY_START){
      SeqStart(maxSeqCnt,maxSeqInterval); 
    }else{
      SeqStop(); 
    }
    req_isPlay = 0;
  }
}

void CheenStopCheck(){
  if(isCheenPlay == 1){
    cntCheen++;
    if(cntCheen >= maxCheenCnt){
      CheenStop();
      if(isSeqPlay){
        cntSeq ++;
        if(cntSeq < maxSeqCnt){
          startInterval();
        }else{
          SeqStop();
        }
      }
    }
  }else if(isSeqInterval == 1){
    cntSeqInterval++;
    if(cntSeqInterval >= maxSeqInterval){
      stopInterval();
      if(cntSeq < maxSeqCnt){
        CheenStart();
      }
    }
  }
}

void startInterval(){
  isSeqInterval = 1;
  cntSeqInterval = 0;
}

void stopInterval(){
  isSeqInterval = 0;
}

void SeqStart(uint8_t times, uint8_t interval){
  isSeqPlay = 1;
  cntSeq = 0;
  maxSeqCnt = times;
  maxSeqInterval = interval;
  CheenStart();
}

void SeqStop(){
  isSeqPlay = 0;
  CheenStop();
}

/////////////////////////////////////////////
// I2C Slave Functions

void requestEvent(){
  if(reg == CHEEN_MODE_READ_SENSOR){
    uint8_t latch_flg = 0;
    uint8_t cnt;
    for(cnt=0;cnt<SENSORNUM;cnt++){
      latch_flg |= (latch[cnt] << cnt);
      latch[cnt] = 0;
    }
    latch_flg |= flgs;
    Wire.write(latch_flg);
  }else if(reg == CHEEN_MODE_READ_CHEEN_SEQTIMES){
    Wire.write(maxSeqCnt);
  }else if(reg == CHEEN_MODE_READ_CHEEN_INTTIME){
    Wire.write(maxSeqInterval);
  }
}

void receiveEvent(int num){
  uint8_t dmy = 0;
  if(Wire.available()){
    reg = Wire.read();
  }
  if(Wire.available()){
    if(reg == CHEEN_MODE_PLAY){
      req_isPlay |= 0x80;
      req_isPlay |= Wire.read();
    }else if(reg == CHEEN_MODE_SET_SEQTIMES){
      dmy = Wire.read();
      if((dmy >= MIN_SEQ_CNT) && (dmy <= MAX_SEQ_CNT)){
        maxSeqCnt = dmy;
      }
    }else if(reg == CHEEN_MODE_SET_INTTIME){
      dmy = Wire.read();
      if((dmy >= MIN_SEQ_INTERVAL) && (dmy <= MAX_SEQ_INTERVAL)){
        maxSeqInterval = dmy;
      }
    }
    /*
    else if(reg == CHEEN_MODE_LED_ON){
      dmy = Wire.read();
      colorLedOn();
    }else if(reg == CHEEN_MODE_LED_OFF){
      dmy = Wire.read();
      colorLedOff();
    }
    */
  }
  while(Wire.available()){
    dmy = Wire.read();
  }
}

/////////////////////////////////////////////
// main

// Init Port
void InitPorts(){
  Led_Init();
  CheenInit();
  Sensor_Init();
}

void setup( ) {
  InitPorts();
//  strip.begin();
//  strip.show(); // Initialize all pixels to 'off'
  Wire.begin(0x30);
  Wire.onRequest(requestEvent);
  Wire.onReceive(receiveEvent);
  calibration();
}

void loop( ) {
  uint8_t sensor;

  CheenStartCheck();
  CheenStopCheck();

  for(sensor = 0;sensor < SENSOR_NUM; sensor ++){
    measure1(sensor);
    if(val[sensor] > comp[sensor]){
      if(seq[sensor] < SENSOR_CHECK_NUM){
        seq[sensor]++;
        if(seq[sensor] > SENSOR_UP_VALUE){
          if(sensor != 4){
            Led_On(sensor);
          }else{
            Led_AllOn();
          }
          flgs |= (1 << sensor);
          latch[sensor] = 1;
        }
      }
    }else{
      if(seq[sensor] > 0){
        seq[sensor]--;
        if(seq[sensor] < SENSOR_DOWN_VALUE){
          if(sensor != 4){
            Led_Off(sensor);
          }else{
            Led_AllOff();
          }
          flgs &= ~(1 << sensor);
        }
      }
    }
  }
  delay(3);  
}


