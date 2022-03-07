class Camera {
    static minZoom = 0.1;
    static maxZoom = 10;

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.zoom = 2;

        this.moving = false;
    }

    setZoom(zoom) {
        let previousZoom = this.zoom;
        this.zoom = limit(zoom, Camera.minZoom, Camera.maxZoom);

        this.x += (canvas.width / previousZoom - canvas.width / this.zoom) / 2;
        this.y += (canvas.height / previousZoom - canvas.height / this.zoom) / 2;

        objectManager.objects.forEach(object => {
            if (object instanceof Part) {
                object.replaceIndicator();
            }
        });
    }

    tick() {
        if (wheelStart) {
            this.moving = true;
        } else if (wheelEnd) {
            this.moving = false;
        }

        if (!this.moving && isKey("Space")) {
            this.moving = true;
        } else if (isEndKey("Space")) {
            this.moving = false;
        }
        if (this.moving) {
            this.x -= mouseDeltaX / this.zoom;
            this.y -= mouseDeltaY / this.zoom;
        }
    }

    translateX(x) {
        return (x - this.x) * this.zoom;
    }

    translateY(y) {
        return (y - this.y) * this.zoom;
    }

    obscurizeX(x) {
        return x / this.zoom + this.x;
    }

    obscurizeY(y) {
        return y / this.zoom + this.y;
    }
}