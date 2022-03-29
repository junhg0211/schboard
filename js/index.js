let objectManager = new ObjectManager();

let camera = new Camera(0, 0);

let enableAnd = false,
    enableXor = false,
    enableDiode = false,
    enableGND = false;

let notWires = false;

let socketHighlighter = new SocketHighlighter();
let selectedSocketHighlighter = new SocketHighlighter(0, 0, GREEN);
let wireHint = new Line(camera, 0, 0, 0, 0, YELLOW)
let cross = new Cross(camera, 0, 0);

objectManager.add(cross);

let selectedPart,
    selectedSocket,
    closestSocket;
let loadedComponents = [];
let lastRawComponent = "";


function addPart(partString, xOffset) {
    if (xOffset === undefined) xOffset = 0;
    let part = getPart(partString);
    part.setX(camera.obscurizeX(mouseX + xOffset));
    part.setY(camera.obscurizeY(mouseY));
    objectManager.add(part);
    lastRawComponent = partString;
}

function addComponent(circuit) {
    if (circuit.name.toLowerCase() === "and") enableAnd = true;
    else if (circuit.name.toLowerCase() === "xor") enableXor = true;
    else if (circuit.name.toLowerCase() === "diode") enableDiode = true;
    else if (circuit.name.toLowerCase() === "gnd" ||
        circuit.name.toLowerCase() === "ground") enableGND = true;

    let li = document.createElement("li");
    let button = document.createElement("button");
    button.innerText = circuit.name;
    let nameL = circuit.name.toLowerCase();
    if (nameL === "xor") {
        button.innerText += " (X)";
    } else if (nameL === "and") {
        button.innerText += " (A)";
    } else if (nameL === "diode") {
        button.innerText += " (D)";
    } else if (nameL === "ground" || nameL === "gnd") {
        button.innerText += " (G)";
    }
    button.onclick = () => addPart(circuit.stringify(), 400);
    li.appendChild(button);
    componentList.appendChild(li);

    loadedComponents.push(circuit.stringify());
}

function packCircuit() {
    let name = prompt("이름?");
    if (!name) {
        return;
    }
    let circuit = circuitize(name);
    objectManager.add(circuit);
    addComponent(circuit);
}

function save() {
    loadedComponents.sort((a, b) => {
        a = a.split(",");
        b = b.split(",");
        return a[a.length-1] < b[b.length-1] ? -1 : (a[a.length-1] === b[b.length-1] ? 0 : 1);
    })

    let saves = loadedComponents.join("{}");
    let filename = "components.txt";
    let file = new File([saves], filename);
    let a = document.createElement("a"),
        url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

function load(e) {
    let file = e.target.files[0];
    if (!file) return;
    file.text().then(r => r.split("{}").forEach(rawComponent => addComponent(getPart(rawComponent))));
}
componentFile.addEventListener("change", load);

function tick() {
    mouseTick();
    keyboardTick();

    camera.tick();

    circuitTick();

    objectManager.tick();
    socketHighlighter.tick();

    Wire.tick();

    if (selectedSocket) {
        selectedSocketHighlighter.position = [selectedSocket.x, selectedSocket.y];
        selectedSocketHighlighter.tick();
        wireHint.x = socketHighlighter.x;
        wireHint.y = socketHighlighter.y;
        wireHint.x2 = selectedSocketHighlighter.x;
        wireHint.y2 = selectedSocketHighlighter.y;
    }

    objectManager.handleRemoves();
}

function render() {
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    objectManager.render();
    if (selectedSocket) {
        socketHighlighter.render();
        selectedSocketHighlighter.render();
        wireHint.render();
    }
}

setInterval(() => {
    // for (let i = 0; i < 3; i++)
    tick();
    render();
}, 1000 / 60);


function resize() {
    canvas.width = window.innerWidth - sidebar.offsetWidth;
    canvas.height = window.innerHeight;
}

resize();

window.addEventListener("resize", resize)
