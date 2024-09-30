class Gate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 60;
        this.inputs = [];
        this.outputs = [];
        this.inputPorts = [];
        this.outputPorts = [];
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.label, this.x + this.size / 2, this.y + this.size / 2);

        ctx.fillStyle = '#00FF00';
        this.inputPorts.forEach(port => {
            ctx.fillRect(port.x, port.y, 10, 10);
            ctx.strokeStyle = 'yellow';
            ctx.strokeRect(port.x, port.y, 10, 10);
        });
        
        ctx.fillStyle = '#FF0000';
        this.outputPorts.forEach(port => {
            ctx.fillRect(port.x, port.y, 10, 10);
            ctx.strokeStyle = 'yellow';
            ctx.strokeRect(port.x, port.y, 10, 10);
        });

        ctx.strokeStyle = 'blue';
        ctx.strokeRect(this.x, this.y, this.size, this.size);
    }

    isPointInside(x, y) {
        return x >= this.x && x <= this.x + this.size &&
               y >= this.y && y <= this.y + this.size;
    }

    getPortAt(x, y) {
        const allPorts = [...this.inputPorts, ...this.outputPorts];
        return allPorts.find(port => 
            x >= port.x && x <= port.x + 10 &&
            y >= port.y && y <= port.y + 10
        );
    }

    updatePorts() {
        const inputSpacing = this.size / (this.inputPorts.length + 1);
        this.inputPorts = this.inputPorts.map((port, index) => ({
            x: this.x - 5,
            y: this.y + inputSpacing * (index + 1) - 5,
            isInput: true,
            component: this,
            connectedTo: port.connectedTo
        }));

        const outputSpacing = this.size / (this.outputPorts.length + 1);
        this.outputPorts = this.outputPorts.map((port, index) => ({
            x: this.x + this.size - 5,
            y: this.y + outputSpacing * (index + 1) - 5,
            isInput: false,
            component: this,
            connectedTo: port.connectedTo
        }));
    }
}

class ANDGate extends Gate {
    constructor(x, y) {
        super(x, y);
        this.color = '#4CAF50';
        this.label = 'AND';
        this.inputPorts = [{}, {}];
        this.outputPorts = [{}];
        this.updatePorts();
    }

    evaluate() {
        return this.inputs.length === 2 && this.inputs[0] && this.inputs[1];
    }
}

class ORGate extends Gate {
    constructor(x, y) {
        super(x, y);
        this.color = '#2196F3';
        this.label = 'OR';
        this.inputPorts = [{}, {}];
        this.outputPorts = [{}];
        this.updatePorts();
    }

    evaluate() {
        return this.inputs.length === 2 && (this.inputs[0] || this.inputs[1]);
    }
}

class NOTGate extends Gate {
    constructor(x, y) {
        super(x, y);
        this.color = '#F44336';
        this.label = 'NOT';
        this.inputPorts = [{}];
        this.outputPorts = [{}];
        this.updatePorts();
    }

    evaluate() {
        return this.inputs.length === 1 && !this.inputs[0];
    }
}

class XORGate extends Gate {
    constructor(x, y) {
        super(x, y);
        this.color = '#9C27B0';
        this.label = 'XOR';
        this.inputPorts = [{}, {}];
        this.outputPorts = [{}];
        this.updatePorts();
    }

    evaluate() {
        return this.inputs.length === 2 && this.inputs[0] !== this.inputs[1];
    }
}

class InputNode extends Gate {
    constructor(x, y) {
        super(x, y);
        this.color = '#757575';
        this.label = 'IN';
        this.state = false;
        this.outputPorts = [{}];
        this.updatePorts();
    }

    draw(ctx) {
        super.draw(ctx);
        ctx.fillStyle = this.state ? '#FFC107' : '#757575';
        ctx.beginPath();
        ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 4, 0, 2 * Math.PI);
        ctx.fill();
    }

    toggle() {
        this.state = !this.state;
    }

    evaluate() {
        return this.state;
    }
}

class OutputNode extends Gate {
    constructor(x, y) {
        super(x, y);
        this.color = '#607D8B';
        this.label = 'OUT';
        this.inputPorts = [{}];
        this.updatePorts();
    }

    draw(ctx) {
        super.draw(ctx);
        ctx.fillStyle = this.inputs[0] ? '#FFC107' : '#757575';
        ctx.beginPath();
        ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 4, 0, 2 * Math.PI);
        ctx.fill();
    }

    evaluate() {
        return this.inputs.length === 1 ? this.inputs[0] : false;
    }
}