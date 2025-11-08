import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const getAllProducts = async (page = 1, limit = 10, category) => {
  try {
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 10, 100); // Max 100 items
    const offset = (pageNum - 1) * limitNum;
    
    let query = 'SELECT * FROM products WHERE is_active = true AND deleted = false';
    const params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ` LIMIT ${limitNum} OFFSET ${offset}`;
    
    const [rows] = await db.query(query, params);
    return rows;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
};

export const getProductById = async (id) => {
  try {
    const [rows] = await db.execute('SELECT * FROM products WHERE product_id = ? AND deleted = false', [id]);
    return rows[0];
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
};

export const createProduct = async (productData) => {
  try {
    const { sku, name, category, price } = productData;
    const productId = uuidv4();
    
    await db.execute(
      'INSERT INTO products (product_id, sku, name, category, price) VALUES (?, ?, ?, ?, ?)',
      [productId, sku, name, category, price]
    );
    
    return getProductById(productId);
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Product with this SKU already exists');
    }
    throw new Error(`Failed to create product: ${error.message}`);
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const { sku, name, category, price, is_active } = productData;
    
    const [result] = await db.execute(
      'UPDATE products SET sku = ?, name = ?, category = ?, price = ?, is_active = ? WHERE product_id = ? AND deleted = false',
      [sku, name, category, price, is_active, id]
    );
    
    if (result.affectedRows === 0) return null;
    return getProductById(id);
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Product with this SKU already exists');
    }
    throw new Error(`Failed to update product: ${error.message}`);
  }
};

export const deleteProduct = async (id) => {
  try {
    const [result] = await db.execute('UPDATE products SET deleted = true WHERE product_id = ? AND deleted = false', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error(`Failed to delete product: ${error.message}`);
  }
};

export const searchProducts = async (query, category, page = 1, limit = 10) => {
  try {
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 10, 100);
    const offset = (pageNum - 1) * limitNum;
    
    let sql = 'SELECT * FROM products WHERE is_active = true AND deleted = false';
    const params = [];
    
    if (query) {
      sql += ' AND (name LIKE ? OR sku LIKE ?)';
      params.push(`%${query}%`, `%${query}%`);
    }
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    sql += ` LIMIT ${limitNum} OFFSET ${offset}`;
    
    const [rows] = await db.query(sql, params);
    return rows;
  } catch (error) {
    console.error('Error searching products:', error);
    throw new Error(`Failed to search products: ${error.message}`);
  }
};