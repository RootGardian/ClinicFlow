const express = require('express');
const router = express.Router();
const { getConsultationDetails } = require('../controllers/consultationController');
const { protect } = require('../middlewares/authMiddleware');
const auditLog = require('../middlewares/auditMiddleware');

router.get('/:appointmentId', protect, auditLog('READ_CONSULTATION_DETAILS'), getConsultationDetails);

module.exports = router;
