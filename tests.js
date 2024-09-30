function runTests() {
    console.log("Running tests...");
    
    testFullAdder();
    testANDGate();
    testORGate();
    testXORGate();
    testNOTGate();
    testWireRemoval();
    
    console.log("All tests completed.");
}

function assertEqual(actual, expected, testName) {
    if (JSON.stringify(actual) === JSON.stringify(expected)) {
        console.log(`✅ ${testName} passed`);
    } else {
        console.error(`❌ ${testName} failed. Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
    }
}

function testFullAdder() {
    console.log("Testing Full Adder...");
    
    const inputA = new InputNode(0, 0);
    const inputB = new InputNode(0, 0);
    const inputCin = new InputNode(0, 0);
    const outputSum = new OutputNode(0, 0);
    const outputCout = new OutputNode(0, 0);
    
    const xor1 = new XORGate(0, 0);
    const xor2 = new XORGate(0, 0);
    const and1 = new ANDGate(0, 0);
    const and2 = new ANDGate(0, 0);
    const or = new ORGate(0, 0);
    
    xor1.inputPorts[0].connectedTo = inputA.outputPorts[0];
    xor1.inputPorts[1].connectedTo = inputB.outputPorts[0];
    
    xor2.inputPorts[0].connectedTo = xor1.outputPorts[0];
    xor2.inputPorts[1].connectedTo = inputCin.outputPorts[0];
    
    and1.inputPorts[0].connectedTo = inputA.outputPorts[0];
    and1.inputPorts[1].connectedTo = inputB.outputPorts[0];
    
    and2.inputPorts[0].connectedTo = xor1.outputPorts[0];
    and2.inputPorts[1].connectedTo = inputCin.outputPorts[0];
    
    or.inputPorts[0].connectedTo = and1.outputPorts[0];
    or.inputPorts[1].connectedTo = and2.outputPorts[0];
    
    outputSum.inputPorts[0].connectedTo = xor2.outputPorts[0];
    outputCout.inputPorts[0].connectedTo = or.outputPorts[0];
    
    const testCases = [
        { inputs: [0, 0, 0], expected: [0, 0] },
        { inputs: [0, 0, 1], expected: [1, 0] },
        { inputs: [0, 1, 0], expected: [1, 0] },
        { inputs: [0, 1, 1], expected: [0, 1] },
        { inputs: [1, 0, 0], expected: [1, 0] },
        { inputs: [1, 0, 1], expected: [0, 1] },
        { inputs: [1, 1, 0], expected: [0, 1] },
        { inputs: [1, 1, 1], expected: [1, 1] }
    ];
    
    testCases.forEach((testCase, index) => {
        inputA.state = Boolean(testCase.inputs[0]);
        inputB.state = Boolean(testCase.inputs[1]);
        inputCin.state = Boolean(testCase.inputs[2]);
        
        const components = [inputA, inputB, inputCin, xor1, xor2, and1, and2, or, outputSum, outputCout];
        components.forEach(component => {
            if (!(component instanceof InputNode)) {
                component.inputs = component.inputPorts.map(port => port.connectedTo.component.evaluate());
            }
        });

        const sum = outputSum.evaluate();
        const cout = outputCout.evaluate();
        
        assertEqual([Number(sum), Number(cout)], testCase.expected, `Full Adder test case ${index + 1}`);
    });
}

function testANDGate() {
    console.log("Testing AND Gate...");
    const and = new ANDGate(0, 0);
    and.inputs = [false, false];
    assertEqual(and.evaluate(), false, "AND Gate: false AND false");
    and.inputs = [false, true];
    assertEqual(and.evaluate(), false, "AND Gate: false AND true");
    and.inputs = [true, false];
    assertEqual(and.evaluate(), false, "AND Gate: true AND false");
    and.inputs = [true, true];
    assertEqual(and.evaluate(), true, "AND Gate: true AND true");
}

function testORGate() {
    console.log("Testing OR Gate...");
    const or = new ORGate(0, 0);
    or.inputs = [false, false];
    assertEqual(or.evaluate(), false, "OR Gate: false OR false");
    or.inputs = [false, true];
    assertEqual(or.evaluate(), true, "OR Gate: false OR true");
    or.inputs = [true, false];
    assertEqual(or.evaluate(), true, "OR Gate: true OR false");
    or.inputs = [true, true];
    assertEqual(or.evaluate(), true, "OR Gate: true OR true");
}

function testXORGate() {
    console.log("Testing XOR Gate...");
    const xor = new XORGate(0, 0);
    xor.inputs = [false, false];
    assertEqual(xor.evaluate(), false, "XOR Gate: false XOR false");
    xor.inputs = [false, true];
    assertEqual(xor.evaluate(), true, "XOR Gate: false XOR true");
    xor.inputs = [true, false];
    assertEqual(xor.evaluate(), true, "XOR Gate: true XOR false");
    xor.inputs = [true, true];
    assertEqual(xor.evaluate(), false, "XOR Gate: true XOR true");
}

function testNOTGate() {
    console.log("Testing NOT Gate...");
    const not = new NOTGate(0, 0);
    not.inputs = [false];
    assertEqual(not.evaluate(), true, "NOT Gate: NOT false");
    not.inputs = [true];
    assertEqual(not.evaluate(), false, "NOT Gate: NOT true");
}

function testWireRemoval() {
    console.log("Testing Wire Removal...");
    
    components = [];
    wires = [];
    
    const input1 = new InputNode(50, 50);
    const input2 = new InputNode(50, 150);
    const andGate = new ANDGate(200, 100);
    const output = new OutputNode(350, 100);
    
    components.push(input1, input2, andGate, output);
    
    const wire1 = {
        start: { component: input1, x: input1.outputPorts[0].x, y: input1.outputPorts[0].y },
        end: { component: andGate, x: andGate.inputPorts[0].x, y: andGate.inputPorts[0].y }
    };
    const wire2 = {
        start: { component: input2, x: input2.outputPorts[0].x, y: input2.outputPorts[0].y },
        end: { component: andGate, x: andGate.inputPorts[1].x, y: andGate.inputPorts[1].y }
    };
    const wire3 = {
        start: { component: andGate, x: andGate.outputPorts[0].x, y: andGate.outputPorts[0].y },
        end: { component: output, x: output.inputPorts[0].x, y: output.inputPorts[0].y }
    };
    
    wires.push(wire1, wire2, wire3);
    
    input1.outputPorts[0].connectedTo = andGate.inputPorts[0];
    input2.outputPorts[0].connectedTo = andGate.inputPorts[1];
    andGate.inputPorts[0].connectedTo = input1.outputPorts[0];
    andGate.inputPorts[1].connectedTo = input2.outputPorts[0];
    andGate.outputPorts[0].connectedTo = output.inputPorts[0];
    output.inputPorts[0].connectedTo = andGate.outputPorts[0];
    
    input1.state = true;
    input2.state = true;
    simulateCircuit();
    
    assertEqual(output.inputs[0], true, "Output should be true when both inputs are true");
    
    removeWire(wire1);
    simulateCircuit();
    
    assertEqual(output.inputs[0], false, "Output should be false after removing wire1");
    assertEqual(andGate.inputPorts[0].connectedTo, null, "AND gate input1 should be disconnected");
    assertEqual(input1.outputPorts[0].connectedTo, null, "Input1 output should be disconnected");
    
    removeWire(wire2);
    simulateCircuit();
    
    assertEqual(output.inputs[0], false, "Output should be false after removing wire2");
    assertEqual(andGate.inputPorts[1].connectedTo, null, "AND gate input2 should be disconnected");
    assertEqual(input2.outputPorts[0].connectedTo, null, "Input2 output should be disconnected");
    
    removeWire(wire3);
    simulateCircuit();
    
    assertEqual(output.inputs[0], false, "Output should be false after removing all wires");
    assertEqual(andGate.outputPorts[0].connectedTo, null, "AND gate output should be disconnected");
    assertEqual(output.inputPorts[0].connectedTo, null, "Output input should be disconnected");
    
    console.log("Wire Removal tests completed.");
}

runTests();