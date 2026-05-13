const express = require('express');
const router = express.Router();
const { register, login, getMe, getNotifications, markNotificationAsRead, updateAvatar } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { registerValidationRules, validate } = require('../middlewares/validator');
const upload = require('../middlewares/uploadMiddleware');

router.post('/register', registerValidationRules(), validate, register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id', protect, markNotificationAsRead);
router.put('/avatar', protect, upload.single('avatar'), updateAvatar);

module.exports = router;
