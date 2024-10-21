import "./style.css";

const APP_NAME = "Draw-O-Matic";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

const header = document.createElement("h1");
header.innerHTML = APP_NAME;
app.append(header);

const canvas = document.createElement("canvas");
app.append(canvas);

const canvCont = canvas.getContext("2d");

let mouseX = 0;
let mouseY = 0;
let mouseActive = false;

canvas.addEventListener("mousedown", (ev) => {
    mouseX = ev.offsetX;
    mouseY = ev.offsetY;
    mouseActive = true;
});

canvas.addEventListener("mousemove", (ev) => {
    if (mouseActive) {
        canvCont?.beginPath();
        canvCont?.moveTo(mouseX, mouseY);
        canvCont?.lineTo(ev.offsetX, ev.offsetY);
        canvCont?.stroke();
        canvCont?.closePath();
        mouseX = ev.offsetX;
        mouseY = ev.offsetY;
    }
});

canvas.addEventListener("mouseup", () => {
    mouseX = 0;
    mouseY = 0;
    mouseActive = false;
});



const cButton = document.createElement("button");
cButton.innerHTML = "Clear Drawing";
app.append(cButton);

cButton.onclick = () => {
    canvCont?.clearRect(0, 0, canvas.width, canvas.height);
};
