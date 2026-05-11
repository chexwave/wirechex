let engine;

function initWireChex() {
  engine = new WireChexEngine();
  window.engine = engine;

  const svg = document.getElementById('wirechex-svg');
  engine.svg = svg;

  // Initial demo devices (matching your v6.0 preview)
  engine.addDevice({ id: 'A', name: 'A', ports: 4, x: 120, y: 180, color: '#22c7b0', side: 'left' });
  engine.addDevice({ id: 'B', name: 'B', ports: 4, x: 120, y: 310, color: '#f59e0b', side: 'left' });
  engine.addDevice({ id: 'C', name: 'C', ports: 2, x: 120, y: 440, color: '#8b5cf6', side: 'left' });
  engine.addDevice({ id: 'R', name: 'R', ports: 6, x: 1050, y: 250, color: '#ef4444', side: 'right' });

  // Sample wires (matching your preview)
  engine.addWire('A', 1, 'R', 1, '#ef4444');
  engine.addWire('B', 2, 'R', 2, '#22c7b0');
  engine.addWire('C', 1, 'R', 3, '#f59e0b');

  engine.draw();
  renderDeviceList();
  populateQuickTemplates();
  initWireColorSwatches();
  populateWireSelects();

  // Set default side
  window.selectedSide = 'left';
  document.getElementById('side-left').classList.add('bg-emerald-600');
  document.getElementById('side-right').classList.add('bg-slate-700');

  console.log('%c[WireChex v6.0] Project initialized successfully', 'color:#22c7b0');
}

// Boot the app
window.onload = initWireChex;