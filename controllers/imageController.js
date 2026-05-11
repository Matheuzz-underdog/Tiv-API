'use strict';

const { render } = require('../models/renderer');

async function renderImage(req, res, next) {
  try {
    // P-01: El modelo ahora retorna { canvas, format } en lugar del buffer
    const { canvas, format } = await render(req.imageBuffer, req.renderOptions);

    const contentType = format === 'jpg' ? 'image/jpeg' : 'image/png';

    // P-01: Streaming directo - el cliente recibe datos mientras se codifica
    // Ya no necesitamos Content-Length porque es streaming
    res.set('Content-Type', contentType);
    res.set('Content-Disposition', `inline; filename="tiv-render.${format}"`);

    // Crear el stream según el formato y hacer pipe directo a la response
    const stream = format === 'jpg' || format === 'jpeg'
      ? canvas.createJPEGStream({ quality: 0.92 })
      : canvas.createPNGStream();

    stream.pipe(res);

    // Manejar errores del stream
    stream.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error al generar la imagen' });
      } else {
        res.end();
      }
    });

  } catch (err) {
    // Sharp lanza errores específicos cuando la imagen es corrupta o inválida
    const isImageError =
      err.message.includes('unsupported image format') ||
      err.message.includes('Input buffer') ||
      err.message.includes('bad image');

    if (isImageError) {
      return res.status(400).json({
        error: 'No se pudo procesar la imagen. Verificá que el archivo no esté corrupto.',
        detail: err.message,
      });
    }

    // Cualquier otro error inesperado va al manejador global de Express
    next(err);
  }
}

module.exports = { renderImage };