const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Завантаження товарів
app.get('/api/products', (req, res) => {
  const data = JSON.parse(fs.readFileSync('./data/products.json'));
  res.json(data);
});

// Додавання товару (адмінка)
app.post('/api/products', upload.array('images', 5), (req, res) => {
  const products = JSON.parse(fs.readFileSync('./data/products.json'));
  const newProduct = {
    id: Date.now().toString(),
    ...req.body,
    images: req.files.map(f => `/uploads/${f.filename`)
  };
  products.push(newProduct);
  fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2));
  res.json(newProduct);
});

// Оновлення товару
app.put('/api/products/:id', upload.array('images', 5), (req, res) => {
  let products = JSON.parse(fs.readFileSync('./data/products.json'));
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).send();

  const updated = {
    ...products[index],
    ...req.body,
    images: req.files.length ? req.files.map(f => `/uploads/${f.filename`) : products[index].images
  };
  products[index] = updated;
  fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2));
  res.json(updated);
});

// Видалення
app.delete('/api/products/:id', (req, res) => {
  let products = JSON.parse(fs.readFileSync('./data/products.json'));
  products = products.filter(p => p.id !== req.params.id);
  fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2));
  res.json({ success: true });
});

app.listen(3000, () => {
  console.log('Сервер запущено: http://localhost:3000');
});