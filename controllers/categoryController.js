import * as categoryDao from '../dao/categoryDao.js';
import { logError } from '../utils/logger.js';

export const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryDao.getAllCategories();
    res.json(categories);
  } catch (error) {
    logError(error, req);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};