function populateQuickTemplates() {
  const container = document.getElementById('quick-templates');
  if (!container) return;
  container.innerHTML = '';

  const templates = [
    { name: 'GARMIN 8612', ports: 4, color: '#22c7b0', side: 'left' },
    { name: 'GMR 18', ports: 3, color: '#f59e0b', side: 'left' },
    { name: 'GHC 50', ports: 2, color: '#8b5cf6', side: 'right' },
    { name: 'BUSBAR', ports: 6, color: '#ef4444', side: 'right' }
  ];

  templates.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded-2xl border border-slate-700';
    btn.textContent = t.name;
    btn.onclick = () => {
      const nameInput = document.getElementById('new-device-name');
      const portsSelect = document.getElementById('new-device-ports');
      const colorPreview = document.getElementById('color-preview');

      if (nameInput) nameInput.value = t.name;
      if (portsSelect) portsSelect.value = t.ports;
      if (colorPreview) colorPreview.style.background = t.color;

      window.selectedColor = t.color;
      window.selectedSide = t.side;
    };
    container.appendChild(btn);
  });
}

function showDeviceInspector(deviceId) {
  const device = window.engine.getDevice(deviceId);
  if (!device) return;

  const modal = document.getElementById('inspector-modal');
  modal.innerHTML = `
    <div class="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md mx-4 overflow-hidden">
      <div class="px-5 pt-5 pb-3 border-b border-slate-700 flex items-center justify-between">
        <div>
          <div class="font-semibold text-lg">${device.name}</div>
          <div class="text-xs text-emerald-400">${device.location || 'No location set'}</div>
        </div>
        <div onclick="hideInspector()" class="text-slate-400 hover:text-white cursor-pointer text-2xl">&times;</div>
      </div>

      <div class="p-5 space-y-4">
        <div>
          <div class="text-xs text-slate-400 mb-2">PORTS (${device.ports})</div>
          <div class="grid grid-cols-2 gap-2">
            ${Array.from({length: device.ports}, (_, i) => `
              <div class="bg-slate-800 rounded-2xl p-3 text-sm">
                Port ${i+1} • <span class="text-emerald-400">Connected</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="flex gap-3">
          <button onclick="removeDeviceFromInspector('${device.id}')" 
                  class="flex-1 py-3 bg-red-600/80 hover:bg-red-600 text-white rounded-3xl text-sm font-medium">
            Delete Device
          </button>
          <button onclick="hideInspector()" 
                  class="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-3xl text-sm font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function hideInspector() {
  const modal = document.getElementById('inspector-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function removeDeviceFromInspector(id) {
  window.engine.removeDevice(id);
  window.engine.draw();
  hideInspector();
  renderDeviceList();
}

function renderDeviceList() {
  const container = document.getElementById('device-list');
  if (!container || !window.engine) return;

  container.innerHTML = '';
  const countEl = document.getElementById('device-count');
  if (countEl) countEl.textContent = `${window.engine.devices.length} devices`;

  window.engine.devices.forEach(device => {
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between bg-slate-800 rounded-2xl px-4 py-3 text-sm';
    div.innerHTML = `
      <div class="flex items-center gap-3">
        <div style="background:${device.color}" class="w-3 h-3 rounded-full"></div>
        <div>
          <div class="font-medium">${device.name}</div>
          <div class="text-xs text-slate-400">${device.side.toUpperCase()} • ${device.ports} ports</div>
        </div>
      </div>
      <div onclick="showDeviceInspector('${device.id}')" class="px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded-2xl text-xs cursor-pointer">Inspect</div>
    `;
    container.appendChild(div);
  });
}

function setMountSide(side) {
  window.selectedSide = side;
  document.getElementById('side-left').classList.toggle('bg-emerald-600', side === 'left');
  document.getElementById('side-left').classList.toggle('bg-slate-700', side !== 'left');
  document.getElementById('side-right').classList.toggle('bg-emerald-600', side === 'right');
  document.getElementById('side-right').classList.toggle('bg-slate-700', side !== 'right');
}

function showColorPicker() {
  const modal = document.getElementById('color-modal');
  const options = document.getElementById('color-options');
  options.innerHTML = '';

  const colors = ['#22c7b0', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899', '#14b8a6', '#eab308'];

  colors.forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = 'w-12 h-12 rounded-2xl border border-slate-700 cursor-pointer';
    swatch.style.background = color;
    swatch.onclick = () => {
      window.selectedColor = color;
      document.getElementById('color-preview').style.background = color;
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    };
    options.appendChild(swatch);
  });

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function hideColorPicker() {
  const modal = document.getElementById('color-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function applySelectedColor() {
  // handled in showColorPicker
  hideColorPicker();
}

function addNewDevice() {
  const name = document.getElementById('new-device-name').value || 'New Device';
  const ports = parseInt(document.getElementById('new-device-ports').value);
  const color = window.selectedColor || '#22c7b0';
  const side = window.selectedSide || 'left';
  const location = document.getElementById('new-device-location').value || '';

  const x = side === 'left' ? 120 : 1050;
  const y = 180 + (window.engine.devices.length * 110);

  const newDev = window.engine.addDevice({
    name,
    ports,
    color,
    side,
    location,
    x,
    y
  });

  window.engine.draw();
  renderDeviceList();

  // Clear form
  document.getElementById('new-device-name').value = '';
  document.getElementById('new-device-location').value = '';
}

function toggleGrid() {
  window.engine.showGrid = !window.engine.showGrid;
  window.engine.draw();
  const label = document.getElementById('grid-label');
  if (label) label.textContent = window.engine.showGrid ? 'Grid ON' : 'Grid OFF';
}

function toggleLabels() {
  window.engine.showLabels = !window.engine.showLabels;
  window.engine.draw();
}

function resizeGrid() {
  const rows = parseInt(document.getElementById('grid-rows').value);
  const cols = parseInt(document.getElementById('grid-cols').value);
  window.engine.gridRows = rows;
  window.engine.gridCols = cols;
  window.engine.draw();
}

function zoomIn() {
  window.engine.zoomLevel = Math.min(window.engine.zoomLevel + 0.2, 3);
  document.getElementById('wirechex-svg').style.transform = `scale(${window.engine.zoomLevel})`;
}

function zoomOut() {
  window.engine.zoomLevel = Math.max(window.engine.zoomLevel - 0.2, 0.5);
  document.getElementById('wirechex-svg').style.transform = `scale(${window.engine.zoomLevel})`;
}

function initWireColorSwatches() {
  // Placeholder - can expand later
  console.log('Wire color swatches initialized');
}

function populateWireSelects() {
  // Placeholder for Add Wire dropdowns
  console.log('Wire selects populated');
}

function addWireFromUI() {
  // Placeholder - will be expanded in next iteration
  alert('Wire connection feature coming in next update!');
}

function selectWireColor(color) {
  window.selectedWireColor = color;
}