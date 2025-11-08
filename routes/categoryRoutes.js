import express from 'express';
import * as categoryController from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', categoryController.getAllCategories);

export default router;