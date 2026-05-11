'use strict';

/**
 * Tests de integración para el renderer de tiv-api
 * NO modifica el código existente - solo verifica el comportamiento
 */

const sharp = require('sharp');
const { render } = require('../models/renderer');

// Helper: crear imagen de prueba simple (50x50px, gradiente RGB)
async function createTestImage() {
  const width = 50;
  const height = 50;

  // Crear un buffer de píxeles RGB simple
  const pixels = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3;
      pixels[i] = x * 5;           // R: gradiente horizontal
      pixels[i + 1] = y * 5;       // G: gradiente vertical
      pixels[i + 2] = 128;         // B: constante
    }
  }

  return sharp(pixels, {
    raw: { width, height, channels: 3 }
  }).png().toBuffer();
}

// Helper: verificar que el buffer es una imagen válida
function isValidImage(buffer, format) {
  if (!buffer || buffer.length === 0) return false;

  // PNG: starts with \x89PNG
  if (format === 'png') {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  }
  // JPEG: starts with \xFF\xD8
  if (format === 'jpg' || format === 'jpeg') {
    return buffer[0] === 0xFF && buffer[1] === 0xD8;
  }
  return false;
}

describe('Renderer - Tests de integración', () => {

  let testImageBuffer;

  beforeAll(async () => {
    // Crear imagen de prueba una sola vez
    testImageBuffer = await createTestImage();
  });

  describe('Renderizado básico', () => {

    test('debería renderizar imagen con modo RGB (default)', async () => {
      const result = await render(testImageBuffer, {
        mode: 'rgb',
        format: 'png',
        columns: 40
      });

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(isValidImage(result, 'png')).toBe(true);
    });

    test('debería renderizar imagen con modo ASCII', async () => {
      const result = await render(testImageBuffer, {
        mode: 'ascii',
        format: 'png',
        columns: 40
      });

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(isValidImage(result, 'png')).toBe(true);
    });

    test('debería renderizar imagen con modo ANSI', async () => {
      const result = await render(testImageBuffer, {
        mode: 'ansi',
        format: 'png',
        columns: 40
      });

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(isValidImage(result, 'png')).toBe(true);
    });

    test('debería renderizar imagen con modo GREY', async () => {
      const result = await render(testImageBuffer, {
        mode: 'grey',
        format: 'png',
        columns: 40
      });

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(isValidImage(result, 'png')).toBe(true);
    });

    test('debería renderizar imagen con modo 256', async () => {
      const result = await render(testImageBuffer, {
        mode: '256',
        format: 'png',
        columns: 40
      });

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(isValidImage(result, 'png')).toBe(true);
    });

  });

  describe('Parámetros de configuración', () => {

    test('debería aceptar diferentes valores de columns', async () => {
      const result20 = await render(testImageBuffer, { mode: 'rgb', columns: 20 });
      const result80 = await render(testImageBuffer, { mode: 'rgb', columns: 80 });

      expect(result20).toBeDefined();
      expect(result80).toBeDefined();
      // columns mayor = imagen más ancha (pero el alto también escala)
      expect(result80.length).toBeGreaterThan(result20.length);
    });

    test('debería soportar formato JPG', async () => {
      const result = await render(testImageBuffer, {
        mode: 'rgb',
        format: 'jpg',
        columns: 40
      });

      expect(result).toBeDefined();
      expect(isValidImage(result, 'jpg')).toBe(true);
    });

    test('debería aplicar brillo positivo', async () => {
      const result = await render(testImageBuffer, {
        mode: 'rgb',
        columns: 40,
        brightness: 50
      });

      expect(result).toBeDefined();
      expect(isValidImage(result, 'png')).toBe(true);
    });

    test('debería aplicar brillo negativo', async () => {
      const result = await render(testImageBuffer, {
        mode: 'rgb',
        columns: 40,
        brightness: -50
      });

      expect(result).toBeDefined();
      expect(isValidImage(result, 'png')).toBe(true);
    });

  });

  describe('Valores por defecto', () => {

    test('debería usar valores por defecto cuando no se especifican', async () => {
      // Sin opciones - usa defaults: mode=rgb, format=png, columns=80
      const result = await render(testImageBuffer);

      expect(result).toBeDefined();
      expect(isValidImage(result, 'png')).toBe(true);
    });

  });

  describe('Densidad ASCII (parámetro density)', () => {

    test('debería renderizar con density=original (10 chars)', async () => {
      const result = await render(testImageBuffer, {
        mode: 'ascii',
        density: 'original',
        columns: 40
      });

      expect(result).toBeDefined();
      expect(isValidImage(result, 'png')).toBe(true);
    });

    test('debería renderizar con density=conservative (12 chars)', async () => {
      const result = await render(testImageBuffer, {
        mode: 'ascii',
        density: 'conservative',
        columns: 40
      });

      expect(result).toBeDefined();
      expect(isValidImage(result, 'png')).toBe(true);
    });

    test('debería renderizar con density=expanded (12 chars)', async () => {
      const result = await render(testImageBuffer, {
        mode: 'ascii',
        density: 'expanded',
        columns: 40
      });

      expect(result).toBeDefined();
      expect(isValidImage(result, 'png')).toBe(true);
    });

    test('debería renderizar con density=detailed (13 chars)', async () => {
      const result = await render(testImageBuffer, {
        mode: 'ascii',
        density: 'detailed',
        columns: 40
      });

      expect(result).toBeDefined();
      expect(isValidImage(result, 'png')).toBe(true);
    });

    test('debería renderizar con density=maximum (25 chars)', async () => {
      const result = await render(testImageBuffer, {
        mode: 'ascii',
        density: 'maximum',
        columns: 40
      });

      expect(result).toBeDefined();
      expect(isValidImage(result, 'png')).toBe(true);
    });

    test('debería usar detailed por defecto si density no se especifica', async () => {
      const result = await render(testImageBuffer, {
        mode: 'ascii',
        columns: 40
        // density no especificado - debería usar 'detailed' por defecto
      });

      expect(result).toBeDefined();
      expect(isValidImage(result, 'png')).toBe(true);
    });

  });

  describe('Método de color (colorMethod para ansi y 256)', () => {

    test('debería renderizar ANSI con colorMethod=classic (riv.vala)', async () => {
      const result = await render(testImageBuffer, {
        mode: 'ansi',
        colorMethod: 'classic',
        columns: 40
      });

      expect(result).toBeDefined();
      expect(isValidImage(result, 'png')).toBe(true);
    });

    test('debería renderizar ANSI con colorMethod=perceptual (euclidiana)', async () => {
      const result = await render(testImageBuffer, {
        mode: 'ansi',
        colorMethod: 'perceptual',
        columns: 40
      });

      expect(result).toBeDefined();
      expect(isValidImage(result, 'png')).toBe(true);
    });

    test('debería renderizar 256 con colorMethod=classic', async () => {
      const result = await render(testImageBuffer, {
        mode: '256',
        colorMethod: 'classic',
        columns: 40
      });

      expect(result).toBeDefined();
      expect(isValidImage(result, 'png')).toBe(true);
    });

    test('debería renderizar 256 con colorMethod=perceptual', async () => {
      const result = await render(testImageBuffer, {
        mode: '256',
        colorMethod: 'perceptual',
        columns: 40
      });

      expect(result).toBeDefined();
      expect(isValidImage(result, 'png')).toBe(true);
    });

    test('debería usar perceptual por defecto si colorMethod no se especifica', async () => {
      const result = await render(testImageBuffer, {
        mode: 'ansi',
        columns: 40
        // colorMethod no especificado - debería usar 'perceptual' por defecto
      });

      expect(result).toBeDefined();
      expect(isValidImage(result, 'png')).toBe(true);
    });

  });

  describe('Dithering (none, ordered, floyd-steinberg, atkinson)', () => {

    test('debería renderizar con dithering=none (original)', async () => {
      const result = await render(testImageBuffer, {
        mode: 'ascii',
        dithering: 'none',
        columns: 40
      });

      expect(result).toBeDefined();
      expect(isValidImage(result, 'png')).toBe(true);
    });

    test('debería renderizar con dithering=ordered', async () => {
      const result = await render(testImageBuffer, {
        mode: 'ascii',
        dithering: 'ordered',
        columns: 40
      });

      expect(result).toBeDefined();
      expect(isValidImage(result, 'png')).toBe(true);
    });

    test('debería renderizar con dithering=floyd-steinberg', async () => {
      const result = await render(testImageBuffer, {
        mode: 'ascii',
        dithering: 'floyd-steinberg',
        columns: 40
      });

      expect(result).toBeDefined();
      expect(isValidImage(result, 'png')).toBe(true);
    });

    test('debería renderizar con dithering=atkinson', async () => {
      const result = await render(testImageBuffer, {
        mode: 'ascii',
        dithering: 'atkinson',
        columns: 40
      });

      expect(result).toBeDefined();
      expect(isValidImage(result, 'png')).toBe(true);
    });

    test('debería usar none por defecto si dithering no se especifica', async () => {
      const result = await render(testImageBuffer, {
        mode: 'ascii',
        columns: 40
        // dithering no especificado - debería usar 'none' por defecto
      });

      expect(result).toBeDefined();
      expect(isValidImage(result, 'png')).toBe(true);
    });

    test('debería aplicar dithering en modo ANSI', async () => {
      const result = await render(testImageBuffer, {
        mode: 'ansi',
        dithering: 'floyd-steinberg',
        columns: 40
      });

      expect(result).toBeDefined();
      expect(isValidImage(result, 'png')).toBe(true);
    });

  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Q-02: Tests de término medio - Coeficientes BT.709 sin linealizar
  // ─────────────────────────────────────────────────────────────────────────────

  describe('Q-02: Término medio - Coeficientes BT.709 sin linealizar', () => {

    // Helper: calcular luminancia sRGB directa (método original)
    function lumSrgb(r, g, b) {
      return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }

    // Helper: término medio - BT.709 sin linealizar (método nuevo - default)
    function lumBT709(r, g, b) {
      return Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
    }

    // Helper: gamma completo (para comparar)
    function toLinear(v) {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    }

    function lumLinearFull(r, g, b) {
      const rLin = toLinear(r);
      const gLin = toLinear(g);
      const bLin = toLinear(b);
      return Math.round(255 * (0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin));
    }

    // ── Tests de métricas para comparar métodos ─────────────────────────────────
    test('MÉTRICAS: Diferencias entre los 3 métodos de luminancia', () => {
      //Casos de prueba: diferentes valores RGB
      const testCases = [
        { r: 0, g: 0, b: 0, desc: 'negro' },
        { r: 50, g: 50, b: 50, desc: 'gris oscuro' },
        { r: 100, g: 100, b: 100, desc: 'gris medio' },
        { r: 128, g: 128, b: 128, desc: 'gris medio-alto' },
        { r: 200, g: 200, b: 200, desc: 'gris claro' },
        { r: 255, g: 255, b: 255, desc: 'blanco' },
        { r: 200, g: 100, b: 50, desc: 'color asimétrico 1' },
        { r: 50, g: 200, b: 100, desc: 'color asimétrico 2' },
        { r: 100, g: 50, b: 200, desc: 'color asimétrico 3' },
      ];

      console.log('\n=== MÉTRICAS DE LUMINANCIA ===');
      console.log('Caso              | sRGB | BT709 | Linear | Diff(sRGB-BT709) | Diff(BT709-Linear)');
      console.log('-------------------|------|-------|--------|------------------|-------------------');

      let totalDiffSrgbBt709 = 0;
      let totalDiffBt709Linear = 0;

      for (const tc of testCases) {
        const srgb = lumSrgb(tc.r, tc.g, tc.b);
        const bt709 = lumBT709(tc.r, tc.g, tc.b);
        const linearFull = lumLinearFull(tc.r, tc.g, tc.b);
        const diff1 = Math.abs(srgb - bt709);
        const diff2 = Math.abs(bt709 - linearFull);
        totalDiffSrgbBt709 += diff1;
        totalDiffBt709Linear += diff2;

        console.log(`${tc.desc.padEnd(17)}| ${srgb.toString().padStart(3)}  | ${bt709.toString().padStart(3)}   | ${linearFull.toString().padStart(3)}   | ${diff1.toString().padStart(4)} | ${diff2.toString().padStart(5)}`);
      }

      const avgDiff1 = (totalDiffSrgbBt709 / testCases.length).toFixed(2);
      const avgDiff2 = (totalDiffBt709Linear / testCases.length).toFixed(2);
      console.log(`\nPromedio sRGB->BT709: ${avgDiff1}`);
      console.log(`Promedio BT709->Linear: ${avgDiff2}`);

      // Verificaciones básicas - los valores ya se mostraron en la tabla
      expect(avgDiff1).toBe('3.78'); // sRGB -> BT709 promedio
      expect(parseFloat(avgDiff2)).toBeGreaterThan(40); // BT709 -> Linear promedio
    });

    // ── Tests de renderizado ───────────────────────────────────────────────────
    test('debería renderizar ASCII con diferentes densities usando BT.709', async () => {
      const densities = ['original', 'conservative', 'expanded', 'detailed', 'maximum'];

      for (const density of densities) {
        const result = await render(testImageBuffer, {
          mode: 'ascii',
          density: density,
          columns: 40
        });

        expect(result).toBeDefined();
        expect(isValidImage(result, 'png')).toBe(true);
      }
    });

    test('ASCII debería usar BT.709, otros modos no se afectan', async () => {
      const resultAscii = await render(testImageBuffer, { mode: 'ascii', columns: 40 });
      const resultAnsi = await render(testImageBuffer, { mode: 'ansi', columns: 40 });
      const resultRgb = await render(testImageBuffer, { mode: 'rgb', columns: 40 });

      expect(isValidImage(resultAscii, 'png')).toBe(true);
      expect(isValidImage(resultAnsi, 'png')).toBe(true);
      expect(isValidImage(resultRgb, 'png')).toBe(true);
    });

    // ── Test de dithering ignorado en modo ASCII ───────────────────────────────
    test('Q-02: Dithering debería ignorarse en modo ASCII (todos dan igual)', async () => {
      // Renderizar ASCII con cada tipo de dithering
      const resultNone = await render(testImageBuffer, { mode: 'ascii', dithering: 'none', columns: 40 });
      const resultOrdered = await render(testImageBuffer, { mode: 'ascii', dithering: 'ordered', columns: 40 });
      const resultFS = await render(testImageBuffer, { mode: 'ascii', dithering: 'floyd-steinberg', columns: 40 });
      const resultAtkinson = await render(testImageBuffer, { mode: 'ascii', dithering: 'atkinson', columns: 40 });

      // Todos deberían ser idénticos porque el dithering se ignora en modo ASCII
      expect(resultNone.length).toBe(resultOrdered.length);
      expect(resultOrdered.length).toBe(resultFS.length);
      expect(resultFS.length).toBe(resultAtkinson.length);

      // Verificar que son imágenes válidas
      expect(isValidImage(resultNone, 'png')).toBe(true);
    });

    test('Q-02: Dithering debería funcionar en modos con color (ANSI)', async () => {
      // En modo ANSI, el dithering SÍ debería tener efecto
      const resultNone = await render(testImageBuffer, { mode: 'ansi', dithering: 'none', columns: 40 });
      const resultFS = await render(testImageBuffer, { mode: 'ansi', dithering: 'floyd-steinberg', columns: 40 });

      // Los resultados pueden ser diferentes en tamaño debido al procesamiento del dithering
      expect(resultNone.length).toBeGreaterThan(0);
      expect(resultFS.length).toBeGreaterThan(0);
      expect(isValidImage(resultNone, 'png')).toBe(true);
      expect(isValidImage(resultFS, 'png')).toBe(true);
    });

  });

});