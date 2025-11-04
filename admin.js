// === БАЗА ДАНИХ ===
const db = {
  get: (k) => JSON.parse(localStorage.getItem(k) || '[]'),
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

// === ЗАВАНТАЖИТИ ДАНІ ===
let products = db.get('products') || [];
let categories = db.get('categories') || [
  { id: 'men', name: 'Одяг чоловікам', sub: ['jacket', 'suit', 'sweater'] },
  { id: 'women', name: 'Одяг жінкам', sub: ['jacket', 'dress'] }
];

// === ВИВЕСТИ КАТЕГОРІЇ В СЕЛЕКТ ===
function renderCategoriesSelect() {
  const select = document.getElementById('catSelect');
  select.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

// === ДОДАТИ КАТЕГОРІЮ ===
function addCategory() {
  const input = document.getElementById('newCat');
  const name = input.value.trim();
  if (!name) return alert('Введіть назву!');
  const id = name.toLowerCase().replace(/\s+/g, '-');
  if (categories.some(c => c.id === id)) return alert('Така категорія вже є!');
  categories.push({ id, name, sub: [] });
  db.set('categories', categories);
  renderCategoriesSelect();
  input.value = '';
}

// === ПОКАЗАТИ ФОРМУ ===
function showForm(id = null) {
  const form = document.getElementById('form');
  form.style.display = 'block';
  renderCategoriesSelect();
  document.getElementById('imagesPreview').innerHTML = '';

  if (id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    document.getElementById('name').value = p.name;
    document.getElementById('desc').value = p.description || '';
    document.getElementById('price').value = p.price;
    document.getElementById('catSelect').value = p.category;
    document.getElementById('colors').value = p.colors.join(', ');
    document.getElementById('sizes').value = p.sizes.join(', ');
    document.getElementById('sizeChart').value = p.sizeChart || '';
    form.dataset.id = id;

    // Попередній перегляд фото
    const preview = document.getElementById('imagesPreview');
    p.images.forEach(img => {
      const div = document.createElement('div');
      div.style = 'position:relative; display:inline-block; margin:5px;';
      div.innerHTML = `<img src="${img}" style="width:80px; height:80px; object-fit:cover; border-radius:8px;">
                       <button onclick="this.parentElement.remove()" style="position:absolute; top:0; right:0; background:red; color:white; border:none; width:20px; height:20px; border-radius:50%; cursor:pointer;">×</button>`;
      preview.appendChild(div);
    });
  } else {
    form.reset();
    delete form.dataset.id;
  }
}

// === СХОВАТИ ФОРМУ ===
function hideForm() {
  document.getElementById('form').style.display = 'none';
}

// === ЗБЕРЕГТИ ТОВАР ===
async function saveProduct() {
  const id = document.getElementById('form').dataset.id || Date.now().toString();
  const name = document.getElementById('name').value.trim();
  const price = document.getElementById('price').value;
  const category = document.getElementById('catSelect').value;
  const colors = document.getElementById('colors').value.split(',').map(c => c.trim()).filter(c => c);
  const sizes = document.getElementById('sizes').value.split(',').map(s => s.trim()).filter(s => s);

  if (!name || !price || colors.length === 0 || sizes.length === 0) {
    return alert('Заповніть обов’язкові поля!');
  }

  // Завантаження фото
  const files = document.getElementById('images').files;
  let images = [];
  for (let file of files) {
    const base64 = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
    images.push(base64);
  }

  // Якщо редагуємо — зберігаємо старі фото
  if (document.getElementById('form').dataset.id) {
    const old = products.find(p => p.id === id);
    images = images.length ? images : (old.images || []);
  }

  const product = {
    id,
    name,
    description: document.getElementById('desc').value,
    price,
    category,
    colors,
    sizes,
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
  alert('Товар збережено!');
}

// === ВИДАЛИТИ ТОВАР ===
function deleteProduct(id) {
  if (!confirm('Видалити товар?')) return;
  products = products.filter(p => p.id !== id);
  db.set('products', products);
  renderAdmin();
}

// === ВИВЕСТИ ТОВАРИ В АДМІНЦІ ===
function renderAdmin() {
  const container = document.getElementById('adminProducts');
  if (products.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#777;">Товари відсутні. Додайте перший!</p>';
    return;
  }
  container.innerHTML = products.map(p => `
    <div style="border:1px solid #eee; padding:1rem; margin:0.5rem 0; border-radius:12px; background:#fff;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="font-size:1.1rem;">${p.name}</strong><br>
          <small style="color:#555;">${p.price} грн • ${p.sizes.join(', ')}</small>
        </div>
        <div>
          <button class="btn" style="background:#333; padding:0.5rem 1rem; font-size:0.9rem; margin-left:0.5rem;" onclick="showForm('${p.id}')">Редагувати</button>
          <button class="btn" style="background:#e74c3c; padding:0.5rem 1rem; font-size:0.9rem;" onclick="deleteProduct('${p.id}')">Видалити</button>
        </div>
      </div>
    </div>
  `).join('');
}

// === ЕКСПОРТ ===
function exportData() {
  const data = { products, categories };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'trendy-look-backup.json';
  a.click();
}

// === ІМПОРТ ===
function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      products = data.products || [];
      categories = data.categories || [];
      db.set('products', products);
      db.set('categories', categories);
      renderAdmin();
      renderCategoriesSelect();
      alert('Дані імпортовано!');
    } catch (err) {
      alert('Помилка імпорту!');
    }
  };
  reader.readAsText(file);
}

// === ОЧИСТИТИ ВСЕ ===
function clearAll() {
  if (confirm('УВАГА! Видалити ВСЕ? Цю дію не можна скасувати!')) {
    localStorage.clear();
    products = [];
    categories = [
      { id: 'men', name: 'Одяг чоловікам', sub: ['jacket', 'suit', 'sweater'] },
      { id: 'women', name: 'Одяг жінкам', sub: ['jacket', 'dress'] }
    ];
    renderAdmin();
    alert('Всі дані очищено!');
  }
}

// === ІНІТ ===
renderCategoriesSelect();
renderAdmin();