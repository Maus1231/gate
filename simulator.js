const canvas = document.getElementById('circuit-canvas');
const ctx = canvas.getContext('2d');

let components = [];
let wires = [];
let draggingComponent = null;
let wireStart = null;
let dragOffset = { x: 0, y: 0 };
let mouseX = 0;
let mouseY = 0;
let tempWire = null;

const gridSize = 20;
 
let isPanning = false;
let panStart = { x: 0, y: 0 };
let offset = { x: 0, y: 0 };
let zoom = 1;

function applyTransform(ctx) {
    ctx.setTransform(zoom, 0, 0, zoom, offset.x, offset.y);
}

function inverseTransform(x, y) {
    return {
        x: (x - offset.x) / zoom,
        y: (y - offset.y) / zoom
    };
}

function snapToGrid(value) {
    return Math.round(value / gridSize) * gridSize;
}

function createComponent(type, x, y) {
    switch (type) {
        case 'AND': return new ANDGate(x, y);
        case 'OR': return new ORGate(x, y);
        case 'NOT': return new NOTGate(x, y);
        case 'XOR': return new XORGate(x, y);
        case 'INPUT': return new InputNode(x, y);
        case 'OUTPUT': return new OutputNode(x, y);
    }
}

function addComponent(type) {
    const component = createComponent(type, 100, 100);
    components.push(component);
    drawCircuit();
}

function drawCircuit() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    applyTransform(ctx);

    ctx.strokeStyle = '#2C2C2C';
    ctx.lineWidth = 1 / zoom;
    const startX = Math.floor(-offset.x / zoom / gridSize) * gridSize;
    const startY = Math.floor(-offset.y / zoom / gridSize) * gridSize;
    const endX = startX + canvas.width / zoom + gridSize;
    const endY = startY + canvas.height / zoom + gridSize;

    for (let x = startX; x < endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
    }
    for (let y = startY; y < endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
    }

    wires.forEach(drawWire);
    components.forEach(component => component.draw(ctx));

    if (tempWire) {
        drawWire(tempWire);
    }
}

function drawWire(wire) {
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wire.start.x + 5, wire.start.y + 5);
    
    const endX = wire.end.x || mouseX;
    const endY = wire.end.y || mouseY;
    
    const dx = endX - wire.start.x;
    const dy = endY - wire.start.y;
    const controlX1 = wire.start.x + dx / 4;
    const controlY1 = wire.start.y + dy / 2;
    const controlX2 = endX - dx / 4;
    const controlY2 = endY - dy / 2;
    
    ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, endX, endY);
    ctx.stroke();
}

function simulateCircuit() {
    components.forEach(component => {
        if (!(component instanceof InputNode)) {
            component.inputs = component.inputPorts.map(() => false);
        }
    });

    components.forEach(component => {
        if (component instanceof OutputNode) {
            const connectedPort = component.inputPorts[0]?.connectedTo;
            component.inputs = [connectedPort ? connectedPort.component.evaluate() : false];
        } else if (!(component instanceof InputNode)) {
            component.inputs = component.inputPorts.map(port => {
                const connectedPort = port.connectedTo;
                return connectedPort ? connectedPort.component.evaluate() : false;
            });
        }
    });
    drawCircuit();
}

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (evt.clientX - rect.left) * scaleX;
    const y = (evt.clientY - rect.top) * scaleY;
    return inverseTransform(x, y);
}

function isNearPort(x, y, port) {
    const distance = Math.sqrt(Math.pow(x - port.x - 5, 2) + Math.pow(y - port.y - 5, 2));
    return distance <= 15;
}

function findNearestPort(x, y) {
    for (const component of components) {
        for (const port of [...component.inputPorts, ...component.outputPorts]) {
            if (isNearPort(x, y, port)) {
                return port;
            }
        }
    }
    return null;
}

function removeWire(wire) {
    const index = wires.indexOf(wire);
    if (index > -1) {
        wires.splice(index, 1);
        
        if (wire.start.component) {
            const startPort = wire.start.component.outputPorts.find(p => p.x === wire.start.x && p.y === wire.start.y);
            if (startPort) startPort.connectedTo = null;
        }
        if (wire.end.component) {
            const endPort = wire.end.component.inputPorts.find(p => p.x === wire.end.x && p.y === wire.end.y);
            if (endPort) endPort.connectedTo = null;
        }

        wire.start.component.updatePorts();
        wire.end.component.updatePorts();
    }
}

function updateWiresForComponent(component) {
    wires.forEach(wire => {
        if (wire.start.component === component) {
            wire.start.x = component.x + wire.start.offsetX;
            wire.start.y = component.y + wire.start.offsetY;
        }
        if (wire.end.component === component) {
            wire.end.x = component.x + wire.end.offsetX;
            wire.end.y = component.y + wire.end.offsetY;
        }
    });
}

canvas.addEventListener('mousemove', e => {
    const pos = getMousePos(canvas, e);
    mouseX = pos.x;
    mouseY = pos.y;

    if (isPanning) {
        offset.x = e.clientX - panStart.x;
        offset.y = e.clientY - panStart.y;
        drawCircuit();
    } else if (draggingComponent) {
        draggingComponent.x = snapToGrid(pos.x - dragOffset.x);
        draggingComponent.y = snapToGrid(pos.y - dragOffset.y);
        draggingComponent.updatePorts();
        updateWiresForComponent(draggingComponent);
        simulateCircuit();
        drawCircuit();
    }

    if (tempWire) {
        tempWire.end = { x: pos.x, y: pos.y };
        drawCircuit();
    }
});

canvas.addEventListener('mousedown', e => {
    if (e.shiftKey && e.button === 0) {
        isPanning = true;
        panStart = { x: e.clientX - offset.x, y: e.clientY - offset.y };
        canvas.style.cursor = 'grabbing';
        e.preventDefault();
    } else {
        const pos = getMousePos(canvas, e);
        const x = pos.x;
        const y = pos.y;
        
        if (e.button === 2) {
            const clickedWire = wires.find(wire => 
                isPointNearWire(x, y, wire.start, wire.end)
            );
            if (clickedWire) {
                removeWire(clickedWire);
                simulateCircuit();
                drawCircuit();
                return;
            }
        }

        const nearestPort = findNearestPort(x, y);
        
        if (nearestPort) {
            wireStart = nearestPort;
            tempWire = { start: { x: nearestPort.x + 5, y: nearestPort.y + 5 }, end: null };
        } else {
            const clickedComponent = components.find(c => c.isPointInside(x, y));
            if (clickedComponent) {
                if (e.button === 2 && clickedComponent instanceof InputNode) {
                    clickedComponent.toggle();
                    simulateCircuit();
                } else {
                    draggingComponent = clickedComponent;
                    dragOffset = { x: x - clickedComponent.x, y: y - clickedComponent.y };
                }
            }
        }
        
        drawCircuit();
    }
});

canvas.addEventListener('mouseup', e => {
    if (isPanning) {
        isPanning = false;
        canvas.style.cursor = 'default';
    } else {
        const pos = getMousePos(canvas, e);
        const x = pos.x;
        const y = pos.y;

        if (draggingComponent) {
            draggingComponent = null;
        }
        
        if (wireStart) {
            const nearestPort = findNearestPort(x, y);
            if (nearestPort && nearestPort !== wireStart && nearestPort.isInput !== wireStart.isInput) {
                wires.push({
                    start: {
                        component: wireStart.component,
                        x: wireStart.x + 5,
                        y: wireStart.y + 5,
                        offsetX: wireStart.x - wireStart.component.x + 5,
                        offsetY: wireStart.y - wireStart.component.y + 5
                    },
                    end: {
                        component: nearestPort.component,
                        x: nearestPort.x + 5,
                        y: nearestPort.y + 5,
                        offsetX: nearestPort.x - nearestPort.component.x + 5,
                        offsetY: nearestPort.y - nearestPort.component.y + 5
                    }
                });
                nearestPort.connectedTo = wireStart;
                wireStart.connectedTo = nearestPort;
            }
            
            wireStart = null;
            tempWire = null;
        }
        
        drawCircuit();
        simulateCircuit();
    }
});

canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const pos = getMousePos(canvas, e);
    const delta = -Math.sign(e.deltaY) * 0.1;
    const newZoom = Math.max(0.1, Math.min(5, zoom * (1 + delta)));
    
    offset.x += (pos.x - offset.x / zoom) * (zoom - newZoom);
    offset.y += (pos.y - offset.y / zoom) * (zoom - newZoom);
    zoom = newZoom;

    drawCircuit();
});

canvas.addEventListener('contextmenu', e => e.preventDefault());

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawCircuit();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function isPointNearWire(x, y, start, end) {
    const A = { x: start.x, y: start.y };
    const B = { x: end.x, y: end.y };
    const P = { x, y };

    const distAB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
    const distAP = Math.sqrt(Math.pow(P.x - A.x, 2) + Math.pow(P.y - A.y, 2));
    const distBP = Math.sqrt(Math.pow(P.x - B.x, 2) + Math.pow(P.y - B.y, 2));

    if (distAP + distBP <= distAB + 5) {
        return true;
    }
    return false;
}

drawCircuit();

window.components = components;
window.wires = wires;
window.removeWire = removeWire;
window.simulateCircuit = simulateCircuit;