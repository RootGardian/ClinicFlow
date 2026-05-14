const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Déterminer le dossier en fonction du champ du formulaire
    let dir = path.join(__dirname, '../../uploads/patient_docs');
    if (file.fieldname === 'avatar') {
        dir = path.join(__dirname, '../../uploads/avatars');
    } else if (file.fieldname === 'prescription') {
        dir = path.join(__dirname, '../../uploads/prescriptions');
    }

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // 1. Détection de double extension (Sécurité contre l'exécution de scripts cachés)
    if (file.originalname.split('.').length > 2) {
      return cb(new Error('Double extension détectée. Téléchargement refusé pour des raisons de sécurité.'));
    }

    // 2. Validation stricte du type MIME et de l'extension
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Format de fichier non autorisé (Seuls JPG, PNG et PDF sont acceptés).'));
    }
  }
});

module.exports = upload;
