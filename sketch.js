let mult = 100;
let wst = 1;
let wstOffset = Math.floor(wst/2);
let constOffest = 20;
let mylines1;
let myflag = 0;
let buttonClear;
let buttonMove;
let buttonRandom;
let buttonDraw;
let buttonSpace = 20;

class MyLine {
  constructor(x1, y1, x2, y2, ah = 3, av = 3){
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.strokew = wst;
    this.strokecol = 70;
    this.mirroraxis_h = ah*2;
    this.mirroraxis_v = av*2;
    this.sticky = false;
  }

  getcoord(val){
    return (val*mult)+wstOffset+constOffest
  }

  drawme(){
    strokeWeight(this.strokew);
    stroke(this.strokecol);
    line(
      this.getcoord(this.x1),
      this.getcoord(this.y1),
      this.getcoord(this.x2),
      this.getcoord(this.y2)
    );
  }

  drawme_mirror_h(){
    strokeWeight(this.strokew);
    stroke(this.strokecol);
    line(
      this.getcoord(this.x1),
      this.getcoord(this.mirroraxis_h-this.y1),
      this.getcoord(this.x2),
      this.getcoord(this.mirroraxis_h-this.y2)
    );
  }

  drawme_mirror_v(){
    strokeWeight(this.strokew);
    stroke(this.strokecol);
    line(
      this.getcoord(this.mirroraxis_v-this.x1),
      this.getcoord(this.y1),
      this.getcoord(this.mirroraxis_v-this.x2),
      this.getcoord(this.y2)
    );
  }

  drawme_mirror_vh(){
    strokeWeight(this.strokew);
    stroke(this.strokecol);
    line(
      this.getcoord(this.mirroraxis_v-this.x1),
      this.getcoord(this.mirroraxis_h-this.y1),
      this.getcoord(this.mirroraxis_v-this.x2),
      this.getcoord(this.mirroraxis_h-this.y2)
      );
  }

  clone(){
    return new MyLine(this.x1, this.y1, this.x2, this.y2)
  }

}

class MyLines {
  constructor(mymemory = new Set()){
    this.mymemory = mymemory;
    this.mytempmem = [];
    this.myresult= mymemory;
    this.i=0;
    this.pushedline=new Set();
    this.mirrorh = false;
    this.mirrorv = false;
    this.snapv = new p5.Vector([-1],[-1])
    this.isOnTarget = false;
    this.targetCoords = {x1 : 0, y1 : 0, x2 : 0, y2 : 0}
  }

  getCanvasCoord(val){
    return (val*mult)+wstOffset+constOffest
  }

  getGridCoord(val){
    let result = ((val-wstOffset-constOffest)/mult)
    if (result%1 === 0){
      return result
    }
    else{
      return -1
    }
  }

  cpObj(value){
    //return Object.assign({}, value);
    return value.clone()
  }
  
  mirrordfuncH(value){
    value.y1 = 6-value.y1;
    value.y2 = 6-value.y2;
    return value
  }
  
  mirrordfuncV(value){
    value.x1 = 6-value.x1;
    value.x2 = 6-value.x2;
    return value
  }
  
  drawFunc(value){
    value.drawme()
    if(this.mirrorh === true){
      if(this.mirrorv === true){
        value.drawme_mirror_h()
        value.drawme_mirror_v()
        value.drawme_mirror_vh()
      }
      else{value.drawme_mirror_h()
      }
    }
    else if (this.mirrorv === true) {
      value.drawme_mirror_v()
    }
    
  }
  
  mirrorObjects(input = Array.from(this.mymemory)){
    if (input.length*4 !== this.myresult.length || myflag === 1) {
      this.myresult = input.map(this.cpObj);
      this.mytempmem = input.map(this.cpObj);
      this.myresult.map(this.mirrordfuncH);
      this.myresult = this.myresult.concat(this.mytempmem);
      this.mytempmem = this.myresult.map(this.cpObj)
      this.mytempmem.map(this.mirrordfuncV);
      this.myresult = this.myresult.concat(this.mytempmem);
      console.log(input.length);
      //console.log(this.mytempmem.length);
      //console.log(this.myresult.length);
      myflag = 0;
    }
  }

  hover(linehover = false, pointhover = true){
    this.myresult.forEach(element => {
      if (linehover){
        if(this.isOverLine(element)){
          element.strokew = 20;
        }
        else {
          element.strokew = wst;
        }
      }
      
    });
  }

  isOverLine(aline){
    const xLow = Math.min(aline.getcoord(aline.x1), aline.getcoord(aline.x2));
    const yLow = Math.min(aline.getcoord(aline.y1), aline.getcoord(aline.y2));
    const xHigh = Math.max(aline.getcoord(aline.x1), aline.getcoord(aline.x2));
    const yHigh = Math.max(aline.getcoord(aline.y1), aline.getcoord(aline.y2));
    const myvector = new p5.Vector([aline.x2-aline.x1], [aline.y2-aline.y1]);
    const m = myvector.y/myvector.x
    const b = aline.getcoord(aline.y1) - m*aline.getcoord(aline.x1)
    let bp = mouseY - m*mouseX
    const delta = 3

    if(m === 0 || m === -0){
      if (
        mouseX >= xLow &&
        mouseX <= xHigh &&
        mouseY >= (yLow - delta) &&
        mouseY <= (yHigh + delta)){
        return true
      }
    }
    else if (m > 10 || m < -10){
      if (
        mouseX >= (xLow - delta) &&
        mouseX <= (xHigh + delta) &&
        mouseY >= yLow &&
        mouseY <= yHigh){
        return true
      }
    }
    else if(
      abs(b-bp)<=delta+2 &&
      mouseX >= xLow &&
      mouseX <= xHigh &&
      mouseY >= yLow &&
      mouseY <= yHigh)
    {
      return true
    }
    else {
      return false
    }
  }

  addRandom(){
    if (mouseIsPressed === true){
      this.mymemory.add(
        new MyLine(
          getRandomInt(4),
          getRandomInt(4),
          getRandomInt(4),
          getRandomInt(4)
        )
      );
    }
  }

  addAndSaveLines(){
    if(this.snapv.x != -1 && this.snapv.x <=3 && this.snapv.y <=3){
      let {retX, retY, isNearPoint} = this.getCursorGridPos(0.25);
      this.isOnTarget = isNearPoint
      this.targetCoords = {
        x1 : this.snapv.x,
        y1 : this.snapv.y,
        x2 : this.getGridCoord(retX),
        y2 : this.getGridCoord(retY)
      }

      line(this.getCanvasCoord(this.snapv.x), this.getCanvasCoord(this.snapv.y), retX, retY)
      if (
          //keyIsPressed === true &&
          //keyCode === ESCAPE
          !mouseIsPressed
          ) {
        this.snapv.x = -1;
      }
    }
  }
  
  drawMe(mirrorh, mirrorv){   
    this.mirrorh = mirrorh
    this.mirrorv = mirrorv
    this.myresult.forEach(this.drawFunc, this);
  }

  clear(){
    console.log(this.mymemory);
    console.log(this.myresult);
    this.mymemory.forEach((point) => {
      if (point.sticky === false) 
        {
        this.mymemory.delete(point);
      }
    });
    this.myresult = this.mymemory;
  }

  getCursorGridPos(threshold = 0.1, mirrorLine = 3) {
    let coarseX = Math.floor((mouseX-wstOffset-constOffest)/mult+0.5);
    let coarseY = Math.floor((mouseY-wstOffset-constOffest)/mult+0.5);
    let fineX = abs(((mouseX-wstOffset-constOffest)/mult)-coarseX);
    let fineY = abs(((mouseY-wstOffset-constOffest)/mult)-coarseY);
    let retX;
    let retY;
    let isNearPoint = false;
    if (
      fineX < threshold &&
      fineY < threshold &&
      coarseX <=mirrorLine &&
      coarseY <=mirrorLine)
    {
      retX = this.getCanvasCoord(coarseX);
      retY = this.getCanvasCoord(coarseY);
      isNearPoint = true;
    }
    else {
      retX = mouseX;
      retY = mouseY;
      isNearPoint = false;
    }
    return {
      retX : retX,
      retY : retY,
      isNearPoint : isNearPoint
    }
  }
  
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function setup() {
  createCanvas(6*mult+wst+2*constOffest+40, 6*mult+wst+2*constOffest);
  const myline1 = new MyLine(0,0,3,0);
  myline1.sticky = true;
  const myline2 = new MyLine(0,0,0,3);
  myline2.sticky = true;


  mylines1 = new MyLines();
  mylines1.mymemory.add(myline1);
  mylines1.mymemory.add(myline2);

  buttonClear = createButton('Clear');
  buttonClear.position(constOffest*1, 6*mult+2*constOffest-12);
  buttonClear.mousePressed(ButtonClearBackground);
  buttonMove = createButton('Move');
  buttonMove.position(constOffest*3+9, 6*mult+2*constOffest-12);
  buttonMove.mousePressed();
  buttonRandom = createButton('Random');
  buttonRandom.position(constOffest*6, 6*mult+2*constOffest-12);
  buttonRandom.mousePressed();
  buttonDraw = createButton('Draw');
  buttonDraw.position(constOffest*9+8, 6*mult+2*constOffest-12);
  buttonDraw.mousePressed();
  //noLoop();
}

function draw() {
  background(256);
  //mylines1.addrandom();
  mylines1.drawMe(true, true);
  mylines1.addAndSaveLines();
  //mylines1.mirror_objects()
  mylines1.hover();
}

function mouseReleased() {
  let {x1, y1, x2, y2} = mylines1.targetCoords
  let {retX, retY, isNearPoint} = mylines1.getCursorGridPos(0.25)
  if (
    mylines1.isOnTarget &&
    isNearPoint &&
    mylines1.getGridCoord(retX)===x2 &&
    mylines1.getGridCoord(retY)===y2){
    const mynewline = new MyLine(x1,y1,x2,y2);
    mylines1.mymemory.add(mynewline);
  }
}

function mousePressed() {
  // In conjunction with noloop: loop();
  //Long Version: let {coarseX: coarseX,
  // fineX: fineX, coarseY: coarseY, fineY: fineY} = getCursorGridPos()
  let {retX, retY, isNearPoint} = mylines1.getCursorGridPos()
  if(isNearPoint === true){
    mylines1.snapv.x = mylines1.getGridCoord(retX);
    mylines1.snapv.y = mylines1.getGridCoord(retY);
  }
}

function ButtonClearBackground(){
  mylines1.clear();
}