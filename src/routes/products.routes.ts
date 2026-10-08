import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  changePrice
} from '../controllers/products.controller.js';

const router = Router();

router.get('/getAll', getAllProducts);
router.get('/getById/:id', getProductById);
router.post('/create', createProduct);
router.put('/update/:id', updateProduct);
router.delete('/delete/:id', deleteProduct);
router.patch('/change-price/:id', changePrice);

export default router;