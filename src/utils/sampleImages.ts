/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Creates canvas-generated sample images (Puppy, Vintage Car, Cartoon Dinosaur)
 * so users can test photo-to-coloring and contour conversion without needing to upload a file.
 */
export function generateSampleImage(type: 'puppy' | 'car' | 'dino'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 400, 400);

  if (type === 'puppy') {
    // Soft puppy face with ears, eyes, nose, tongue
    ctx.fillStyle = '#D97706'; // Golden brown
    ctx.beginPath();
    ctx.ellipse(200, 220, 110, 100, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#78350F';
    ctx.stroke();

    // Ears
    ctx.fillStyle = '#92400E';
    ctx.beginPath();
    ctx.ellipse(110, 160, 40, 70, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(290, 160, 40, 70, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(160, 200, 14, 0, Math.PI * 2);
    ctx.arc(240, 200, 14, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlights
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(156, 196, 4, 0, Math.PI * 2);
    ctx.arc(236, 196, 4, 0, Math.PI * 2);
    ctx.fill();

    // Snout
    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.ellipse(200, 245, 45, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Nose
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.ellipse(200, 235, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(188, 255, 12, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(212, 255, 12, 0, Math.PI);
    ctx.stroke();
  } else if (type === 'car') {
    // Colorful car
    ctx.fillStyle = '#2563EB'; // Blue body
    ctx.beginPath();
    ctx.roundRect(80, 220, 240, 70, 16);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#1E3A8A';
    ctx.stroke();

    // Cabin
    ctx.fillStyle = '#60A5FA';
    ctx.beginPath();
    ctx.moveTo(130, 220);
    ctx.lineTo(160, 150);
    ctx.lineTo(240, 150);
    ctx.lineTo(270, 220);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Windows
    ctx.fillStyle = '#EFF6FF';
    ctx.beginPath();
    ctx.moveTo(165, 160);
    ctx.lineTo(195, 160);
    ctx.lineTo(195, 210);
    ctx.lineTo(145, 210);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(205, 160);
    ctx.lineTo(235, 160);
    ctx.lineTo(255, 210);
    ctx.lineTo(205, 210);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wheels
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(130, 290, 32, 0, Math.PI * 2);
    ctx.arc(270, 290, 32, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.arc(130, 290, 14, 0, Math.PI * 2);
    ctx.arc(270, 290, 14, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Dinosaur
    ctx.fillStyle = '#10B981'; // Green Dino
    ctx.beginPath();
    // Body & tail
    ctx.ellipse(200, 250, 90, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#065F46';
    ctx.stroke();

    // Long neck & head
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.moveTo(150, 240);
    ctx.quadraticCurveTo(120, 140, 110, 100);
    ctx.quadraticCurveTo(150, 90, 170, 110);
    ctx.quadraticCurveTo(170, 160, 210, 220);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.ellipse(110, 95, 30, 20, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(105, 90, 5, 0, Math.PI * 2);
    ctx.fill();

    // Back plates
    ctx.fillStyle = '#F59E0B';
    for (let x = 180; x <= 260; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x - 12, 195);
      ctx.lineTo(x, 165);
      ctx.lineTo(x + 12, 195);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Legs
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.roundRect(160, 280, 25, 45, 8);
    ctx.roundRect(220, 280, 25, 45, 8);
    ctx.fill();
    ctx.stroke();
  }

  return canvas.toDataURL('image/png');
}
