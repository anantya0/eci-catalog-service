import * as productDao from '../dao/productDao.js';
import { logError } from '../utils/logger.js';
import { validateProduct, validateUUID, bankersRound } from '../utils/validation.js';

export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const products = await productDao.getAllProducts(page, limit, category);
    res.json(products);
  } catch (error) {
    logError(error, req);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    if (!validateUUID(req.params.id)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    const product = await productDao.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    logError(error, req);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const validationErrors = validateProduct(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }
    
    // Apply banker's rounding to price
    req.body.price = bankersRound(req.body.price);
    
    const product = await productDao.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    logError(error, req);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'SKU already exists' });
    } else {
      res.status(400).json({ error: 'Bad request', message: error.message });
    }
  }
};

export const updateProduct = async (req, res) => {
  try {
    if (!validateUUID(req.params.id)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    const validationErrors = validateProduct(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }
    
    // Apply banker's rounding to price
    req.body.price = bankersRound(req.body.price);
    
    const product = await productDao.updateProduct(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    logError(error, req);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'SKU already exists' });
    } else {
      res.status(400).json({ error: 'Bad request', message: error.message });
    }
  }
};

export const deleteProduct = async (req, res) => {
  try {
    if (!validateUUID(req.params.id)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    const deleted = await productDao.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(204).send();
  } catch (error) {
    logError(error, req);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { q, category, page = 1, limit = 10 } = req.query;
    const products = await productDao.searchProducts(q, category, page, limit);
    res.json(products);
  } catch (error) {
    logError(error, req);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};