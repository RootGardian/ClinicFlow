const prisma = require('../config/db');

const auditLog = (action) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
      const statusCode = res.statusCode;
      
      // Enregistrer le log seulement si l'action a réussi ou si c'est une erreur critique
      if (statusCode >= 200 && statusCode < 300) {
        prisma.auditLog.create({
          data: {
            userId: req.user ? req.user.id : null,
            action: action,
            method: req.method,
            path: req.originalUrl,
            ip: req.ip,
            status: statusCode,
            details: JSON.stringify({
              params: req.params,
              query: req.query,
              body: action.includes('READ') ? {} : req.body // Ne pas stocker les données lues, juste l'accès
            })
          }
        }).catch(err => console.error('Audit Log Error:', err));
      }

      originalSend.apply(res, arguments);
    };

    next();
  };
};

module.exports = auditLog;
