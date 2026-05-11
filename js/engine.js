class WireChexEngine {
  constructor() {
    this.devices = [];
    this.wires = [];
    this.gridRows = 20;
    this.gridCols = 10;
    this.zoomLevel = 1;
    this.showGrid = true;
    this.showLabels = true;
    this.svg = null;
    this.nextId = 1;
  }

  addDevice(data) {
    const device = {
      id: data.id || `dev-${this.nextId++}`,
      name: data.name || data.id || 'Device',
      ports: data.ports || 4,
      x: data.x || 150,
      y: data.y || 150,
      color: data.color || '#22c7b0',
      side: data.side || 'left',
      location: data.location || '',
      width: 140,
      height: 90
    };
    this.devices.push(device);
    return device;
  }

  removeDevice(id) {
    this.devices = this.devices.filter(d => d.id !== id);
    this.wires = this.wires.filter(w => w.from !== id && w.to !== id);
  }

  addWire(fromId, fromPort, toId, toPort, color = '#ef4444') {
    this.wires.push({ from: fromId, fromPort, to: toId, toPort, color });
  }

  getDevice(id) {
    return this.devices.find(d => d.id === id);
  }

  getPortPosition(device, portIndex) {
    const { x, y, width, height, side } = device;
    const portSpacing = height / (device.ports + 1);
    const portY = y + portSpacing * (portIndex + 1);
    
    if (side === 'left') {
      return { x: x + 12, y: portY };
    } else {
      return { x: x + width - 12, y: portY };
    }
  }

  draw() {
    if (!this.svg) return;
    this.svg.innerHTML = '';

    const vb = this.svg.getAttribute('viewBox').split(' ').map(Number);
    const [vx, vy, vw, vh] = vb;

    // Background
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("x", vx);
    bg.setAttribute("y", vy);
    bg.setAttribute("width", vw);
    bg.setAttribute("height", vh);
    bg.setAttribute("fill", "#f8fafc");
    this.svg.appendChild(bg);

    // Grid
    if (this.showGrid) {
      const gridGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      gridGroup.setAttribute("stroke", "#e2e8f0");
      gridGroup.setAttribute("stroke-width", "1.5");
      
      const cellW = vw / this.gridCols;
      const cellH = vh / this.gridRows;
      
      for (let c = 0; c <= this.gridCols; c++) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", vx + c * cellW);
        line.setAttribute("y1", vy);
        line.setAttribute("x2", vx + c * cellW);
        line.setAttribute("y2", vy + vh);
        gridGroup.appendChild(line);
      }
      
      for (let r = 0; r <= this.gridRows; r++) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", vx);
        line.setAttribute("y1", vy + r * cellH);
        line.setAttribute("x2", vx + vw);
        line.setAttribute("y2", vy + r * cellH);
        gridGroup.appendChild(line);
      }
      this.svg.appendChild(gridGroup);
    }

    // Devices
    this.devices.forEach(device => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("data-device-id", device.id);
      
      // Device box
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", device.x);
      rect.setAttribute("y", device.y);
      rect.setAttribute("width", device.width);
      rect.setAttribute("height", device.height);
      rect.setAttribute("rx", "12");
      rect.setAttribute("ry", "12");
      rect.setAttribute("fill", "#ffffff");
      rect.setAttribute("stroke", device.color);
      rect.setAttribute("stroke-width", "4");
      rect.style.cursor = "pointer";
      rect.onclick = () => showDeviceInspector(device.id);
      g.appendChild(rect);

      // Port labels + circles
      for (let i = 0; i < device.ports; i++) {
        const pos = this.getPortPosition(device, i);
        const portLabel = device.id + (i + 1);
        
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pos.x);
        circle.setAttribute("cy", pos.y);
        circle.setAttribute("r", "6");
        circle.setAttribute("fill", "#64748b");
        circle.style.cursor = "pointer";
        g.appendChild(circle);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", pos.x + (device.side === 'left' ? 14 : -14));
        text.setAttribute("y", pos.y + 4);
        text.setAttribute("font-size", "11");
        text.setAttribute("fill", "#475569");
        text.setAttribute("text-anchor", device.side === 'left' ? "start" : "end");
        text.textContent = portLabel;
        g.appendChild(text);
      }

      // Device name
      const nameText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      nameText.setAttribute("x", device.x + device.width / 2);
      nameText.setAttribute("y", device.y + 22);
      nameText.setAttribute("font-size", "13");
      nameText.setAttribute("font-weight", "600");
      nameText.setAttribute("fill", device.color);
      nameText.setAttribute("text-anchor", "middle");
      nameText.textContent = device.name;
      g.appendChild(nameText);

      this.svg.appendChild(g);
    });

    // Wires
    this.wires.forEach(wire => {
      const fromDev = this.getDevice(wire.from);
      const toDev = this.getDevice(wire.to);
      if (!fromDev || !toDev) return;

      const fromPos = this.getPortPosition(fromDev, wire.fromPort - 1);
      const toPos = this.getPortPosition(toDev, wire.toPort - 1);

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      
      // Nice curved routing
      const midX = (fromPos.x + toPos.x) / 2;
      const d = `M ${fromPos.x} ${fromPos.y} Q ${midX} ${fromPos.y} ${toPos.x} ${toPos.y}`;
      
      path.setAttribute("d", d);
      path.setAttribute("stroke", wire.color);
      path.setAttribute("stroke-width", "4.5");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-linecap", "round");
      path.style.cursor = "pointer";
      this.svg.appendChild(path);
    });
  }
}