const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Toutes les routes admin sont protégées
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', adminController.getStats);
router.get('/doctors', adminController.getDoctors);
router.get('/users', adminController.getAllUsers);
router.patch('/doctors/:doctorId/verify', adminController.toggleVerifyDoctor);
router.patch('/users/:userId/status', adminController.toggleUserStatus);
router.post('/reset-rate-limits', adminController.resetAllRateLimits);
router.post('/unblock-all', adminController.unblockAllUsers);

module.exports = router;
