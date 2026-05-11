'use strict';

const { render } = require('../models/renderer');

async function renderImage(req, res, next) {
  try {
    // El modelo recibe el buffer de imagen y las opciones ya validadas
    const outputBuffer = await render(req.imageBuffer, req.renderOptions);

    const { format } = req.renderOptions;
    const contentType = format === 'jpg' ? 'image/jpeg' : 'image/png';

    res.set('Content-Type', contentType);
    res.set('Content-Length', outputBuffer.length);
    // Opcional: sugiere un nombre de descarga al browser
    res.set('Content-Disposition', `inline; filename="tiv-render.${format}"`);
    res.send(outputBuffer);

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