'use strict';

const multer = require('multer');
const axios  = require('axios');

// Multer en memoria: no toca el disco, el archivo vive como Buffer en req.file.buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB máximo
  fileFilter(req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error(`Tipo de archivo no soportado: ${file.mimetype}`));
  },
});

// Middleware para archivo: espera campo "image" en multipart/form-data
// Normaliza a req.imageBuffer para que el controlador no sepa la diferencia
function uploadFile(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({
        error: 'No se recibió ningún archivo. Campo multipart esperado: "image"',
      });
    }
    req.imageBuffer = req.file.buffer;
    next();
  });
}

// Middleware para URL: descarga la imagen con axios y normaliza a req.imageBuffer
async function uploadUrl(req, res, next) {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'El campo "url" es requerido en el body JSON' });
  }

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000,
      maxContentLength: 10 * 1024 * 1024,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; tiv-API/1.0)',
      },
    });

    const contentType = response.headers['content-type'] || '';
    if (!contentType.startsWith('image/')) {
      return res.status(400).json({
        error: `La URL no apunta a una imagen. Content-Type recibido: "${contentType}"`,
      });
    }

    req.imageBuffer = Buffer.from(response.data);
    next();
  } catch (err) {
    // Error HTTP de la URL remota
    if (err.response) {
      return res.status(400).json({
        error: `No se pudo descargar la imagen: HTTP ${err.response.status}`,
      });
    }
    // Timeout, DNS, conexión rechazada, etc.
    return res.status(400).json({
      error: `Error al descargar la imagen: ${err.message}`,
    });
  }
}

module.exports = { uploadFile, uploadUrl };