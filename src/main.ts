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
canvas.style.cursor = "none";

context.font = "30px serif";

interface Displayable {
  display(ctx: CanvasRenderingContext2D): void;
}

interface Point {
  x: number;
  y: number;
}

type Line = { points: Array<Point>; thickness: number, hue: number };

let lineThickness: number = 2;
let workingLine: Line = { points: [], thickness: lineThickness, hue: 0};

class LineDisplayble implements Displayable {
  constructor(readonly line: Line) {}
  display(ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = this.line.thickness;
    ctx.beginPath();
    ctx.moveTo(this.line.points[0].x, this.line.points[0].y); //get to line start
    for (const { x, y } of this.line.points) {
      ctx.lineTo(x, y);
    }

    ctx.strokeStyle = `hsl(${this.line.hue}, 100%, 50%)`;
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

interface Sticker {
  x: number;
  y: number;
  emoji: string;
}

class stickerDisplayable implements Displayable {
  constructor(readonly sticker: Sticker | null) {}
  display(ctx: CanvasRenderingContext2D): void {
    if (this.sticker != null) {
      ctx.fillText(this.sticker.emoji, this.sticker.x, this.sticker.y);
    }
  }
}

let currentSticker: stickerDisplayable = new stickerDisplayable(null)!;

interface Mouse {
  x: number;
  y: number;
  hue: number;
  active: boolean;
  sticker: Sticker | null;
}

class mouseDisplayable implements Displayable {
  constructor(readonly mouse: Mouse) {}
  display(ctx: CanvasRenderingContext2D): void {
    if (!this.mouse.active) {
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (this.mouse.sticker == null) {
        ctx.arc(
          this.mouse.x,
          this.mouse.y,
          lineThickness,
          0,
          2 * Math.PI,
          false
        );
        ctx.fillStyle = `hsl(${this.mouse.hue}, 100%, 50%)`;
        ctx.fill();
      } else {
        ctx.fillText(this.mouse.sticker.emoji, this.mouse.x, this.mouse.y);
      }
    }
  }
}

let mouseObject: mouseDisplayable = new mouseDisplayable({
  x: 0,
  y: 0,
  hue: 0,
  active: false,
  sticker: null,
});

const movedTool = new Event("tool-moved");

canvas.addEventListener("tool-moved", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (const d of displayList) {
    d.display(context);
  }
  mouseObject.display(context);
  currentSticker.display(context);
});

canvas.addEventListener("mousedown", (ev) => {
  mouseObject = new mouseDisplayable({
    x: ev.offsetX,
    y: ev.offsetY,
    hue: mouseObject.mouse.hue,
    active: true,
    sticker: currentSticker.sticker,
  });
  if (currentSticker.sticker == null) {
    workingLine = { points: [], thickness: lineThickness, hue: mouseObject.mouse.hue };
    displayList.push(new LineDisplayble(workingLine));

    workingLine.points.push({ x: mouseObject.mouse.x, y: mouseObject.mouse.y });
  } else {
    currentSticker.sticker.x = ev.offsetX;
    currentSticker.sticker.y = ev.offsetY;
  }
  canvas.dispatchEvent(changeDraw);
  canvas.dispatchEvent(movedTool);
});

canvas.addEventListener("mousemove", (ev) => {
  mouseObject = new mouseDisplayable({
    x: ev.offsetX,
    y: ev.offsetY,
    hue: mouseObject.mouse.hue,
    active: mouseObject.mouse.active,
    sticker: currentSticker.sticker,
  });
  if (mouseObject?.mouse.active) {
    if (currentSticker.sticker == null) {
      workingLine.points.push({
        x: mouseObject.mouse.x,
        y: mouseObject.mouse.y,
      });
      canvas.dispatchEvent(changeDraw);
    } else {
      currentSticker.sticker.x = ev.offsetX;
      currentSticker.sticker.y = ev.offsetY;
    }
  }
  canvas.dispatchEvent(movedTool);
});

canvas.addEventListener("mouseup", (ev) => {
  mouseObject = new mouseDisplayable({
    x: ev.offsetX,
    y: ev.offsetY,
    hue: mouseObject.mouse.hue,
    active: false,
    sticker: currentSticker.sticker,
  });
  if (currentSticker.sticker != null) {
    currentSticker.sticker.x = ev.offsetX;
    currentSticker.sticker.y = ev.offsetY;
    displayList.push(currentSticker);
  }
  canvas.dispatchEvent(changeDraw);
  canvas.dispatchEvent(movedTool);
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
undoButton.innerHTML = "Undo";
app.append(undoButton);

undoButton.onclick = () => {
  const toRedo = displayList.pop();
  if (toRedo != undefined) {
    redoDisplayList.push(toRedo);
  }
  canvas.dispatchEvent(changeDraw);
};

const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
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
  mouseObject.mouse.sticker = null;
  currentSticker = new stickerDisplayable(null);
  lineThickness = 2;
};

const thickButton = document.createElement("button");
thickButton.innerHTML = "Thick Line";
app.append(thickButton);

thickButton.onclick = () => {
  mouseObject.mouse.sticker = null;
  currentSticker = new stickerDisplayable(null);
  lineThickness = 5;
};

let stickerNumber = 1;
function makeStickerButton(emoji: string): void {
  const emojiButton = document.createElement("button");
  emojiButton.innerHTML = "Emoji Sticker " + stickerNumber + ": " + emoji;
  app.append(emojiButton);
  stickerNumber++;

  emojiButton.onclick = () => {
    currentSticker = new stickerDisplayable({
      x: currentSticker.sticker?.x!,
      y: currentSticker.sticker?.y!,
      emoji: emoji,
    });
  };
}

makeStickerButton("🤡");
makeStickerButton("😭");
makeStickerButton("🤩");

const customStickerButton = document.createElement("button");
customStickerButton.innerHTML = "Create a Custom Sticker";
app.append(customStickerButton);

customStickerButton.onclick = () => {
  const newEmoji = prompt("Enter New Emoji Sticker Here:", "🤨");
  if (newEmoji != null) {
    makeStickerButton(newEmoji);
  }
};

//Was able to talk through with Brace how to make this code
const exportButton = document.createElement("button");
exportButton.innerHTML = "Export Drawing";
app.append(exportButton);

exportButton.onclick = () => {
  const exportCanvas = document.createElement("canvas");
  const exportContext = exportCanvas.getContext("2d")!;
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  

  exportContext.scale(4, 4);

  for (const d of displayList) {
    d.display(exportContext);
  }

  const imageData = exportCanvas.toDataURL("image/png");

  const downloadLink = document.createElement("a");
  downloadLink.href = imageData;
  downloadLink.download = `${APP_NAME}.png`;
  downloadLink.click();
};

const randomHueButton = document.createElement("button");
randomHueButton.innerHTML = "Randomize Line Hue";
app.append(randomHueButton);

randomHueButton.onclick = () => {
  const newHue = Math.floor(Math.random() * 360);
  mouseObject.mouse.hue = newHue;
  randomHueButton.style.borderColor = `hsl(${newHue}, 100%, 50%)`;
};

