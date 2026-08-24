/** Brand tokens + canvas renderer for the printable Member ID card PNG. */

export const MEMBER_ID_CARD = {
  width: 1012,
  height: 638,
  teal: '#0f766e',
  tealDark: '#115e59',
  tealLight: '#14b8a6',
  ink: '#111827',
  muted: '#6b7280',
  border: '#d1e3df',
  white: '#ffffff',
} as const;

export type MemberIdCardPayload = {
  displayName: string;
  memberId: string;
  dateOfBirth?: string;
  enrolledLabel?: string;
  verifyUrl: string;
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

async function loadQrDataUrl(verifyUrl: string, size: number): Promise<string> {
  const QRCode = (await import('qrcode')).default;
  return QRCode.toDataURL(verifyUrl, {
    width: size,
    margin: 1,
    color: { dark: MEMBER_ID_CARD.teal, light: MEMBER_ID_CARD.white },
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image_load_failed'));
    img.src = src;
  });
}

/** Renders a high-resolution Member ID card PNG (2× layout for crisp output). */
export async function renderMemberIdCardPng(payload: MemberIdCardPayload): Promise<string> {
  const { width, height } = MEMBER_ID_CARD;
  const pad = 48;
  const headerH = 96;
  const radius = 24;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas_unavailable');

  // Page background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  const cardX = 32;
  const cardY = 32;
  const cardW = width - 64;
  const cardH = height - 64;

  // Drop shadow
  ctx.save();
  ctx.shadowColor = 'rgba(15, 118, 110, 0.18)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 12;
  roundRect(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = MEMBER_ID_CARD.white;
  ctx.fill();
  ctx.restore();

  // Card clip
  ctx.save();
  roundRect(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.clip();

  // Header gradient
  const headerGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + headerH);
  headerGrad.addColorStop(0, MEMBER_ID_CARD.tealDark);
  headerGrad.addColorStop(0.55, MEMBER_ID_CARD.teal);
  headerGrad.addColorStop(1, MEMBER_ID_CARD.tealLight);
  ctx.fillStyle = headerGrad;
  ctx.fillRect(cardX, cardY, cardW, headerH);

  // Header accent line
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillRect(cardX, cardY + headerH - 3, cardW, 3);

  // Header title
  ctx.fillStyle = MEMBER_ID_CARD.white;
  ctx.font = '600 34px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillText('TrialClinIQ Member ID', cardX + pad, cardY + 58);

  // Research badge
  const badgeText = 'Research Member';
  ctx.font = '600 18px system-ui, sans-serif';
  const badgeW = ctx.measureText(badgeText).width + 36;
  const badgeX = cardX + cardW - pad - badgeW;
  const badgeY = cardY + 28;
  roundRect(ctx, badgeX, badgeY, badgeW, 40, 20);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = MEMBER_ID_CARD.white;
  ctx.fillText(badgeText, badgeX + 18, badgeY + 26);

  const bodyY = cardY + headerH;
  const bodyH = cardH - headerH;
  ctx.fillStyle = MEMBER_ID_CARD.white;
  ctx.fillRect(cardX, bodyY, cardW, bodyH);

  // Subtle body pattern
  ctx.strokeStyle = 'rgba(15, 118, 110, 0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i += 1) {
    ctx.beginPath();
    ctx.moveTo(cardX + cardW * 0.55 + i * 28, bodyY);
    ctx.lineTo(cardX + cardW + 40 + i * 28, bodyY + bodyH);
    ctx.stroke();
  }

  const contentX = cardX + pad;
  const contentTop = bodyY + pad;

  // Name
  ctx.fillStyle = MEMBER_ID_CARD.ink;
  ctx.font = '600 40px system-ui, sans-serif';
  ctx.fillText(payload.displayName, contentX, contentTop + 44);

  if (payload.dateOfBirth) {
    ctx.fillStyle = MEMBER_ID_CARD.muted;
    ctx.font = '22px system-ui, sans-serif';
    ctx.fillText(`Date of birth · ${payload.dateOfBirth}`, contentX, contentTop + 82);
  }

  // Member ID block
  const idBlockY = contentTop + 118;
  roundRect(ctx, contentX, idBlockY, cardW - pad * 2 - 220, 132, 16);
  ctx.fillStyle = '#f0fdfa';
  ctx.fill();
  ctx.strokeStyle = MEMBER_ID_CARD.border;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = MEMBER_ID_CARD.muted;
  ctx.font = '600 16px system-ui, sans-serif';
  ctx.fillText('MEMBER ID', contentX + 24, idBlockY + 36);

  ctx.fillStyle = MEMBER_ID_CARD.teal;
  ctx.font = '700 36px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText(payload.memberId, contentX + 24, idBlockY + 88);

  if (payload.enrolledLabel) {
    ctx.fillStyle = MEMBER_ID_CARD.muted;
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillText(payload.enrolledLabel, contentX, idBlockY + 168);
  }

  // QR panel
  const qrSize = 176;
  const qrPanel = 208;
  const qrX = cardX + cardW - pad - qrPanel;
  const qrY = bodyY + bodyH - pad - qrPanel;

  roundRect(ctx, qrX, qrY, qrPanel, qrPanel, 18);
  ctx.fillStyle = MEMBER_ID_CARD.white;
  ctx.fill();
  ctx.strokeStyle = MEMBER_ID_CARD.border;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const qrDataUrl = await loadQrDataUrl(payload.verifyUrl, qrSize * 2);
  const qrImg = await loadImage(qrDataUrl);
  ctx.drawImage(qrImg, qrX + (qrPanel - qrSize) / 2, qrY + 16, qrSize, qrSize);

  ctx.fillStyle = MEMBER_ID_CARD.muted;
  ctx.font = '500 15px system-ui, sans-serif';
  const verifyLabel = 'Scan to verify membership';
  const labelW = ctx.measureText(verifyLabel).width;
  ctx.fillText(verifyLabel, qrX + (qrPanel - labelW) / 2, qrY + qrPanel - 14);

  // Footer strip
  ctx.fillStyle = '#ecfdf5';
  ctx.fillRect(cardX, cardY + cardH - 44, cardW, 44);
  ctx.fillStyle = MEMBER_ID_CARD.muted;
  ctx.font = '500 16px system-ui, sans-serif';
  ctx.fillText(
    'TrialClinIQ · Clinical research membership · No PHI encoded in QR',
    contentX,
    cardY + cardH - 14,
  );

  ctx.restore();

  return canvas.toDataURL('image/png');
}

export async function downloadMemberIdCardPng(
  payload: MemberIdCardPayload,
  filename: string,
): Promise<void> {
  const dataUrl = await renderMemberIdCardPng(payload);
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
