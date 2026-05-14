const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');
const { aiLimiter } = require('../middlewares/rateLimitMiddleware');

// Route protégée pour l'analyse des symptômes
router.post('/analyze-symptoms', protect, aiLimiter, aiController.analyzeSymptoms);

module.exports = router;
