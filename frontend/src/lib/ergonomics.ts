// Tipos de datos extraídos del modelo de Pose Detection
export interface Keypoint {
  x: number;
  y: number;
  z?: number;
  score?: number;
  name?: string;
}

/**
 * Calcula el ángulo en grados entre tres puntos (A, B, C)
 * B es el vértice.
 */
export function calculateAngle(A: Keypoint, B: Keypoint, C: Keypoint): number {
  const radians = Math.atan2(C.y - B.y, C.x - B.x) - Math.atan2(A.y - B.y, A.x - B.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
}

/**
 * Calcula la inclinación vertical del cuello (Cuello de texto)
 * Utiliza la oreja, el hombro y una línea vertical de referencia.
 */
export function getNeckInclination(ear: Keypoint, shoulder: Keypoint): number {
  // Punto virtual directamente encima del hombro para crear un eje vertical puro (90 grados)
  const verticalRef: Keypoint = { x: shoulder.x, y: shoulder.y - 100 };
  
  // El ángulo del cuello respecto al eje vertical puro
  const angle = calculateAngle(ear, shoulder, verticalRef);
  return angle;
}

/**
 * Mide la asimetría de los hombros (desviación de altura)
 */
export function getShoulderAsymmetry(leftShoulder: Keypoint, rightShoulder: Keypoint): number {
  // Diferencia absoluta en el eje Y (altura)
  const heightDifference = Math.abs(leftShoulder.y - rightShoulder.y);
  return heightDifference;
}

export function evaluatePosture(keypoints: Keypoint[]) {
  // En BlazePose/MoveNet:
  // 3: left_ear, 4: right_ear
  // 5: left_shoulder, 6: right_shoulder
  
  const leftEar = keypoints.find(k => k.name === 'left_ear');
  const rightEar = keypoints.find(k => k.name === 'right_ear');
  const leftShoulder = keypoints.find(k => k.name === 'left_shoulder');
  const rightShoulder = keypoints.find(k => k.name === 'right_shoulder');

  if (!leftEar || !rightEar || !leftShoulder || !rightShoulder) {
    return { status: 'unknown', neckAngle: 0, asymmetry: 0 };
  }

  // Calculamos la inclinación promedio de ambos lados
  const leftNeckAngle = getNeckInclination(leftEar, leftShoulder);
  const rightNeckAngle = getNeckInclination(rightEar, rightShoulder);
  const avgNeckAngle = (leftNeckAngle + rightNeckAngle) / 2;

  const asymmetry = getShoulderAsymmetry(leftShoulder, rightShoulder);

  // Reglas matemáticas para ergonomía médica
  // Tolerancia ideal: < 15 grados. Riesgo moderado: 15 a 25. Crítico: > 25 grados.
  let status: 'optimal' | 'warning' | 'critical' = 'optimal';
  
  if (avgNeckAngle > 25 || asymmetry > 30) {
    status = 'critical';
  } else if (avgNeckAngle > 15 || asymmetry > 15) {
    status = 'warning';
  }

  return {
    status,
    neckAngle: Math.round(avgNeckAngle),
    asymmetry: Math.round(asymmetry)
  };
}
