import { Keypoint } from './ergonomics';

export function drawSkeleton(keypoints: Keypoint[], ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);

  // Dibujar los puntos principales (Rostro y Torso superior)
  const importantKeypoints = [
    'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear', 
    'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
    'left_wrist', 'right_wrist'
  ];

  const validKeypoints = keypoints.filter(k => 
    k.score && k.score > 0.3 && k.name && importantKeypoints.includes(k.name)
  );

  // Dibujar puntos
  validKeypoints.forEach(keypoint => {
    ctx.beginPath();
    ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#10b981'; // Verde Esmeralda por defecto
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  });

  // Función auxiliar para dibujar líneas
  const drawLine = (point1Name: string, point2Name: string, color: string = 'rgba(16, 185, 129, 0.6)') => {
    const p1 = validKeypoints.find(k => k.name === point1Name);
    const p2 = validKeypoints.find(k => k.name === point2Name);
    if (p1 && p2) {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  };

  // Conectar puntos del rostro
  drawLine('left_ear', 'left_eye');
  drawLine('left_eye', 'nose');
  drawLine('nose', 'right_eye');
  drawLine('right_eye', 'right_ear');

  // Conectar torso y brazos
  drawLine('left_shoulder', 'right_shoulder');
  drawLine('left_shoulder', 'left_elbow');
  drawLine('left_elbow', 'left_wrist');
  drawLine('right_shoulder', 'right_elbow');
  drawLine('right_elbow', 'right_wrist');
  
  // Línea del "Cuello" virtual (Nariz a centro de hombros)
  const leftS = validKeypoints.find(k => k.name === 'left_shoulder');
  const rightS = validKeypoints.find(k => k.name === 'right_shoulder');
  const nose = validKeypoints.find(k => k.name === 'nose');
  
  if (leftS && rightS && nose) {
    const midX = (leftS.x + rightS.x) / 2;
    const midY = (leftS.y + rightS.y) / 2;
    
    ctx.beginPath();
    ctx.moveTo(nose.x, nose.y);
    ctx.lineTo(midX, midY);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'; // Azul
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
