const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
require('dotenv').config();

const helmet = require('helmet');
const app = express();

// Sécurité OWASP A05: Protection des en-têtes HTTP + CSP
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com", "https://meet.jit.si", "https://meet.ffmuc.net", "https://8x8.vc"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://*.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com", "wss://*.onrender.com", "ws://*.onrender.com"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://meet.jit.si", "https://meet.ffmuc.net", "https://8x8.vc"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      upgradeInsecureRequests: [],
    },
  },
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

// CORS configuration plus restrictive
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.set('io', io);
// Sécurité : Ne pas exposer les documents médicaux statiquement pour respecter la triade CIA
// Seuls les avatars sont publics pour l'interface
app.use('/uploads/avatars', express.static(path.join(__dirname, '../uploads/avatars')));


// Socket.io Logic
io.on('connection', (socket) => {
  console.log('Utilisateur connecté:', socket.id);

  socket.on('join_consultation', (roomId) => {
    socket.join(roomId);
    console.log(`Utilisateur rejoint la salle: ${roomId}`);
    socket.to(roomId).emit('user_joined', { userId: socket.id });
  });

  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté');
  });
});

app.get('/', (req, res) => {
  res.send('API Télémédecine opérationnelle avec Socket.io 🚀');
});

const { apiLimiter } = require('./middlewares/rateLimitMiddleware');
app.use('/api/', apiLimiter);

// Import des routes
console.log(`[${new Date().toLocaleTimeString()}] Initialisation des routes sécurisées...`);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/doctor', require('./routes/doctorRoutes'));
app.use('/api/patient', require('./routes/patientRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/consultation', require('./routes/consultationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/prescription', require('./routes/prescriptionRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: "Erreur de fichier: " + err.message });
  }
  res.status(500).json({ message: err.message || "Erreur serveur inattendue." });
});


server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT} 🛡️ (Sécurisé OWASP)`);
});
