let mouseX, mouseY;
let previousX, previousY;
let mouseDeltaX, mouseDeltaY;

let leftPressed = false,
    wheelPressed = false,
    rightPressed = false;
let previousLeft = false,
    previousWheel = false,
    previousRight = false;
let leftStart = false,
    wheelStart = false,
    rightStart = false;
let leftEnd = false,
    wheelEnd = false,
    rightEnd = false;


function mousemove(event) {
    mouseX = event.clientX - sidebar.offsetWidth;
    mouseY = event.clientY;
}

function mousedown(event) {
    if (event.button === 0) {
        leftPressed = true;
    } else if (event.button === 1) {
        wheelPressed = true;
    } else if (event.button === 2) {
        rightPressed = true;
    }
}

function mouseup(event) {
    if (event.button === 0) {
        leftPressed = false;
    } else if (event.button === 1) {
        wheelPressed = false;
    } else if (event.button === 2) {
        rightPressed = false;
    }
}


function mousewheel(event) {
    camera.setZoom(camera.zoom - event.deltaY / 1000);
}

function mouseTick() {
    leftStart = previousLeft && leftPressed;
    wheelStart = !previousWheel && wheelPressed;
    rightStart = !previousRight && rightPressed;

    leftEnd = previousLeft && !leftPressed;
    wheelEnd = previousWheel && !wheelPressed;
    rightEnd = previousRight && !rightPressed;

    mouseDeltaX = mouseX - previousX;
    mouseDeltaY = mouseY - previousY;

    previousLeft = leftPressed;
    previousWheel = wheelPressed;
    previousRight = rightPressed;

    previousX = mouseX;
    previousY = mouseY;

    if (leftEnd) {
        if (selectedPart) {
            selectedPart.inGrid();
        }
        selectedPart = null;
    }
}


window.addEventListener("mousemove", mousemove);
window.addEventListener("mousedown", mousedown);
window.addEventListener("mouseup", mouseup);
window.addEventListener("mousewheel", mousewheel)
window.addEventListener("contextmenu", (event) => event.preventDefault());