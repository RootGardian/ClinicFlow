const express = require('express');
const rateLimit = require('express-rate-limit');
const app = express();

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10
});

console.log('authLimiter type:', typeof authLimiter);
console.log('authLimiter.store type:', typeof authLimiter.store);
console.log('authLimiter.store.resetAll type:', typeof authLimiter.store.resetAll);

if (authLimiter.store && typeof authLimiter.store.resetAll === 'function') {
    console.log('resetAll is available');
} else {
    console.log('resetAll is NOT available');
}
