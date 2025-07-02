const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();

// Crée le dossier uploads s'il n'existe pas
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configuration Multer pour stocker les fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => Date.now() + path.extname(file.originalname)
});
const upload = multer({ storage });

// Sert les fichiers statiques dans /public et /uploads
app.use(express.static('public'));
app.use('/uploads', express.static(uploadDir));

// Route POST pour uploader un fichier (photo ou vidéo)
app.post('/upload', upload.single('media'), (req, res) => {
  if (!req.file) return res.status(400).send('Aucun fichier uploadé');
  res.redirect('/upload.html?success=1');
});

// Route GET pour récupérer les 5 derniers fichiers uploadés
app.get('/latest', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).send('Erreur serveur');
    // Trie par date modif décroissante
    const sorted = files.sort((a, b) =>
      fs.statSync(path.join(uploadDir, b)).mtimeMs - fs.statSync(path.join(uploadDir, a)).mtimeMs
    );
    res.json(sorted.slice(0, 5));
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Serveur actif sur le port ${port}`));
