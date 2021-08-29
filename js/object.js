class Object {
    constructor(camera, x, y) {
        this.camera = camera;
        this.x = x;
        this.y = y;
    }


    tick() {}

    render() {}
}

class ObjectManager {
    constructor() {
        this.objects = [];
        this.removeQueue = [];
    }

    popComponents() {
        let result = [];
        this.objects.forEach(object => {
            if (object instanceof Part || object instanceof Wire) {
                result.push(object);
                this.remove(object);
            }
        });
        return result;
    }

    add(object) {
            this.objects.push(object);
    }

    remove(object) {
        this.removeQueue.push(object);
    }

    handleRemoves() {
        this.removeQueue.forEach(object => {
            this.objects.remove(object);
        });
        this.removeQueue = [];
    }

    tick() {
        this.objects.forEach((element) => element.tick());
    }

    render() {
        this.objects.forEach((element) => element.render());
    }
}


class Rectangle extends Object {
    constructor(camera, x, y, width, height, color) {
        super(camera, x, y);

        this.width = width;
        this.height = height;
        this.color = color;
    }

    render() {
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.camera.translateX(this.x), this.camera.translateY(this.y),
            this.camera.zoom * this.width, this.camera.zoom * this.height
        );
    }
}


class DrawRectangle extends Object {
    constructor(camera, x, y, width, height, color, boldness) {
        super(camera, x, y);

        this.width = width;
        this.height = height;
        this.color = color;
        this.boldness = !boldness ? 1 : boldness;
    }

    render() {
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.rect(
            this.camera.translateX(this.x), this.camera.translateY(this.y),
            this.width * this.camera.zoom, this.height * this.camera.zoom
        );
        ctx.lineWidth = this.boldness * this.camera.zoom;
        ctx.stroke();
    }
}

class Line extends Object {
    constructor(camera, x, y, x2, y2, color, width) {
        super(camera, x, y);

        this.x2 = x2;
        this.y2 = y2;
        this.color = color;
        this.width = width;
    }

    render() {
        ctx.strokeStyle = this.color;

        ctx.beginPath();
        ctx.moveTo(this.camera.translateX(this.x), this.camera.translateY(this.y));
        ctx.lineTo(this.camera.translateX(this.x2), this.camera.translateY(this.y2));
        ctx.lineWidth = this.width * this.camera.zoom;
        ctx.stroke();
    }
}

// noinspection DuplicatedCode
class Circle extends Object {
    constructor(camera, x, y, radius, color) {
        super(camera, x, y);

        this.radius = radius;
        this.color = color;
    }
    render() {
        ctx.fillStyle = this.color;

        let translatedX = this.camera.translateX(this.x),
            translatedY = this.camera.translateY(this.y);

        ctx.beginPath();
        ctx.moveTo(translatedX, translatedY);
        ctx.arc(translatedX, translatedY, this.camera.zoom * this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// noinspection DuplicatedCode
class DrawCircle extends Circle {
    constructor(camera, x, y, radius, color, width) {
        super(camera, x, y, radius, color, width);

        this.width = width;
    }

    render() {
        ctx.strokeStyle = this.color;

        let translatedX = this.camera.translateX(this.x),
            translatedY = this.camera.translateY(this.y);

        ctx.beginPath();
        ctx.moveTo(translatedX, translatedY);
        ctx.arc(translatedX, translatedY, this.camera.zoom * this.radius, 0, 2 * Math.PI);
        ctx.lineWidth = this.width;
        ctx.stroke();
    }
}

class Text extends Object {
    constructor(camera, x, y, text, font, color, size) {
        super(camera, x, y);
        this.text = text;
        this.font = font;
        this.color = color;
        this.size = size;
    }

    render() {
        ctx.font = `${this.size * this.camera.zoom}px ${this.font}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = this.color;

        ctx.fillText(this.text, this.camera.translateX(this.x), this.camera.translateY(this.y));
    }
}

class Cross extends Object {
    static color = WHITE;
    static width = 1;
    static size = 10;

    constructor(camera, x, y) {
        super(camera, x, y);

        this.verticalLine = new Line(camera, x, y - Cross.size, x, y + Cross.size, Cross.color, Cross.width);
        this.horizontalLine = new Line(camera, x - Cross.size, y, x + Cross.size, y, Cross.color, Cross.width);
    }

    render() {
        this.verticalLine.render();
        this.horizontalLine.render();
    }
}