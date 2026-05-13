const express = require('express');
const router = express.Router();
const { 
  getDoctorProfile, 
  updateDoctorProfile, 
  setAvailabilities, 
  getDoctorPatients, 
  getDoctorWallet,
  getAllDoctors,
  createPrescription,
  getDoctorAppointments,
  updateAppointmentStatus,
  deleteAppointment
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { doctorProfileValidationRules, validate } = require('../middlewares/validator');

// Route publique pour l'annuaire
router.get('/all', getAllDoctors);

// Toutes les autres routes nécessitent d'être authentifié
router.use(protect);
router.use(authorize('doctor'));

router.get('/profile', getDoctorProfile);
router.put('/profile', doctorProfileValidationRules(), validate, updateDoctorProfile);
router.post('/availabilities', setAvailabilities);
router.get('/patients', getDoctorPatients);
router.get('/wallet', getDoctorWallet);
router.post('/prescription', createPrescription);
router.get('/appointments', getDoctorAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);
router.delete('/appointments/:id', deleteAppointment);

module.exports = router;
