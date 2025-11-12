// create-test-data.js
const axios = require('axios');

const API_URL = 'http://localhost:3000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoiNGViMzQ0NTgtOWE4ZS00ODNkLTlhMGMtN2E3MGYyNDgyZjgwIiwiaWF0IjoxNzYwOTEyNTQzLCJleHAiOjE3NjA5OTg5NDN9.R7z3RHneGsHC48UOmvx5Bq_I7DVaGNenlxi_IiqM8Kc'; // Reemplazar con el token real

const products = [
  {
    name: "Laptop Gaming",
    description: "Laptop de alta gama con RTX 4080",
    price: 1200.99,
    stock: 25,
    category: "Electronics"
  },
  {
    name: "Mouse Gamer",
    description: "Mouse óptico 16000 DPI",
    price: 79.99,
    stock: 100,
    category: "Electronics"
  },
  {
    name: "Teclado Mecánico",
    description: "Teclado mecánico RGB switches blue",
    price: 150.00,
    stock: 50,
    category: "Electronics"
  },
  {
    name: "Monitor 4K",
    description: "Monitor 27 pulgadas 4K 144Hz",
    price: 599.99,
    stock: 15,
    category: "Electronics"
  },
  {
    name: "Auriculares Wireless",
    description: "Auriculares inalámbricos con cancelación de ruido",
    price: 299.99,
    stock: 30,
    category: "Electronics"
  }
];

async function createProducts() {
  for (const product of products) {
    try {
      const response = await axios.post(`${API_URL}/products`, product, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Producto creado:', response.data.name);
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
    }
  }
}

createProducts();