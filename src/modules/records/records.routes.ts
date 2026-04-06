import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';
import { getRecords, createRecord, updateRecord, deleteRecord } from './records.controller';

const router = Router();

router.get('/', authenticate, getRecords);
router.post('/', authenticate, requireRole('admin'), createRecord);
router.patch('/:id', authenticate, requireRole('admin'), updateRecord);
router.delete('/:id', authenticate, requireRole('admin'), deleteRecord);

export default router;