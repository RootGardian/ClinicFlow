const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const logger = require('../utils/logger');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await prisma.user.findUnique({ 
        where: { id: decoded.id },
        select: { id: true, role: true, email: true }
      });

      next();
    } catch (error) {
      res.status(401).json({ message: 'Non autorisé, token invalide.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Non autorisé, pas de token.' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      logger.warn({
        event: 'ACCESS_DENIED',
        user_id: req.user.id,
        required_roles: roles,
        user_role: req.user.role,
        resource: req.originalUrl,
        ip: req.ip
      });
      return res.status(403).json({ 
        message: `Le rôle ${req.user.role} n'est pas autorisé à accéder à cette route.` 
      });
    }
    next();
  };
};
