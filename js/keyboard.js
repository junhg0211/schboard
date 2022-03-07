let keys = [];

let previousKeys = [],
    startKeys = [],
    endKeys = [];

function keydown(event) {
    keys.push(event.code);
}

function keyup(event) {
    let index = keys.indexOf(event.code);
    while (index !== -1) {
        if (index !== -1) {
            keys.splice(index, 1);
        }
        index = keys.indexOf(event.code);
    }
}

function keyboardTick() {
    startKeys = [];
    endKeys = [];
    keys.forEach(key => {
        if (previousKeys.indexOf(key) === -1) {
            startKeys.push(key);
        }
    });
    previousKeys.forEach(key => {
        if (keys.indexOf(key) === -1) {
            endKeys.push(key);
        }
    });

    previousKeys = [...keys];
}

function isKey(keyCode) {
    return keys.indexOf(keyCode) !== -1;
}

function isStartKey(keyCode) {
    return startKeys.indexOf(keyCode) !== -1;
}

function isEndKey(keyCode) {
    return endKeys.indexOf(keyCode) !== -1;
}

window.addEventListener("keydown", keydown);
window.addEventListener("keyup", keyup);