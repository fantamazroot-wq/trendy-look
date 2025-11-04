// === БАЗА ДАНИХ ===
const db = {
  get: (k) => JSON.parse(localStorage.getItem(k) || '[]'),
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

let products = db.get('products') || [];
let categories = db.get('categories') || [
  { id: 'men', name: 'Одяг чоловікам', sub: ['jacket', 'suit', 'sweater'] },
  { id: 'women', name: 'Одяг жінкам', sub: ['jacket', 'dress'] }
];

// === ЗБЕРЕГТИ В JSON ===
function saveToJSON() {
  const data = JSON.stringify(products, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products.json';
  a.click();
}

// === ЗАВАНТАЖИТИ З JSON ===
function loadFromJSON(file) {
  const reader = new FileReader();
  reader.onload = () => {
    products = JSON.parse(reader.result);
    db.set('products', products);
    renderAdmin();
    alert('Товари завантажено з JSON!');
  };
  reader.readAsText(file);
}

// === ДОДАТИ ТОВАР ===
async function saveProduct() {
  const id = document.getElementById('form').dataset.id || Date.now().toString();
  const name = document.getElementById('name').value.trim();
  const price = document.getElementById('price').value;
  const colors = document.getElementById('colors').value.split(',').map(c => c.trim()).filter(c => c);
  const sizes = document.getElementById('sizes').value.split(',').map(s => s.trim()).filter(s => s);

  if (!name || !price || colors.length === 0 || sizes.length === 0) {
    return alert('Заповніть обов’язкові поля!');
  }

  const files = document.getElementById('images').files;
  let images = [];
  for (let file of files) {
    const base64 = await new Promise(r => {
      const reader = new FileReader();
      reader.onload = () => r(reader.result);
      reader.readAsDataURL(file);
    });
    images.push(base64);
  }

  if (document.getElementById('form').dataset.id) {
    const old = products.find(p => p.id === id);
    images = images.length ? images : (old.images || []);
  }

  const product = {
    id, name, price,
    description: document.getElementById('desc').value,
    category: document.getElementById('catSelect').value,
    colors, sizes,
    sizeChart: document.getElementById('sizeChart').value,
    images
  };

  if (document.getElementById('form').dataset.id) {
    products = products.map(p => p.id === id ? product : p);
  } else {
    products.push(product);
  }

  db.set('products', products);
  hideForm();
  renderAdmin();
  saveToJSON(); // ← АВТОМАТИЧНО ЗБЕРІГАЄ В JSON
  alert('Товар збережено! Завантаж products.json і додай на GitHub!');
}

// === ІНШІ ФУНКЦІЇ (без змін) ===
function renderCategoriesSelect() { /* ... */ }
function addCategory() { /* ... */ }
function showForm(id = null) { /* ... */ }
function hideForm() { document.getElementById('form').style.display = 'none'; }
function deleteProduct(id) { if (confirm('Видалити?')) { products = products.filter(p => p.id !== id); db.set('products', products); renderAdmin(); } }
function renderAdmin() { /* ... */ }
function exportData() { saveToJSON(); }
function importData(e) { loadFromJSON(e.target.files[0]); }
function clearAll() { if (confirm('ОЧИСТИТИ ВСЕ?')) { localStorage.clear(); location.reload(); } }

// ІНІТ
renderCategoriesSelect();
renderAdmin();
