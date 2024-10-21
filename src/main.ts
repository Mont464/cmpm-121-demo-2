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

let mouseX = 0;
let mouseY = 0;
let mouseActive = false;

const lineStore : Array<Array<Array<number>>> = [];
let workingLine : Array<Array<number>>;

const redoStore : Array<Array<Array<number>>> = [];

const changeDraw = new Event("drawing-changed");

canvas.addEventListener("drawing-changed", () => {
    canvCont?.clearRect(0, 0, canvas.width, canvas.height);
    for (const line of lineStore) {
        canvCont?.beginPath();
        canvCont?.moveTo(line[0][0], line[0][1]); //get to line start
        for(const point of line) {
            canvCont?.lineTo(point[0], point[1]);
        }
        canvCont?.stroke();
    }
});

canvas.addEventListener("mousedown", (ev) => {
    mouseX = ev.offsetX;
    mouseY = ev.offsetY;
    mouseActive = true;
    workingLine = [];
    lineStore.push(workingLine);



    workingLine.push([mouseX, mouseY]);
    canvas.dispatchEvent(changeDraw);
});

canvas.addEventListener("mousemove", (ev) => {
    if (mouseActive) {
        mouseX = ev.offsetX;
        mouseY = ev.offsetY;

        workingLine.push([mouseX, mouseY]);
        canvas.dispatchEvent(changeDraw);
    }
});

canvas.addEventListener("mouseup", () => {
    mouseX = 0;
    mouseY = 0;
    mouseActive = false;

    workingLine = [];
    canvas.dispatchEvent(changeDraw);
});



const cButton = document.createElement("button");
cButton.innerHTML = "Clear Drawing";
app.append(cButton);

cButton.onclick = () => {
    canvCont?.clearRect(0, 0, canvas.width, canvas.height);
    lineStore.splice(0, lineStore.length);
    redoStore.splice(0, redoStore.length);
};

const uButton = document.createElement("button");
uButton.innerHTML = "Undo Line";
app.append(uButton);

uButton.onclick = () => {
    const toRedo = lineStore.pop();
    if(toRedo != undefined) {
        redoStore.push(toRedo);
    }
    console.log(redoStore);
    canvas.dispatchEvent(changeDraw);
};

const rButton = document.createElement("button");
rButton.innerHTML = "Redo Line";
app.append(rButton);

rButton.onclick = () => {
    const toLines = redoStore.pop();
    if(toLines != undefined) {
        lineStore.push(toLines);
    }

    canvas.dispatchEvent(changeDraw);
};
