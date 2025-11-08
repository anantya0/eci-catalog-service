import { v4 as uuidv4 } from 'uuid';

export const validateProduct = (productData) => {
  const errors = [];
  
  if (!productData.sku || typeof productData.sku !== 'string') {
    errors.push('SKU is required and must be a string');
  }
  
  if (!productData.name || typeof productData.name !== 'string') {
    errors.push('Name is required and must be a string');
  }
  
  if (!productData.price || typeof productData.price !== 'number' || productData.price <= 0) {
    errors.push('Price is required and must be a positive number');
  }
  
  if (productData.category && typeof productData.category !== 'string') {
    errors.push('Category must be a string');
  }
  
  return errors;
};

export const validateUUID = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const bankersRound = (value, decimals = 2) => {
  const factor = Math.pow(10, decimals);
  const rounded = Math.round(value * factor);
  return rounded / factor;
};