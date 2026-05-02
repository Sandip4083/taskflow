import { Router } from 'express';
import { getOverview, getProductivity } from '../controllers/analyticsController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.get('/overview', getOverview);
router.get('/productivity', getProductivity);

export default router;
