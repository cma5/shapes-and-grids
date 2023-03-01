let mult = 100;
let wst = 1;
let wstOffset = Math.floor(wst/2);
let constOffest = 20;
let mylines1, mylines2;
let indicatorline
let myflag = 0;


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
  }

  getcoord(val){
    return (val*mult)+wstOffset+constOffest
  }

  cpobj(value){
    //return Object.assign({}, value);
    return value.clone()
  }
  
  mirrordfunc_h(value){
    value.y1 = 6-value.y1;
    value.y2 = 6-value.y2;
    return value
  }
  
  mirrordfunc_v(value){
    value.x1 = 6-value.x1;
    value.x2 = 6-value.x2;
    return value
  }
  
  drawfunc(value){
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
  
  mirror_objects(input = Array.from(this.mymemory)){
    if (input.length*4 !== this.myresult.length || myflag === 1) {
      this.myresult = input.map(this.cpobj);
      this.mytempmem = input.map(this.cpobj);
      this.myresult.map(this.mirrordfunc_h);
      this.myresult = this.myresult.concat(this.mytempmem);
      this.mytempmem = this.myresult.map(this.cpobj)
      this.mytempmem.map(this.mirrordfunc_v);
      this.myresult = this.myresult.concat(this.mytempmem);
      console.log(input.length);
      //console.log(this.mytempmem.length);
      //console.log(this.myresult.length);
      myflag = 0;
    }
  }

  hoverhighlight(){
    this.myresult.forEach(element => {
      if(this.isoverline(element)){
        element.strokew = 20;
      }
      else {
        element.strokew = wst;
      }
    });
  }


  isoverline(aline){
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

  addrandom(){
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

  addandsavelines(){
    if(this.snapv.x != -1 && this.snapv.x <=3 && this.snapv.y <=3){
      line(this.getcoord(this.snapv.x), this.getcoord(this.snapv.y), mouseX, mouseY)
      if (
          //keyIsPressed === true &&
          //keyCode === ESCAPE
          !mouseIsPressed
          ) {
        this.snapv.x = -1;
      }
    }
  }
  
  drawme(mirrorh, mirrorv){   
    //this.hoverhighlight()
    this.mirrorh = mirrorh
    this.mirrorv = mirrorv
    this.myresult.forEach(this.drawfunc, this);
  }
  
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function setup() {
  createCanvas(6*mult+wst+2*constOffest+40, 6*mult+wst+2*constOffest);
  const myline1 = new MyLine(0,0,3,0);
  const myline2 = new MyLine(0,0,0,3);
  mylines1 = new MyLines();
  mylines1.mymemory.add(myline1);
  mylines1.mymemory.add(myline2);

}

function draw() {
  background(256);
  //mylines1.addrandom();
  mylines1.drawme(true, true);
  mylines1.addandsavelines();
  //mylines1.mirror_objects()
  //mylines1.hoverhighlight();
}

function mouseReleased() {
  console.log("Mouse is released");
}

function getCursorGridPos() {
  let coarseXvar = Math.floor((mouseX-wstOffset-constOffest)/mult+0.5);
  let coarseYvar = Math.floor((mouseY-wstOffset-constOffest)/mult+0.5);
  return {
    coarseX: coarseXvar,
    fineX: abs(((mouseX-wstOffset-constOffest)/mult)-coarseXvar),
    coarseY: coarseYvar,
    fineY: abs(((mouseY-wstOffset-constOffest)/mult)-coarseYvar)
  }
}

function mousePressed() {
  //Long Version: let {coarseX: coarseX, fineX: fineX, coarseY: coarseY, fineY: fineY} = getCursorGridPos()
  let {coarseX, fineX, coarseY, fineY} = getCursorGridPos()

  if (
      fineX < 0.1 &&
      fineY < 0.1 &&
      coarseX <=3 &&
      coarseY <=3)
    {
      mylines1.snapv.x = coarseX;
      mylines1.snapv.y = coarseY;
      console.log(mylines1.snapv)
    }

}