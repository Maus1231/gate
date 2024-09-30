function autoCreateFullAdder() {
    const inputA = createComponent('INPUT', 50, 50);
    const inputB = createComponent('INPUT', 50, 150);
    const inputCin = createComponent('INPUT', 50, 250);
    const xor1 = createComponent('XOR', 200, 100);
    const xor2 = createComponent('XOR', 350, 150);
    const and1 = createComponent('AND', 200, 250);
    const and2 = createComponent('AND', 350, 300);
    const or = createComponent('OR', 500, 275);
    const outputSum = createComponent('OUTPUT', 500, 150);
    const outputCout = createComponent('OUTPUT', 650, 275);

    components.push(inputA, inputB, inputCin, xor1, xor2, and1, and2, or, outputSum, outputCout);

    connectWire(inputA.outputPorts[0], xor1.inputPorts[0]);
    connectWire(inputA.outputPorts[0], and1.inputPorts[0]);
    connectWire(inputB.outputPorts[0], xor1.inputPorts[1]);
    connectWire(inputB.outputPorts[0], and1.inputPorts[1]);
    connectWire(xor1.outputPorts[0], xor2.inputPorts[0]);
    connectWire(xor1.outputPorts[0], and2.inputPorts[0]);
    connectWire(inputCin.outputPorts[0], xor2.inputPorts[1]);
    connectWire(inputCin.outputPorts[0], and2.inputPorts[1]);
    connectWire(and1.outputPorts[0], or.inputPorts[0]);
    connectWire(and2.outputPorts[0], or.inputPorts[1]);
    connectWire(xor2.outputPorts[0], outputSum.inputPorts[0]);
    connectWire(or.outputPorts[0], outputCout.inputPorts[0]);

    drawCircuit();
}

function connectWire(startPort, endPort) {
    const wire = {
        start: {
            component: startPort.component,
            x: startPort.x,
            y: startPort.y,
            offsetX: startPort.x - startPort.component.x,
            offsetY: startPort.y - startPort.component.y
        },
        end: {
            component: endPort.component,
            x: endPort.x,
            y: endPort.y,
            offsetX: endPort.x - endPort.component.x,
            offsetY: endPort.y - endPort.component.y
        }
    };
    wires.push(wire);
    startPort.connectedTo = endPort;
    endPort.connectedTo = startPort;
}

window.addEventListener('load', () => {
    autoCreateFullAdder();
});