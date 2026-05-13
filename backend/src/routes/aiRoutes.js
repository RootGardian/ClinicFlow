const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

// Route protégée pour l'analyse des symptômes
// Route de test sans protection pour diagnostic
router.post('/analyze-symptoms', protect, aiController.analyzeSymptoms);

module.exports = router;
