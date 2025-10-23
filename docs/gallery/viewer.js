const metadataUrl = new URL('../../megazion_gems_enft.json', import.meta.url);

const galleryEl = document.querySelector('#gallery');
const template = document.querySelector('#gem-card-template');
const categoryFilter = document.querySelector('#category-filter');
const searchInput = document.querySelector('#search-input');
const viewer = document.querySelector('#viewer');
const viewerClose = document.querySelector('#viewer-close');
const viewerCanvas = document.querySelector('#viewer-canvas');
const viewerTitle = document.querySelector('#viewer-title');
const viewerCode = document.querySelector('#viewer-code');
const viewerJson = document.querySelector('#viewer-json');

let gems = [];
let filtered = [];
let animationFrame;
let rotation = 0;

async function loadMetadata() {
  const response = await fetch(metadataUrl);
  if (!response.ok) {
    throw new Error(`Failed to load metadata: ${response.status}`);
  }
  return response.json();
}

function buildCategoryFilter(items) {
  const categories = [...new Set(items.map((item) => item.properties?.category).filter(Boolean))];
  categories.sort();
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.append(option);
  });
}

function glyphForCategory(category = '') {
  if (category.includes('Core')) return '⚙️';
  if (category.includes('Defense')) return '🛡️';
  if (category.includes('Council')) return '🏛️';
  if (category.includes('Cosmic')) return '🌀';
  if (category.includes('Memory')) return '🧠';
  if (category.includes('Wave')) return '🌊';
  return '💠';
}

function renderMetadataList(dl, entry) {
  dl.innerHTML = '';
  const rows = [
    ['Category', entry.properties?.category],
    ['Ceremonial Role', entry.properties?.ceremonial_role],
    ['Elemental', `${entry.properties?.elemental_coding?.primary || ''} → ${entry.properties?.elemental_coding?.secondary || ''}`],
    ['Activated Sectors', (entry.properties?.activated_sectors || []).join(', ')],
    ['Registry Pointer', entry.properties?.registry_pointer]
  ];

  rows.forEach(([label, value]) => {
    if (!value) return;
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    dl.append(dt, dd);
  });
}

function createCard(entry, index) {
  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector('.card');
  const img = fragment.querySelector('img');
  const glyph = fragment.querySelector('.glyph');
  const title = fragment.querySelector('.card-title');
  const codeEl = fragment.querySelector('.sovereign-code');
  const description = fragment.querySelector('.card-description');
  const metadataList = fragment.querySelector('.metadata');
  const button = fragment.querySelector('.viewer-button');

  const imageUrl = entry.image?.replace('ipfs://', 'https://ipfs.io/ipfs/');
  img.src = imageUrl;
  img.alt = `${entry.name} glyph`;
  glyph.textContent = glyphForCategory(entry.properties?.category);
  title.textContent = entry.name;
  codeEl.textContent = entry.properties?.sovereign_code || `GEM-${index + 1}`;
  description.textContent = entry.description;
  renderMetadataList(metadataList, entry);

  function openViewer() {
    showViewer(entry);
  }

  button.addEventListener('click', openViewer);
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openViewer();
    }
  });

  galleryEl.append(fragment);
}

function renderGallery(items) {
  galleryEl.innerHTML = '';
  items.forEach(createCard);
}

function applyFilters() {
  const categoryValue = categoryFilter.value?.toLowerCase() || '';
  const query = searchInput.value?.toLowerCase() || '';

  filtered = gems.filter((entry) => {
    const category = entry.properties?.category?.toLowerCase() || '';
    const sovereign = entry.properties?.sovereign_code?.toLowerCase() || '';
    const role = entry.properties?.ceremonial_role?.toLowerCase() || '';
    const name = entry.name?.toLowerCase() || '';
    const matchesCategory = !categoryValue || category.includes(categoryValue);
    const text = `${name} ${sovereign} ${role}`;
    const matchesQuery = !query || text.includes(query);
    return matchesCategory && matchesQuery;
  });

  renderGallery(filtered);
}

function resizeCanvas() {
  const rect = viewerCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  viewerCanvas.width = rect.width * dpr;
  viewerCanvas.height = rect.height * dpr;
}

function drawGemFrame(context, entry) {
  const { width, height } = viewerCanvas;
  context.clearRect(0, 0, width, height);
  context.save();
  context.translate(width / 2, height / 2);
  const radius = Math.min(width, height) * 0.35;
  const sides = 6;
  const step = (Math.PI * 2) / sides;
  context.beginPath();
  for (let i = 0; i <= sides; i += 1) {
    const angle = rotation + step * i;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.72;
    if (i === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  const gradient = context.createLinearGradient(-radius, -radius, radius, radius);
  gradient.addColorStop(0, 'rgba(143, 233, 255, 0.2)');
  gradient.addColorStop(1, 'rgba(143, 233, 255, 0.65)');
  context.fillStyle = gradient;
  context.strokeStyle = 'rgba(143, 233, 255, 0.85)';
  context.lineWidth = Math.max(2, radius * 0.08);
  context.fill();
  context.stroke();

  context.fillStyle = 'rgba(255, 255, 255, 0.8)';
  context.font = `${Math.max(28, radius * 0.3)}px "Inter", sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(entry.properties?.sovereign_code || 'Ω48', 0, 0);
  context.restore();
}

function animate(entry) {
  const context = viewerCanvas.getContext('2d');
  rotation += 0.01;
  drawGemFrame(context, entry);
  animationFrame = requestAnimationFrame(() => animate(entry));
}

function showViewer(entry) {
  viewer.hidden = false;
  viewerTitle.textContent = entry.name;
  viewerCode.textContent = entry.properties?.sovereign_code || '';
  viewerJson.textContent = JSON.stringify(entry, null, 2);
  resizeCanvas();
  cancelAnimationFrame(animationFrame);
  animate(entry);
}

function closeViewer() {
  viewer.hidden = true;
  cancelAnimationFrame(animationFrame);
}

window.addEventListener('resize', resizeCanvas);
viewerClose.addEventListener('click', closeViewer);
viewer.addEventListener('click', (event) => {
  if (event.target === viewer) {
    closeViewer();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !viewer.hidden) {
    closeViewer();
  }
});

categoryFilter.addEventListener('change', applyFilters);
searchInput.addEventListener('input', applyFilters);

loadMetadata()
  .then((data) => {
    gems = data;
    buildCategoryFilter(gems);
    applyFilters();
  })
  .catch((error) => {
    galleryEl.innerHTML = `<p class="error">${error.message}</p>`;
  });
