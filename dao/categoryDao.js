import db from '../config/database.js';

export const getAllCategories = async () => {
  const [rows] = await db.execute('SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND deleted = false');
  return rows.map(row => ({ name: row.category }));
};