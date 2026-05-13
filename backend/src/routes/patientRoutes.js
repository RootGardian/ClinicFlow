const express = require('express');
const router = express.Router();
const { 
  getPatientMedicalInfo, 
  updatePatientMedicalInfo, 
  addMedicalDocument,
  getSecureDocument,
  deleteMedicalDocument,
  bookAppointment,
  getPatientAppointments,
  deleteAppointment
} = require('../controllers/patientController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const auditLog = require('../middlewares/auditMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Toutes les routes patients nécessitent d'être connecté en tant que patient
router.use(protect);
router.use(authorize('patient'));

router.get('/medical-info', auditLog('READ_MEDICAL_INFO'), getPatientMedicalInfo);
router.put('/medical-info', auditLog('UPDATE_MEDICAL_INFO'), updatePatientMedicalInfo);
router.post('/documents', auditLog('UPLOAD_DOC'), upload.single('file'), addMedicalDocument);
router.delete('/documents/:id', auditLog('DELETE_DOC'), deleteMedicalDocument);
router.get('/documents/:filename', auditLog('READ_SENSITIVE_DOC'), getSecureDocument);
router.get('/appointments', getPatientAppointments);
router.post('/appointments', bookAppointment);
router.delete('/appointments/:id', deleteAppointment);

module.exports = router;
