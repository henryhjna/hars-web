import express from 'express';
import { noticeController } from '../controllers/notice.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Public
router.get('/active', noticeController.getActive);

// Admin
router.get('/', authenticate, authorize('admin'), noticeController.getAll);
router.post('/', authenticate, authorize('admin'), noticeController.create);
router.put('/:id', authenticate, authorize('admin'), noticeController.update);
router.delete('/:id', authenticate, authorize('admin'), noticeController.delete);

export default router;
