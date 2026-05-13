const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir les fichiers statiques du build Vite
app.use(express.static(path.join(__dirname, 'dist')));

// Toute route non-fichier renvoie index.html (SPA catch-all)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend servi sur le port ${PORT}`);
});
