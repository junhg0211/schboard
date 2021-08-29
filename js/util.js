function center(a, b) {
    return (a - b) / 2
}

function limit(value, min, max) {
    if (value < min) {
        return min;
    } else if (value > max) {
        return max;
    } else {
        return value;
    }
}

function unzip(string) {
    let bracketLevel = 0,
        tokens = [""];
    for (let i = 0; i < string.length; i++) {
        let letter = string[i];
        tokens[tokens.length - 1] += letter

        if (letter === "[") bracketLevel++;
        else if (letter === "]") bracketLevel--;
        else if (letter === "," && bracketLevel === 0) {
            tokens[tokens.length - 1] = tokens[tokens.length - 1].substring(0, tokens[tokens.length - 1].length - 1);
            tokens.push("");
        }
    }
    return tokens;
}

function copyToClipboard(val) {
    const t = document.createElement("textarea");
    document.body.appendChild(t);
    t.value = val;
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
}

Array.prototype.remove = function(val) {
    for (let i = 0; i < this.length; i++) {
        if (this[i] === val) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
}

Array.prototype.equals = function(array) {
    for (let i = 0; i < this.length; i++) {
        if (this[i] !== array[i]) {
            return false;
        }
    }
    return array.length === this.length;
}