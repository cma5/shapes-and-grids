//global variables
let mult = 100;
let wst = 1;
let wstOffset = Math.floor(wst/2);
let constOffset = 20;
let mylines1;
let myflag = 0;


//buttons
let buttonClear;
let buttonRandom;
let buttonSpace = 200;

//checkboxes
let gridCheckbox;
let frameCheckbox;

class MyLine {
  constructor(x1, y1, x2, y2, strokecol = 70, ah = 3, av = 3){
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.strokew = wst;
    this.strokecol = strokecol;
    this.mirroraxis_h = ah*2;
    this.mirroraxis_v = av*2;
    this.sticky = false;
    this.selected = false;
  }

  getcoord(val){
    return (val*mult)+wstOffset+constOffset
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
    if (this.selected){
      ellipse(this.getcoord(this.x1), this.getcoord(this.y1), 10, 10);
      ellipse(this.getcoord(this.x2), this.getcoord(this.y2), 10, 10);
      textSize(16);
      text('1', this.getcoord(this.x1)-4, this.getcoord(this.y1)-12);
      text('2', this.getcoord(this.x2)-4, this.getcoord(this.y2)-12);
    }
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
    this.mymemories = {};
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
    this.cDim = 3;
    this.selectPoint = {isactive: false, line: new MyLine, is2 : false};
    this.prevSelectLine = new MyLine;
    this.cursorval = '';
    this.hoverstate = false;
    this.isDragable = false;
  }

  getCanvasCoord(val){
    return (val*mult)+wstOffset+constOffset
  }

  getGridCoord(val){
    let result = ((val-wstOffset-constOffset)/mult)
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
    value.y1 = this.cDim*2-value.y1;
    value.y2 = this.cDim*2-value.y2;
    return value
  }
  
  mirrordfuncV(value){
    value.x1 = this.cDim*2-value.x1;
    value.x2 = this.cDim*2-value.x2;
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
    //Currently not working because the lines are now drawn from this.mymemories
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

  hover(){
    if (this.hoverstate === false){
      let {retX, retY, isNearPoint} = this.getCursorGridPos();
      
      if(
        this.getGridCoord(retX) === this.selectPoint.line.x1 &&
        this.getGridCoord(retY) === this.selectPoint.line.y1
      ){
        cursor('grab');
        this.selectPoint.isactive = true;
        this.selectPoint.is2 = false;
      }
      else if(
        this.getGridCoord(retX) === this.selectPoint.line.x2 &&
        this.getGridCoord(retY) === this.selectPoint.line.y2
      ){
        this.selectPoint.is2 = true;
        cursor('grab');
        this.selectPoint.isactive = true;
      }
      else if(
        this.selectPoint.line &&
        this.isOverLine(this.selectPoint.line)
      ){
        cursor('grab');
      }
      else {
        cursor();
        this.selectPoint.isactive = false;
      } 
    }
    else {
      cursor('grabbing');
    }
  }

  selectLine(retX, retY, lineselect = true){
    let count = 0;
    let selectionBuffer = [];
    this.mymemories.lines.forEach(element => {
      if (lineselect){
        if(
          this.isOverLine(element) ||
          (this.getGridCoord(retX) === element.x1 && this.getGridCoord(retY) === element.y1) ||
          (this.getGridCoord(retX) === element.x2 && this.getGridCoord(retY) === element.y2)
        ){

          count += 1;
          selectionBuffer.push(element);

        }
        else {
          element.selected = false;
        }
      }
    }
    );
    console.log(count)
    if(count === 0){
      this.selectPoint.line = 0;
    }
    else if (count === 1){
      this.selectPoint.line = selectionBuffer[0];
      this.selectPoint.line.selected = true;
      this.prevSelectLine = this.selectPoint.line;
    }
    else {
      selectionBuffer.forEach(element => {
        if (element === this.prevSelectLine){
          this.selectPoint.line = element;
          this.selectPoint.line.selected = true;
          element.selected = true;
          console.log("Hello");
        }
        else{
          this.selectPoint.line = selectionBuffer[0];
          this.selectPoint.line.selected = true;
        }
      })
    }

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
      this.mymemories.lines.add(
        new MyLine(
          getRandomInt(4),
          getRandomInt(4),
          getRandomInt(4),
          getRandomInt(4)
        )
      );
    }
  }

  drawLines(){
    if(this.snapv.x != -1 && this.snapv.x <=3 && this.snapv.y <=3){
      let {retX, retY, isNearPoint} = this.getCursorGridPos(0.15);
      let canvLim = this.getCanvasCoord(2*this.cDim)+constOffset;
      this.isOnTarget = isNearPoint
      this.targetCoords = {
        x1 : this.snapv.x,
        y1 : this.snapv.y,
        x2 : this.getGridCoord(retX),
        y2 : this.getGridCoord(retY)
      }
      if(this.isDragable){
        if(!this.selectPoint.is2){
          line(
            retX,
            retY,
            this.getCanvasCoord(this.selectPoint.line.x2),
            this.getCanvasCoord(this.selectPoint.line.y2)
          )
        }
        else{
          line(
          retX,
          retY,
          this.getCanvasCoord(this.selectPoint.line.x1),
          this.getCanvasCoord(this.selectPoint.line.y1)
          )
        }
      }
      else{
        line(
          this.getCanvasCoord(this.snapv.x),
          this.getCanvasCoord(this.snapv.y),
          retX,
          retY
        );
        line(
          this.getCanvasCoord(this.snapv.x),
          canvLim - this.getCanvasCoord(this.snapv.y),
          retX,
          canvLim - retY
        );
        line(
          canvLim - this.getCanvasCoord(this.snapv.x),
          this.getCanvasCoord(this.snapv.y),
          canvLim - retX,
          retY
        );
        line(
          canvLim - this.getCanvasCoord(this.snapv.x),
          canvLim - this.getCanvasCoord(this.snapv.y),
          canvLim - retX,
          canvLim - retY);
      }

      if (
          //keyIsPressed === true &&
          //keyCode === ESCAPE
          !mouseIsPressed
          ) {
        this.snapv.x = -1;
      }
    }
  }
  
  printMe(mirrorh, mirrorv){   
    this.mirrorh = mirrorh
    this.mirrorv = mirrorv
    //this.myresult.forEach(this.drawFunc, this);
    for (const i in this.mymemories) {
      //console.log(i);
      if (
        (i === "myGrid" && !gridCheckbox.checked()) ||
        (i === "frame" && !frameCheckbox.checked())
      ){}
      else {
        this.mymemories[i].forEach(this.drawFunc, this);
      }
    }
    //this.mymemories.lines.forEach(this.drawFunc, this);
    //this.mymemories.myGrid.forEach(this.drawFunc, this);
    //this.mymemories.frame.forEach(this.drawFunc, this);
  }

  clear(deleteselected = false){
    if (deleteselected === true){
      this.mymemories.lines.forEach((aline) => {
        if (aline.selected === true) 
          {
            this.mymemories.lines.delete(aline);
        }
      });
    }
    else {
      this.mymemories.lines.forEach((aline) => {
        if (aline.sticky === false) 
          {
            this.mymemories.lines.delete(aline);
        }
      });
    }
    
    //this.myresult = this.mymemory;
  }

  getCursorGridPos(threshold = 0.10, mirrorLine = 3) {
    let coarseX = Math.floor((mouseX-wstOffset-constOffset)/mult+0.5);
    let coarseY = Math.floor((mouseY-wstOffset-constOffset)/mult+0.5);
    let fineX = abs(((mouseX-wstOffset-constOffset)/mult)-coarseX);
    let fineY = abs(((mouseY-wstOffset-constOffset)/mult)-coarseY);
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

  drawGrid(mysize=0.05, mycolor = 190) {
    let tempset = new Set();
    for (let indeY = 0; indeY < this.cDim*2+1; indeY++) {
      for (let indeX = 0; indeX < this.cDim*2+1; indeX++) {
        //rect(mylines1.getCanvasCoord(indeX), mylines1.getCanvasCoord(indeY), 20,20)
        if (indeX === 0 && indeY === 0){
          
        }
        else if (indeX === 0 && indeY !== 0){
          let gridline = new MyLine(indeX, indeY, indeX+mysize, indeY, mycolor);
          gridline.sticky = true;
          tempset.add(gridline);
        }
        else if (indeX !== 0 && indeY === 0){
          let gridline = new MyLine(indeX, indeY, indeX, indeY+mysize, mycolor);
          gridline.sticky = true;
          tempset.add(gridline);
        }
        else if (indeX === this.cDim*2 && indeY !== 0){
          let gridline = new MyLine(indeX, indeY, indeX, indeY-mysize, mycolor);
          gridline.sticky = true;
          tempset.add(gridline);
        }
        else if (indeX !== 0 && indeY === this.cDim*2){
          let gridline = new MyLine(new MyLine(indeX, indeY, indeX-mysize, indeY, mycolor));
          gridline.sticky = true;
          tempset.add(gridline);
        }
        else {
          let gridline1 = new MyLine(indeX-mysize, indeY, indeX+mysize, indeY, mycolor);
          gridline1.sticky = true;
          tempset.add(gridline1);
          let gridline2 = new MyLine(indeX, indeY-mysize, indeX, indeY+mysize, mycolor);
          gridline2.sticky = true;
          tempset.add(gridline2);
        }
      }
    }
    this.mymemories.myGrid = tempset;
  }

  drawFrame(){
    this.mymemories.frame = new Set();
    this.mymemories.frame.add(new MyLine(0,0,3,0))
    this.mymemories.frame.add(new MyLine(0,0,0,3))
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function setup() {
  createCanvas(6*mult+wst+2*constOffset, 6*mult+wst+2*constOffset+buttonSpace);

  //init MyLines
  mylines1 = new MyLines();
  mylines1.mymemories.lines = new Set(); //eigentlich in Konstruktor schreiben!
  mylines1.drawGrid();
  mylines1.drawFrame();

  //buttons
  buttonClear = createButton('Clear');
  buttonClear.position(constOffset*1, 6*mult+2*constOffset-12);
  buttonClear.mousePressed(ButtonClearBackground);
  buttonRandom = createButton('Random');
  buttonRandom.position(constOffset*3+9, 6*mult+2*constOffset-12);
  buttonRandom.mousePressed(buttonRandomFunc);

  //checkboxes
  gridCheckbox = createCheckbox("Grid", true)
  gridCheckbox.position(constOffset -4, 6*mult+2*constOffset +15)
  frameCheckbox = createCheckbox("Frame", true)
  frameCheckbox.position(constOffset*4 -10, 6*mult+2*constOffset +15)
}

function draw() {
  background(256);
  //mylines1.addrandom();
  mylines1.printMe(true, true);
  mylines1.drawLines();
  mylines1.hover();
  let {retX, retY, isNearPoint} = mylines1.getCursorGridPos()
  //console.log(mylines1.cursorval);
  textSize(14);
  text(
`Hoverstate:\t\t\t\t\t\t\t\t\t${mylines1.hoverstate}
isDragable:\t\t\t\t\t\t\t\t\t${mylines1.isDragable}
Selectionpoint active:\t${mylines1.selectPoint.isactive}
Selectionpoint is2: \t\t\t${mylines1.selectPoint.is2}
Is on target: \t\t\t\t\t\t\t\t${mylines1.isOnTarget}
Cursor grid positions:\tx: ${retX}, y: ${retY}`,
20,
690
);
  //mylines1.mirror_objects()
}

function mousePressed() {
  //Long Version: let {coarseX: coarseX,
  // fineX: fineX, coarseY: coarseY, fineY: fineY} = getCursorGridPos()
  let {retX, retY, isNearPoint} = mylines1.getCursorGridPos()
  mylines1.selectLine(retX, retY);
  if(isNearPoint === true){
    if(mylines1.selectPoint.isactive){
      mylines1.hoverstate = true;
      mylines1.isDragable = true;
    }
    mylines1.snapv.x = mylines1.getGridCoord(retX);
    mylines1.snapv.y = mylines1.getGridCoord(retY);
    
  }
  
}

function mouseReleased() {
  let {x1, y1, x2, y2} = mylines1.targetCoords
  let {retX, retY, isNearPoint} = mylines1.getCursorGridPos(0.15)
  if (
    mylines1.isOnTarget &&
    isNearPoint &&
    mylines1.getGridCoord(retX)===x2 &&
    mylines1.getGridCoord(retY)===y2 &&
    !(x1 === x2 && y1 === y2))//prevent single point lines
    { 
      if(mylines1.isDragable){
        if (!mylines1.selectPoint.is2){
          mylines1.selectPoint.line.x1 = x2;
          mylines1.selectPoint.line.y1 = y2;
        }
        else{
          mylines1.selectPoint.line.x2 = x2;
          mylines1.selectPoint.line.y2 = y2;
        } 
      }
      else{
        const mynewline = new MyLine(x1,y1,x2,y2);
        mylines1.mymemories.lines.add(mynewline);
      }
    
  }
  mylines1.hoverstate = false; //for the grabbing animation of the cursor
  mylines1.isDragable = false;

}

function mouseMoved() {
  return false
}

function ButtonClearBackground(){
  mylines1.clear();
}

function buttonRandomFunc(){
  mylines1.addRandom()
}

function keyPressed() {
  if (keyCode === DELETE) {
    mylines1.clear(true);
  }
}