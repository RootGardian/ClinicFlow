const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const auditLog = require('../middlewares/auditMiddleware');

// Créer une ordonnance (Seulement Docteur)
router.post('/', protect, authorize('doctor'), auditLog('CREATE_PRESCRIPTION'), prescriptionController.createPrescription);

// Télécharger une ordonnance (Docteur et Patient)
router.get('/:id/download', protect, auditLog('DOWNLOAD_PRESCRIPTION_PDF'), prescriptionController.downloadPrescriptionPDF);

module.exports = router;
