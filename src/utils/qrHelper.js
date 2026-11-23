import QRCode from 'qrcode';

/**
 * Draws a QR code onto an existing canvas with optional custom colors, styling and center badge/icon
 */
export async function renderQrToCanvas(canvas, text, options = {}) {
  if (!canvas || !text) return;

  const {
    fgColor = '#000000',
    bgColor = '#ffffff',
    errorLevel = 'H', // Use H so center logo doesn't break readability
    margin = 2,
    size = 400,
    logo = null, // emoji or icon string or image url
  } = options;

  try {
    // Generate base QR onto canvas
    await QRCode.toCanvas(canvas, text, {
      errorCorrectionLevel: errorLevel,
      margin: margin,
      width: size,
      color: {
        dark: fgColor,
        light: bgColor,
      },
    });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If logo/icon is requested, draw center badge
    if (logo) {
      const center = size / 2;
      const badgeSize = Math.floor(size * 0.22);
      const halfBadge = badgeSize / 2;

      // Draw rounded background badge
      ctx.save();
      ctx.fillStyle = bgColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      const radius = 12;
      ctx.beginPath();
      ctx.roundRect(center - halfBadge, center - halfBadge, badgeSize, badgeSize, radius);
      ctx.fill();

      // Border for badge
      ctx.lineWidth = 3;
      ctx.strokeStyle = fgColor;
      ctx.stroke();

      // Draw content in center
      if (typeof logo === 'string' && logo.length <= 4) {
        // Emoji or short symbol
        ctx.font = `${Math.floor(badgeSize * 0.58)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(logo, center, center + 2);
      }
      ctx.restore();
    }
  } catch (err) {
    console.error('Error rendering QR to canvas:', err);
  }
}

/**
 * Generate high-resolution canvas for downloading (e.g. 1024px or 2048px)
 */
export async function createHighResCanvas(text, options = {}, exportSize = 1024) {
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = exportSize;
  offscreenCanvas.height = exportSize;

  await renderQrToCanvas(offscreenCanvas, text, {
    ...options,
    size: exportSize,
  });

  return offscreenCanvas;
}

/**
 * Generate SVG string of the QR code
 */
export async function generateQrSvg(text, options = {}) {
  const {
    fgColor = '#000000',
    bgColor = '#ffffff',
    errorLevel = 'H',
    margin = 2,
    size = 512,
  } = options;

  try {
    const svgString = await QRCode.toString(text, {
      type: 'svg',
      errorCorrectionLevel: errorLevel,
      margin: margin,
      width: size,
      color: {
        dark: fgColor,
        light: bgColor,
      },
    });
    return svgString;
  } catch (err) {
    console.error('Error generating QR SVG:', err);
    return null;
  }
}

/**
 * Triggers browser download of a canvas as PNG
 */
export function downloadCanvas(canvas, filename = 'qr-code.png') {
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Triggers browser download of SVG string
 */
export function downloadSvg(svgString, filename = 'qr-code.svg') {
  if (!svgString) return;
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy canvas image to user clipboard
 */
export async function copyCanvasToClipboard(canvas) {
  if (!canvas) return false;
  try {
    return await new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          resolve(true);
        } catch (e) {
          console.warn('Clipboard write failed:', e);
          resolve(false);
        }
      }, 'image/png');
    });
  } catch (err) {
    console.error('Error copying to clipboard:', err);
    return false;
  }
}
