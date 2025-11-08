import 'dotenv/config';
import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const products = [
  { sku: 'LAPTOP-001', name: 'Gaming Laptop Pro', category: 'Electronics', price: 1299.99 },
  { sku: 'PHONE-001', name: 'Smartphone X', category: 'Electronics', price: 799.99 },
  { sku: 'BOOK-001', name: 'JavaScript Guide', category: 'Books', price: 29.99 },
  { sku: 'SHIRT-001', name: 'Cotton T-Shirt', category: 'Clothing', price: 19.99 },
  { sku: 'CHAIR-001', name: 'Office Chair', category: 'Furniture', price: 199.99 },
  { sku: 'MOUSE-001', name: 'Wireless Mouse', category: 'Electronics', price: 39.99 },
  { sku: 'BOOK-002', name: 'Node.js Handbook', category: 'Books', price: 34.99 },
  { sku: 'JEANS-001', name: 'Blue Jeans', category: 'Clothing', price: 59.99 },
  { sku: 'DESK-001', name: 'Standing Desk', category: 'Furniture', price: 299.99 },
  { sku: 'TABLET-001', name: 'Tablet Pro', category: 'Electronics', price: 499.99 }
];

const seedProducts = async () => {
  const connection = await db.getConnection();
  
  try {
    console.log('Seeding products...');
    
    await connection.beginTransaction();
    
    // Batch insert for better performance
    const values = products.map(product => [
      uuidv4(), product.sku, product.name, product.category, product.price
    ]);
    
    await connection.query(
      'INSERT INTO products (product_id, sku, name, category, price) VALUES ?',
      [values]
    );
    
    await connection.commit();
    console.log(`${products.length} products seeded successfully`);
    process.exit(0);
  } catch (error) {
    await connection.rollback();
    console.error('Error seeding products:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
};

seedProducts();