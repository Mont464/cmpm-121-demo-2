import "./style.css";

const APP_NAME = "Draw-O-Matic";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

const header = document.createElement("h1");
header.innerHTML = APP_NAME;
app.append(header);

const canvas = document.createElement("canvas");
const canvCont = canvas.getContext("2d");
app.append(canvas);
canvas.width = 256;
canvas.height = 256;

let mouseX = 0;
let mouseY = 0;
let mouseActive = false;

interface CurrentContent {
  display(ctx: CanvasRenderingContext2D): void;
}

class DisplayList implements CurrentContent {
  lineStore: Array<Array<Array<number>>>;
  workingLine: Array<Array<number>>;

  constructor() {
    this.lineStore = [];
    this.workingLine = [];
  }

  display(canvCont: CanvasRenderingContext2D): void {
    canvCont?.clearRect(0, 0, canvas.width, canvas.height);
    for (const line of this.lineStore) {
      canvCont?.beginPath();
      canvCont?.moveTo(line[0][0], line[0][1]); //get to line start
      for (const point of line) {
        canvCont?.lineTo(point[0], point[1]);
      }
      canvCont?.stroke();
    }
  }

  moveLine(x: number, y: number) {
    this.workingLine.push([x, y]);
  }

  setLine(l: Array<Array<number>>) {
    this.workingLine = l;
  }

  addLine() {
    this.lineStore.push(this.workingLine);
  }

  removeLine() {
    return this.lineStore.pop();
  }

  clearStore() {
    this.lineStore = [];
  }

  clearLine() {
    this.workingLine = [];
  }
}

const lines: DisplayList = new DisplayList();
const redo: DisplayList = new DisplayList();

const changeDraw = new Event("drawing-changed");

canvas.addEventListener("drawing-changed", () => {
  if (canvCont != null) {
    lines.display(canvCont);
  }
});

canvas.addEventListener("mousedown", (ev) => {
  mouseX = ev.offsetX;
  mouseY = ev.offsetY;
  mouseActive = true;
  lines.clearLine();
  lines.addLine();

  lines.moveLine(mouseX, mouseY);
  canvas.dispatchEvent(changeDraw);
});

canvas.addEventListener("mousemove", (ev) => {
  if (mouseActive) {
    mouseX = ev.offsetX;
    mouseY = ev.offsetY;

    lines.moveLine(mouseX, mouseY);
    canvas.dispatchEvent(changeDraw);
  }
});

canvas.addEventListener("mouseup", () => {
  mouseX = 0;
  mouseY = 0;
  mouseActive = false;

  lines.clearLine();
  canvas.dispatchEvent(changeDraw);
});

const cButton = document.createElement("button");
cButton.innerHTML = "Clear Drawing";
app.append(cButton);

cButton.onclick = () => {
  canvCont?.clearRect(0, 0, canvas.width, canvas.height);
  lines.clearStore();
  redo.clearStore();
};

const uButton = document.createElement("button");
uButton.innerHTML = "Undo Line";
app.append(uButton);

uButton.onclick = () => {
  const toRedo = lines.removeLine();
  if (toRedo != undefined) {
    redo.setLine(toRedo);
    redo.addLine();
  }
  canvas.dispatchEvent(changeDraw);
};

const rButton = document.createElement("button");
rButton.innerHTML = "Redo Line";
app.append(rButton);

rButton.onclick = () => {
  const toLines = redo.removeLine();
  if (toLines != undefined) {
    lines.setLine(toLines);
    lines.addLine();
  }

  canvas.dispatchEvent(changeDraw);
};
