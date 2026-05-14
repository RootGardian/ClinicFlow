const express = require('express');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10
});

console.log('Keys of authLimiter:', Object.keys(authLimiter));
console.log('authLimiter prototype:', Object.getPrototypeOf(authLimiter));
