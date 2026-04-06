import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireRole } from '../../middleware/requireRole';
import { getSummary, getByCategory, getTrends, getRecentActivity } from './dashboard.controller';

const router = Router();

router.use(authenticate, requireRole('analyst', 'admin'));

router.get('/summary', getSummary);
router.get('/by-category', getByCategory);
router.get('/trends', getTrends);
router.get('/recent', getRecentActivity);

export default router;