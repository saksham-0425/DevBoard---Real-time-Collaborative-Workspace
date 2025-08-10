import express from 'express';
import { register } from '../controllers/auth.controller.js';
import { login } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

export default router;
