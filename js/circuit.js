let lastDirection = 0;

class BasicWire extends Line {
    static onColor = GREEN;
    static offColor = GREY;

    constructor(camera, x, y, x2, y2, on) {
        super(camera, x, y, x2, y2, BasicWire.offColor, 2);

        this.on = on === undefined ? false : on;
    }

    tick() {
        this.color = this.on ? BasicWire.onColor : BasicWire.offColor;
    }
}

class Socket extends Circle {
    static onColor = RED;
    static notOnColor = YELLOW;
    static offColor = BLACK;

    constructor(camera, x, y) {
        super(camera, x, y, 3, Socket.offColor);

        this.state = false;
        // `this.state`는 현재 `socket`이 전자제품으로부터 전기를 받고 있는지를 의미합니다.
        this.wireOn = false;
        // `this.wireOn`은 현재 `socket`이 연결된 `wire`로부터 전기를 받고 있는지를 의미합니다.
        this.on = false;
        // `this.on`은 와이어가 플레이어에게 보여지는 상태입니다.
    }

    cutAll() {
        objectManager.objects.forEach(object => {
            if (object instanceof Wire) {
                if (object.socket1 === this || object.socket2 === this) {
                    object.cut();
                }
            }
        });
    }

    tick() {
        this.on = this.state || this.wireOn;

        this.color = this.on ? Socket.onColor : (this.wireOn || this.state ? Socket.notOnColor : Socket.offColor);
    }
}

class Wire extends BasicWire {
    static tick() {
        if (rightStart) {
            selectedSocket = getClosestSocket();
        } else if (rightEnd) {
            if (closestSocket !== selectedSocket) {
                let enable = true;
                objectManager.objects.forEach(object => {
                    if (object instanceof Wire) {
                        if (
                            object.socket1 === closestSocket && object.socket2 === selectedSocket
                            || object.socket1 === selectedSocket && object.socket2 === closestSocket
                        ) {
                            object.cut();
                            enable = false;
                        }
                    }
                });
                if (enable) objectManager.add(new Wire(camera, closestSocket, selectedSocket));
            } else {
                closestSocket.cutAll();
            }
            selectedSocket = null;
            closestSocket = null;
        }

        if (selectedSocket) {
            closestSocket = getClosestSocket();
            socketHighlighter.position = [closestSocket.x, closestSocket.y];
        }
    }

    constructor(camera, socket1, socket2, on) {
        super(camera, socket1.x, socket1.y, socket2.x, socket2.y, on);

        this.socket1 = socket1;
        this.socket2 = socket2;
    }

    cut() {
        objectManager.remove(this);
        this.socket1.wireOn = false;
        this.socket2.wireOn = false;
    }

    stringify(circuit) {
        return `W[[${circuit.getSocketPlace(this.socket1)}],[${circuit.getSocketPlace(this.socket2)}],${this.on ? 1 : 0}]`;
    }

    replace() {
        this.x = this.socket1.x;
        this.y = this.socket1.y;
        this.x2 = this.socket2.x;
        this.y2 = this.socket2.y;
    }

    tick() {
        this.on = this.socket1.state || this.socket2.state;

        if (this.on) {
            this.socket1.wireOn = true;
            this.socket2.wireOn = true;
        } else {
            this.socket1.wireOn = false;
            this.socket2.wireOn = false;
        }

        super.tick();
    }
}

class Part extends Rectangle {
    static color = WHITE;
    static textColor = BLACK;
    static borderColor = BLACK;
    static directionIndicatorColor = LIGHT_GREY;
    static socketPadding = 10;
    static directionIndicatorSize = Part.socketPadding;
    static font = "Pretendard";

    constructor(camera, x, y, horizontal, vertical, inSockets, outSockets, direction, name) {
        super(
            camera, x, y,
            direction in VERTICAL ? horizontal : vertical,
            direction in VERTICAL ? vertical : horizontal, Part.color
        );

        this.name = name;
        this.inSockets = inSockets;
        this.outSockets = outSockets;

        this.direction = direction;

        this.nameObject = new Text(
            camera, x + this.width / 2, y + this.height / 2, this.name, Part.font, Part.textColor, 12
        );

        this.directionIndicator = new Rectangle(camera, 0, 0, 0, 0, Part.directionIndicatorColor);

        this.outline = new DrawRectangle(this.camera, this.x, this.y, this.width, this.height, Part.borderColor, 2);

        this.replaceSockets();
        this.replaceIndicator();
    }

    cutAll() {
        this.inSockets.forEach(inSocket => inSocket.cutAll());
        this.outSockets.forEach(outSocket => outSocket.cutAll());
    }

    getSockets() {
        return this.inSockets.concat(this.outSockets);
    }

    replaceSockets() {
        let inSocketLength = (this.inSockets.length - 1) * Part.socketPadding;
        let inSocketX = this.x + center(this.width, inSocketLength);
        let inSocketY = this.y + center(this.height, inSocketLength);

        let outSocketLength = (this.outSockets.length - 1) * Part.socketPadding;
        let outSocketX = this.x + center(this.width, outSocketLength);
        let outSocketY = this.y + center(this.height, outSocketLength)

        for (let i = 0; i < this.inSockets.length; i++) {
            let inSocket = this.inSockets[i];

            if (this.direction === UP) {
                inSocket.x = inSocketX + i * Part.socketPadding;
                inSocket.y = this.y + this.height - Part.socketPadding;
            } else if (this.direction === LEFT) {
                inSocket.x = this.x + this.width - Part.socketPadding;
                inSocket.y = inSocketY + i * Part.socketPadding;
            } else if (this.direction === DOWN) {
                inSocket.x = inSocketX + i * Part.socketPadding;
                inSocket.y = this.y + Part.socketPadding;
            } else if (this.direction === RIGHT) {
                inSocket.x = this.x + Part.socketPadding;
                inSocket.y = inSocketY + i * Part.socketPadding;
            }
        }

        for (let i = 0; i < this.outSockets.length; i++) {
            let outSocket = this.outSockets[i];

            if (this.direction === UP) {
                outSocket.x = outSocketX + i * Part.socketPadding;
                outSocket.y = this.y + Part.socketPadding;
            } else if (this.direction === LEFT) {
                outSocket.x = this.x + Part.socketPadding;
                outSocket.y = outSocketY + i * Part.socketPadding;
            } else if (this.direction === DOWN) {
                outSocket.x = outSocketX + i * Part.socketPadding;
                outSocket.y = this.y + this.height - Part.socketPadding;
            } else if (this.direction === RIGHT) {
                outSocket.x = this.x + this.width - Part.socketPadding;
                outSocket.y = outSocketY + i * Part.socketPadding;
            }
        }
    }

    replaceIndicator() {
        if (this.direction === UP) {
            this.directionIndicator.x = this.x;
            this.directionIndicator.y = this.y;
            this.directionIndicator.width = this.width;
            this.directionIndicator.height = Part.directionIndicatorSize;
        } else if (this.direction === LEFT) {
            this.directionIndicator.x = this.x;
            this.directionIndicator.y = this.y;
            this.directionIndicator.width = Part.directionIndicatorSize;
            this.directionIndicator.height = this.height;
        } else if (this.direction === DOWN) {
            this.directionIndicator.width = this.width;
            this.directionIndicator.height = Part.directionIndicatorSize;
            this.directionIndicator.x = this.x;
            this.directionIndicator.y = this.y + this.height - this.directionIndicator.height;
        } else if (this.direction === RIGHT) {
            this.directionIndicator.width = Part.directionIndicatorSize;
            this.directionIndicator.height = this.height;
            this.directionIndicator.x = this.x + this.width - this.directionIndicator.width;
            this.directionIndicator.y = this.y;
        }
    }

    get socketIn() {
        let result = [];
        this.inSockets.forEach(socket => {
            result.push(socket.on);
        });
        return result;
    }

    get wires() {
        let result = [];
        objectManager.objects.forEach(object => {
            if (object instanceof Wire) {
                if (this.inSockets.indexOf(object.socket1) !== -1
                    || this.outSockets.indexOf(object.socket1) !== -1
                    || this.inSockets.indexOf(object.socket2) !== -1
                    || this.outSockets.indexOf(object.socket2) !== -1) {
                    result.push(object);
                }
            }
        });
        return result
    }

    setX(x) {
        this.x = x;
        this.nameObject.x = this.x + this.width / 2;
        this.outline.x = this.x;
        this.replaceSockets();
        this.replaceIndicator();
    }

    setY(y) {
        this.y = y;
        this.nameObject.y = this.y + this.height / 2;
        this.outline.y = this.y;
        this.replaceSockets();
        this.replaceIndicator();
    }

    setDirection(direction) {
        this.direction = direction;
        lastDirection = this.direction;
        this.replaceSockets();
        this.replaceIndicator();
        this.wires.forEach(wire => wire.replace());
    }

    setSocketOut(index, value) {
        this.outSockets[index].state = value;
    }

    stringify(circuit) {
    }

    compute() {
        this.inSockets.forEach(inSocket => inSocket.tick());
        this.outSockets.forEach(outSocket => outSocket.tick());
    }

    tick() {
        this.compute();

        this.outSockets.forEach(outSocket => outSocket.wireOn = false);

        if (leftStart
            && selectedPart === null
            && this.x < this.camera.obscurizeX(mouseX) && this.camera.obscurizeX(mouseX) < this.x + this.width
            && this.y < this.camera.obscurizeY(mouseY) && this.camera.obscurizeY(mouseY) < this.y + this.height
            && objectManager.objects.indexOf(this) !== -1) {
            selectedPart = this;
        }

        if (selectedPart === this) {
            this.setX(this.x + mouseDeltaX / this.camera.zoom);
            this.setY(this.y + mouseDeltaY / this.camera.zoom);
            objectManager.objects.forEach(object => {
                if (object instanceof Wire) {
                    object.replace();
                }
            });
        }
    }

    render() {
        if (
            this.x + this.width < camera.obscurizeX(0) || this.x > camera.obscurizeX(canvas.width)
            || this.y + this.height < camera.obscurizeY(0) || this.y > camera.obscurizeY(canvas.height)
        ) return;

        super.render();
        this.directionIndicator.render();
        this.inSockets.forEach(inSocket => inSocket.render());
        this.outSockets.forEach(outSocket => outSocket.render());
        this.nameObject.render();
        this.outline.render();
    }
}

class NotPart extends Part {
    static horizontal = 50;
    static vertical = 50;

    constructor(camera, x, y, direction) {
        super(camera, x, y, NotPart.horizontal, NotPart.vertical,
            [new Socket(camera)], [new Socket(camera)], direction, 'NOT');
        this.tick();
    }

    stringify() {
        return `N[${parseInt(this.x)},${parseInt(this.y)},${this.direction},${this.inSockets[0].wireOn ? "1" : "0"}]`;
    }

    compute() {
        super.compute();
        this.setSocketOut(0, !this.socketIn[0]);
    }

    tick() {
        this.compute();
        super.tick();
    }
}

class OrPart extends Part {
    static horizontal = 50;
    static vertical = 50;

    constructor(camera, x, y, direction) {
        super(camera, x, y, OrPart.horizontal, OrPart.vertical,
            [new Socket(camera), new Socket(camera)], [new Socket(camera)], direction, 'OR');
        this.tick();
    }

    stringify() {
        return `O[${parseInt(this.x)},${parseInt(this.y)},${this.direction},${this.inSockets[0].wireOn ? "1" : "0"},${this.inSockets[1].wireOn ? "1" : "0"}]`;
    }

    compute() {
        super.compute();
        this.setSocketOut(0, this.socketIn[0] || this.socketIn[1]);
    }

    tick() {
        this.compute();
        super.tick();
    }
}

class LowPart extends Part {
    static horizontal = 50;
    static vertical = 50;

    constructor(camera, x, y, direction) {
        super(camera, x, y, LowPart.horizontal, LowPart.vertical,
            [], [new Socket(camera)], direction, 'LOW')
        this.tick();
    }

    stringify() {
        return `0[${parseInt(this.x)},${parseInt(this.y)},${this.direction}]`;
    }

    compute() {
        super.compute();
        this.setSocketOut(0, false);
    }

    tick() {
        this.compute();
        super.tick();
    }
}

class HighPart extends Part {
    static horizontal = 50;
    static vertical = 50;

    constructor(camera, x, y, direction) {
        super(camera, x, y, HighPart.horizontal, HighPart.vertical,
            [], [new Socket(camera)], direction, 'HIGH');
        this.tick();
    }

    stringify() {
        return `1[${parseInt(this.x)},${parseInt(this.y)},${this.direction}]`;
    }

    compute() {
        super.compute();
        this.setSocketOut(0, true);
    }

    tick() {
        this.compute();
        super.tick();
    }
}

class Circuit extends Part {
    static getHorizontal(inSocketLength, outSocketLength) {
        return (Math.max(inSocketLength, outSocketLength) - 1) * Part.socketPadding + 50
    }

    constructor(camera, x, y, inSockets, outSockets, direction, name, components) {
        super(camera, x, y, Circuit.getHorizontal(inSockets.length, outSockets.length), Circuit.getHorizontal(inSockets.length, outSockets.length), inSockets, outSockets, direction, name);

        this.components = components;
    }

    compute() {
        super.compute();
        this.components.forEach(component => component.tick());
    }

    getSocketPlace(socket) {
        for (let i = 0; i < this.components.length; i++) {
            let component = this.components[i];
            if (component instanceof Part) {
                for (let j = 0; j < component.inSockets.length; j++) {
                    let inSocket = component.inSockets[j];
                    if (socket === inSocket) {
                        return [i, 0, j]
                    }
                }
                for (let j = 0; j < component.outSockets.length; j++) {
                    let inSocket = component.outSockets[j];
                    if (socket === inSocket) {
                        return [i, 1, j]
                    }
                }
            }
        }
    }

    stringify() {
        // noinspection JSMismatchedCollectionQueryUpdate
        let inSockets = [];
        // noinspection JSMismatchedCollectionQueryUpdate
        let outSockets = [];
        // noinspection JSMismatchedCollectionQueryUpdate
        let components = [];

        this.inSockets.forEach(socket => {
            inSockets.push(`[${this.getSocketPlace(socket)}]`);
        });
        this.outSockets.forEach(socket => {
            outSockets.push(`[${this.getSocketPlace(socket)}]`);
        });
        this.components.forEach(component => {
            components.push(component.stringify(this));
        });

        return `C[${parseInt(this.x)},${parseInt(this.y)},[${components}],[${inSockets}],[${outSockets}],${this.direction},${this.name}]`;
    }

    tick() {
        this.compute();
        super.tick();
    }
}

class SevenSegment extends Part {
    static horizontal = 100;
    static vertical = 100;
    static lineLength = 30;
    static lineWidth = 5;
    static offColor = WHITE_GREY;
    static onColor = BLACK;

    constructor(camera, x, y, direction) {
        super(
            camera, x, y, SevenSegment.horizontal, SevenSegment.vertical, [
                new Socket(camera), new Socket(camera), new Socket(camera), new Socket(camera),
                new Socket(camera), new Socket(camera), new Socket(camera)], [], direction, ""
        );

        this.lines = [
            new Line(this.camera, 0, 0, 0, 0, SevenSegment.offColor, SevenSegment.lineWidth),
            new Line(this.camera, 0, 0, 0, 0, SevenSegment.offColor, SevenSegment.lineWidth),
            new Line(this.camera, 0, 0, 0, 0, SevenSegment.offColor, SevenSegment.lineWidth),
            new Line(this.camera, 0, 0, 0, 0, SevenSegment.offColor, SevenSegment.lineWidth),
            new Line(this.camera, 0, 0, 0, 0, SevenSegment.offColor, SevenSegment.lineWidth),
            new Line(this.camera, 0, 0, 0, 0, SevenSegment.offColor, SevenSegment.lineWidth),
            new Line(this.camera, 0, 0, 0, 0, SevenSegment.offColor, SevenSegment.lineWidth)
        ]
    }

    replaceSegment() {
        let xCenter = this.x + this.width / 2;
        let yCenter = this.y + this.height / 2;

        this.lines[0].x = xCenter - SevenSegment.lineLength / 2;
        this.lines[0].y = yCenter - SevenSegment.lineLength;
        this.lines[0].x2 = xCenter + SevenSegment.lineLength / 2;
        this.lines[0].y2 = yCenter - SevenSegment.lineLength;

        this.lines[1].x = xCenter + SevenSegment.lineLength / 2;
        this.lines[1].y = yCenter - SevenSegment.lineLength;
        this.lines[1].x2 = xCenter + SevenSegment.lineLength / 2;
        this.lines[1].y2 = yCenter;

        this.lines[2].x = xCenter + SevenSegment.lineLength / 2;
        this.lines[2].y = yCenter + SevenSegment.lineLength;
        this.lines[2].x2 = xCenter + SevenSegment.lineLength / 2;
        this.lines[2].y2 = yCenter;

        this.lines[3].x = xCenter - SevenSegment.lineLength / 2;
        this.lines[3].y = yCenter + SevenSegment.lineLength;
        this.lines[3].x2 = xCenter + SevenSegment.lineLength / 2;
        this.lines[3].y2 = yCenter + SevenSegment.lineLength;

        this.lines[4].x = xCenter - SevenSegment.lineLength / 2;
        this.lines[4].y = yCenter + SevenSegment.lineLength;
        this.lines[4].x2 = xCenter - SevenSegment.lineLength / 2;
        this.lines[4].y2 = yCenter;

        this.lines[5].x = xCenter - SevenSegment.lineLength / 2;
        this.lines[5].y = yCenter - SevenSegment.lineLength;
        this.lines[5].x2 = xCenter - SevenSegment.lineLength / 2;
        this.lines[5].y2 = yCenter;

        this.lines[6].x = xCenter - SevenSegment.lineLength / 2;
        this.lines[6].y = yCenter;
        this.lines[6].x2 = xCenter + SevenSegment.lineLength / 2;
        this.lines[6].y2 = yCenter;

    }

    stringify() {
        return `S[${this.x},${this.y},${this.direction}]`;
    }

    tick() {
        super.tick();

        this.replaceSegment();

        let socketIn = this.socketIn;

        for (let i = 0; i < 7; i++) {
            this.lines[i].color = socketIn[i] ? SevenSegment.onColor : SevenSegment.offColor;
        }
    }

    render() {
        super.render();
        this.lines.forEach(line => line.render());
    }
}

class SocketHighlighter {
    static defaultColor = RED;

    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color ? color : SocketHighlighter.defaultColor;

        this.verticalLine = new Line(camera, 0, 0, 0, canvas.height, this.color, 1);
        this.horizontalLine = new Line(camera, 0, 0, canvas.width, 0, this.color, 1);
    }

    set position(value) {
        this.x = value[0];
        this.y = value[1];

        this.verticalLine.x = this.x;
        this.verticalLine.x2 = this.x;
        this.horizontalLine.y = this.y;
        this.horizontalLine.y2 = this.y;
    }

    tick() {
        this.verticalLine.y = camera.obscurizeY(0);
        this.verticalLine.y2 = camera.obscurizeY(canvas.height);
        this.horizontalLine.x = camera.obscurizeX(0);
        this.horizontalLine.x2 = camera.obscurizeX(canvas.width);
    }

    render() {
        this.horizontalLine.render();
        this.verticalLine.render();
    }
}

function getSocketByPlace(components, rawPath) {
    let rawNumbers = rawPath.substring(1, rawPath.length - 1).split(",")
    let thePart = components[parseInt(rawNumbers[0])];
    if (rawNumbers[1] === "0") {
        return thePart.inSockets[parseInt(rawNumbers[2])];
    } else {
        return thePart.outSockets[parseInt(rawNumbers[2])];
    }
}

function getPart(string) {
    if (string[0] === "C") {
        // noinspection JSUnresolvedFunction
        string = string.substring(2, string.length - 1);
        let tokens = unzip(string);

        let x = parseInt(tokens[0]),
            y = parseInt(tokens[1]),
            components = unzip(tokens[2].substring(1, tokens[2].length - 1)),
            inSocketPlaces = unzip(tokens[3].substring(1, tokens[3].length - 1)),
            outSocketPlaces = unzip(tokens[4].substring(1, tokens[4].length - 1)),
            direction = parseInt(tokens[5]),
            name = tokens[6];

        for (let i = 0; i < components.length; i++) {
            let rawComponent = components[i];

            if (rawComponent[0] === "W") {
                let rawComponent = components[i]
                rawComponent = unzip(rawComponent.substring(2, rawComponent.length - 1));

                let socket1 = getSocketByPlace(components, rawComponent[0]),
                    socket2 = getSocketByPlace(components, rawComponent[1]);

                components[i] = new Wire(camera, socket1, socket2, rawComponent[2] === "1");
            } else {
                components[i] = getPart(rawComponent);
            }
        }

        let inSockets = [], outSockets = [];
        inSocketPlaces.forEach(rawSocket => {
            if (rawSocket === "") return;
            inSockets.push(getSocketByPlace(components, rawSocket));
        });
        outSocketPlaces.forEach(rawSocket => {
            if (rawSocket === "") return;
            outSockets.push(getSocketByPlace(components, rawSocket));
        });

        return new Circuit(camera, x, y, inSockets, outSockets, direction, name, components);

    } else if (string[0] === "N") {
        let rawNumbers = string.substring(2, string.length - 1).split(",", 4);
        let x = parseInt(rawNumbers[0]),
            y = parseInt(rawNumbers[1]),
            direction = parseInt(rawNumbers[2]);
        let part = new NotPart(camera, x, y, direction);
        part.inSockets[0].wireOn = rawNumbers[3] === "1";
        part.outSockets[0].state = !part.inSockets[0].wireOn;
        part.inSockets[0].tick();
        part.outSockets[0].tick();
        return part;

    } else if (string[0] === "O") {
        let rawNumbers = string.substring(2, string.length - 1).split(",", 5);
        let x = parseInt(rawNumbers[0]),
            y = parseInt(rawNumbers[1]),
            direction = parseInt(rawNumbers[2]);
        let part = new OrPart(camera, x, y, direction);
        part.inSockets[0].wireOn = rawNumbers[3] === "1";
        part.inSockets[1].wireOn = rawNumbers[4] === "1";
        part.outSockets[0].state = part.inSockets[0].wireOn || part.inSockets[1].wireOn;
        part.inSockets[0].tick();
        part.inSockets[1].tick();
        part.outSockets[0].tick();
        return part;

    } else if (string[0] === "0") {
        let rawNumbers = string.substring(2, string.length - 1).split(",", 3);
        let x = parseInt(rawNumbers[0]),
            y = parseInt(rawNumbers[1]),
            direction = parseInt(rawNumbers[2]);
        return new LowPart(camera, x, y, direction);

    } else if (string[0] === "1") {
        let rawNumbers = string.substring(2, string.length - 1).split(",", 3);
        let x = parseInt(rawNumbers[0]),
            y = parseInt(rawNumbers[1]),
            direction = parseInt(rawNumbers[2]);
        return new HighPart(camera, x, y, direction);
    } else if (string[0] === "S") {
        let rawNumbers = string.substring(2, string.length - 1).split(",", 3);
        let x = parseInt(rawNumbers[0]),
            y = parseInt(rawNumbers[1]),
            direction = parseInt(rawNumbers[2]);
        return new SevenSegment(camera, x, y, direction);
    }
}

function getClosestSocket() {
    let closestDistance = Infinity;
    let closest = null;
    objectManager.objects.forEach(object => {
        if (object instanceof Part) {
            object.getSockets().forEach(socket => {
                let distance = Math.hypot(
                    socket.x - camera.obscurizeX(mouseX),
                    socket.y - camera.obscurizeY(mouseY)
                );
                if (distance < closestDistance) {
                    closest = socket;
                    closestDistance = distance;
                }
            });
        }
    });
    return closest;
}

function getClosestPart() {
    let closestDistance = Infinity;
    let closest = null;
    objectManager.objects.forEach(object => {
        if (object instanceof Part) {
            let distance = Math.hypot(
                object.x - camera.obscurizeX(mouseX),
                object.y - camera.obscurizeY(mouseY)
            );
            if (distance < closestDistance) {
                closest = object;
                closestDistance = distance;
            }
        }
    });
    return closest;
}

function circuitize(name) {
    let inSockets = [];
    let outSockets = [];

    objectManager.objects.forEach(part => {
        if (part instanceof Part) {
            inSockets = inSockets.concat(part.inSockets);
            outSockets = outSockets.concat(part.outSockets);
        }
    });

    objectManager.objects.forEach(wire => {
        if (wire instanceof Wire) {
            inSockets.remove(wire.socket1);
            outSockets.remove(wire.socket1);
            inSockets.remove(wire.socket2);
            outSockets.remove(wire.socket2);
        }
    });

    return new Circuit(
        camera, camera.obscurizeX(mouseX), camera.obscurizeY(mouseY),
        inSockets, outSockets, lastDirection,
        name, objectManager.popComponents());
}

function circuitTick() {
    if (isStartKey("Numpad0") || isStartKey("Digit0")) {
        objectManager.add(new LowPart(camera, camera.obscurizeX(mouseX), camera.obscurizeY(mouseY), lastDirection));
    }
    if (isStartKey("Numpad1") || isStartKey("Digit1")) {
        objectManager.add(new HighPart(camera, camera.obscurizeX(mouseX), camera.obscurizeY(mouseY), lastDirection));
    }
    if (isStartKey("KeyN")) {
        objectManager.add(new NotPart(camera, camera.obscurizeX(mouseX), camera.obscurizeY(mouseY), lastDirection));
    }
    if (isStartKey("KeyO")) {
        objectManager.add(new OrPart(camera, camera.obscurizeX(mouseX), camera.obscurizeY(mouseY), lastDirection));
    }
    if (isStartKey("KeyS")) {
        objectManager.add(new SevenSegment(camera, camera.obscurizeX(mouseX), camera.obscurizeY(mouseY), lastDirection));
    }
    if (isStartKey("KeyA") && enableAnd) {
        addPart("C[259.5,191,[N[145.5,141,3,0],N[146.5,203,3,0],O[210.5,161,3,1,1],N[268.5,162.5,3,1],W[[2,1,0],[3,0,0],1],W[[2,0,1],[1,1,0],1],W[[2,0,0],[0,1,0],1]],[[0,0,0,0,0],[1,0,0,0,0]],[[3,1,0,0,0]],3,AND]");
    }
    if (isStartKey("KeyX") && enableXor) {
        addPart("C[347.8900414937759,203.41804979253112,[N[164.5,97.5,3,0],N[242,100,3,1],N[175,197.5,3,0],N[251,199.5,3,1],N[386,70,3,0],N[395,134,3,0],N[597,131.5,3,1],N[606,188,3,0],N[786,147.5,3,1],O[465,93,3,1,1],O[423.5,236.5,3,0,0],O[693,147.5,3,0,1],W[[11,0,0],[6,1,0],0],W[[11,0,1],[7,1,0],1],W[[8,0,0],[11,1,0],1],W[[7,0,0],[10,1,0],0],W[[6,0,0],[9,1,0],1],W[[9,0,1],[5,1,0],1],W[[9,0,0],[4,1,0],1],W[[1,1,0],[4,0,0],0],W[[10,0,0],[1,1,0],0],W[[5,0,0],[3,1,0],0],W[[10,0,1],[3,1,0],0],W[[3,0,0],[2,1,0],1],W[[1,0,0],[0,1,0],1]],[[0,0,0,0,0],[2,0,0,0,0]],[[8,1,0,0,0]],3,XOR]");
    }
    if (isStartKey("KeyD") && enableDiode) {
        addPart("C[308.5,197,[N[240.5,165,3,0],N[305,171,3,1],W[[1,0,0],[0,1,0],1]],[[0,0,0,0,0]],[[1,1,0,0,0]],3,Diode]");
    }
    if (isStartKey("KeyG") && enableGND) {
        addPart("C[305,189.5,[O[258.5,241.5,3,0,0],W[[0,0,1],[0,1,0],0]],[[0,0,0,0,0]],[],3,GND]");
    }
    if (isStartKey("KeyB") && lastRawComponent) {
        addPart(lastRawComponent);
    }
    if (isStartKey("KeyR")) {
        let delta = 3;
        if (isKey("ShiftLeft") || isKey("ShiftRight")) {
            delta = 1;
        }
        let part = getClosestPart();
        if (part !== null) {
            part.setDirection((part.direction + delta) % 4);
        }
    }
    if (isStartKey("KeyC")) {
        packCircuit();
    }
    if (isStartKey("Delete")) {
        let part = getClosestPart();
        if (part !== null) {
            part.cutAll();
            objectManager.remove(part);
        }
    }
}