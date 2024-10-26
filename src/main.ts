import "./style.css";

const APP_NAME = "Draw-O-Matic";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

const header = document.createElement("h1");
header.innerHTML = APP_NAME;
app.append(header);

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d")!;
app.append(canvas);
canvas.width = 256;
canvas.height = 256;

let mouseX = 0;
let mouseY = 0;
let mouseActive = false;

interface Displayable {
  display(ctx: CanvasRenderingContext2D): void;
}

interface Point {
  x: number;
  y: number;
}

type Line = {points: Array<Point>, thickness: number};

let lineThickness: number = 2;
let workingLine: Line = {points: [], thickness: lineThickness};

class LineDisplayble implements Displayable {
  constructor(readonly line: Line) {}
  display(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = this.line.thickness;
    ctx.beginPath();
    ctx.moveTo(this.line.points[0].x, this.line.points[0].y); //get to line start
    for (const { x, y } of this.line.points) {
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

let displayList: Array<Displayable> = [];
let redoDisplayList: Array<Displayable> = [];

const changeDraw = new Event("drawing-changed");

canvas.addEventListener("drawing-changed", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (const d of displayList) {
    d.display(context);
  }
});

canvas.addEventListener("mousedown", (ev) => {
  mouseX = ev.offsetX;
  mouseY = ev.offsetY;
  mouseActive = true;
  workingLine = {points: [], thickness: lineThickness};
  displayList.push(new LineDisplayble(workingLine));

  workingLine.points.push({ x: mouseX, y: mouseY });
  canvas.dispatchEvent(changeDraw);
});

canvas.addEventListener("mousemove", (ev) => {
  if (mouseActive) {
    mouseX = ev.offsetX;
    mouseY = ev.offsetY;

    workingLine.points.push({ x: mouseX, y: mouseY });
    canvas.dispatchEvent(changeDraw);
  }
});

canvas.addEventListener("mouseup", () => {
  mouseX = 0;
  mouseY = 0;
  mouseActive = false;

  canvas.dispatchEvent(changeDraw);
});

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear Drawing";
app.append(clearButton);

clearButton.onclick = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  displayList = [];
  redoDisplayList = [];
};

const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo Line";
app.append(undoButton);

undoButton.onclick = () => {
  const toRedo = displayList.pop();
  if (toRedo != undefined) {
    redoDisplayList.push(toRedo);
  }
  canvas.dispatchEvent(changeDraw);
};

const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo Line";
app.append(redoButton);

redoButton.onclick = () => {
  const toDisplay = redoDisplayList.pop();
  if (toDisplay != undefined) {
    displayList.push(toDisplay);
  }

  canvas.dispatchEvent(changeDraw);
};

const thinButton = document.createElement("button");
thinButton.innerHTML = "Thin Line";
app.append(thinButton);

thinButton.onclick = () => {
  lineThickness = 2;
};

const thickButton = document.createElement("button");
thickButton.innerHTML = "Thick Line";
app.append(thickButton);

thickButton.onclick = () => {
  lineThickness = 5;
};