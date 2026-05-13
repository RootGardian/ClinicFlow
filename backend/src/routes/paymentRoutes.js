const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmPayment, getTransactions } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.get('/transactions', protect, getTransactions);

module.exports = router;
