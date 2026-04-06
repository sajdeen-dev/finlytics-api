import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';
import { getAllUsers, updateUserRole, updateUserStatus } from './users.controller';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/', getAllUsers);
router.patch('/:id/role', updateUserRole);
router.patch('/:id/status', updateUserStatus);

export default router;