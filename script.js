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
db.set('categories', categories); // ЗБЕРІГАЄМО КАТЕГОРІЇ
db.set('products', products);     // ЗБЕРІГАЄМО ТОВАРИ

let cart = db.get('cart') || [];

// === ЕЛЕМЕНТИ ===
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const categoriesList = document.getElementById('categoriesList');
const productsGrid = document.getElementById('productsGrid');
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const cartCount = document.getElementById('cartCount');

// === МЕНЮ ===
menuBtn.onclick = () => sidebar.classList.toggle('active');
document.querySelector('.close-btn').onclick = () => sidebar.classList.remove('active');

function renderCategories() {
  categoriesList.innerHTML = categories.map(cat => `
    <div>
      <a href="#" data-cat="${cat.id}">${cat.name}</a>
      <div class="subcat" id="sub-${cat.id}"></div>
    </div>
  `).join('');

  document.querySelectorAll('[data-cat]').forEach(link => {
    link.onclick = (e) => {
      e.preventDefault();
      const sub = document.getElementById('sub-' + link.dataset.cat);
      sub.classList.toggle('active');
      sub.innerHTML = categories.find(c => c.id === link.dataset.cat).sub.map(s => `
        <a href="#" data-sub="${s}">${s}</a>
      `).join('');
    };
  });

  document.querySelectorAll('[data-sub]').forEach(link => {
    link.onclick = (e) => {
      e.preventDefault();
      loadProducts(link.dataset.sub);
    };
  });
}

// === ТОВАРИ ===
function loadProducts(filter = '') {
  let filtered = products;
  if (filter) {
    filtered = products.filter(p => 
      p.category === filter || 
      categories.find(c => c.sub.includes(filter))?.id === p.category
    );
  }
  renderProducts(filtered);
}

function renderProducts(list) {
  if (list.length === 0) {
    productsGrid.innerHTML = '<p style="text-align:center; color:#777; padding:2rem;">Товари відсутні</p>';
    return;
  }

  productsGrid.innerHTML = list.map(p => `
    <div class="product-card">
      <img src="${p.images[0] || 'https://via.placeholder.com/300'}" alt="${p.name}" style="height:300px; object-fit:cover;">
      <div class="product-info">
        <h3 style="font-size:1.1rem; margin-bottom:0.5rem;">${p.name}</h3>
        <div class="sizes">
          ${p.sizes.map(s => `<span>${s}</span>`).join('')}
        </div>
        <div class="price">${p.price} грн</div>
        <button class="btn" onclick="viewProduct('${p.id}')">Детальніше</button>
      </div>
    </div>
  `).join('');
}

function viewProduct(id) {
  localStorage.setItem('currentProduct', id);
  location.href = 'product.html';
}

// === КОШИК ===
function updateCart() {
  cartCount.textContent = cart.length;
  db.set('cart', cart);

  const items = document.getElementById('cartItems');
  if (!items) return;

  items.innerHTML = cart.map((item, i) => `
    <div style="display:flex; justify-content:space-between; margin:1rem 0; align-items:center; padding:0.5rem; border-bottom:1px solid #eee;">
      <img src="${item.images[0]}" style="width:50px; height:50px; object-fit:cover; border-radius:6px;">
      <div style="flex:1; margin-left:1rem;">
        <div style="font-weight:600;">${item.name}</div>
        <small>${item.selectedSize} • ${item.price} грн</small>
      </div>
      <button onclick="cart.splice(${i},1); updateCart();" style="color:red; background:none; border:none; font-size:1.2rem;">×</button>
    </div>
  `).join('') || '<p style="text-align:center; color:#777;">Кошик порожній</p>';
}

cartBtn.onclick = () => { cartModal.classList.add('active'); updateCart(); };
cartModal.querySelector('.close').onclick = () => cartModal.classList.remove('active');
document.getElementById('clearCart').onclick = () => { cart = []; updateCart(); };

// === ІНІТ ===
renderCategories();
loadProducts();
updateCart();