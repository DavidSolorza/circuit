import { Matrix } from './Matrix';
import { DEFAULT_TOLERANCE } from '../types';

export interface SolveResult {
  success: boolean;
  solution: Float64Array;
  singular: boolean;
  message: string;
}

/**
 * Gaussian elimination with partial pivoting.
 * Solves Ax = b for square A.
 */
export function gaussianElimination(
  A: Matrix,
  b: Float64Array,
  tolerance = DEFAULT_TOLERANCE,
): SolveResult {
  const n = A.rows;
  if (n !== A.cols || n !== b.length) {
    return {
      success: false,
      solution: new Float64Array(n),
      singular: true,
      message: 'Dimensiones de matriz incompatibles',
    };
  }

  const aug = A.augment(b);
  const cols = aug.cols;

  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    let maxAbs = Math.abs(aug.get(col, col));

    for (let row = col + 1; row < n; row++) {
      const val = Math.abs(aug.get(row, col));
      if (val > maxAbs) {
        maxAbs = val;
        pivotRow = row;
      }
    }

    if (maxAbs < tolerance) {
      return {
        success: false,
        solution: new Float64Array(n),
        singular: true,
        message: `Matriz singular en columna ${col} (circuito inválido o cortocircuito)`,
      };
    }

    if (pivotRow !== col) {
      for (let c = 0; c < cols; c++) {
        const tmp = aug.get(col, c);
        aug.set(col, c, aug.get(pivotRow, c));
        aug.set(pivotRow, c, tmp);
      }
    }

    const pivot = aug.get(col, col);
    for (let c = col; c < cols; c++) {
      aug.set(col, c, aug.get(col, c) / pivot);
    }

    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug.get(row, col);
      if (Math.abs(factor) < tolerance) continue;
      for (let c = col; c < cols; c++) {
        aug.set(row, c, aug.get(row, c) - factor * aug.get(col, c));
      }
    }
  }

  const solution = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    solution[i] = aug.get(i, n);
  }

  return {
    success: true,
    solution,
    singular: false,
    message: 'OK',
  };
}

/** Validate numerical stability of a solution residual ||Ax - b|| */
export function validateSolution(
  A: Matrix,
  b: Float64Array,
  x: Float64Array,
  tolerance = DEFAULT_TOLERANCE,
): boolean {
  const n = A.rows;
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      sum += A.get(i, j) * (x[j] ?? 0);
    }
    if (Math.abs(sum - (b[i] ?? 0)) > tolerance * Math.max(1, Math.abs(b[i] ?? 0))) {
      return false;
    }
  }
  return true;
}
