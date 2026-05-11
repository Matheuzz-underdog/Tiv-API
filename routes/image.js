'use strict';

const express = require('express');
const router  = express.Router();

const { uploadFile, uploadUrl } = require('../middlewares/upload');
const { validate }              = require('../middlewares/validate');
const { renderImage }           = require('../controllers/imageController');

// La cadena de middlewares es lo que define el flujo completo:
//
//  uploadFile → validate → renderImage
//  uploadUrl  → validate → renderImage
//
// Si cualquier middleware llama a next(err) o res.json({error}), la cadena se corta.

// POST /api/image/render
// Body: multipart/form-data con campo "image"
// Query: ?mode=rgb&format=png&columns=80&cellSize=8&brightness=0
router.post('/render', uploadFile, validate, renderImage);

// POST /api/image/render/url
// Body: JSON { "url": "https://..." }
// Query: mismos parámetros que arriba
router.post('/render/url', uploadUrl, validate, renderImage);

module.exports = router;