/** Dense matrix backed by Float64Array — no external math libraries. */

export class Matrix {
  readonly rows: number;
  readonly cols: number;
  readonly data: Float64Array;

  constructor(rows: number, cols: number, data?: Float64Array) {
    this.rows = rows;
    this.cols = cols;
    this.data = data ?? new Float64Array(rows * cols);
  }

  static zeros(rows: number, cols: number): Matrix {
    return new Matrix(rows, cols);
  }

  static fromArray(rows: number, cols: number, values: number[]): Matrix {
    const data = new Float64Array(rows * cols);
    for (let i = 0; i < Math.min(values.length, data.length); i++) {
      data[i] = values[i]!;
    }
    return new Matrix(rows, cols, data);
  }

  idx(row: number, col: number): number {
    return row * this.cols + col;
  }

  get(row: number, col: number): number {
    return this.data[this.idx(row, col)]!;
  }

  set(row: number, col: number, value: number): void {
    this.data[this.idx(row, col)] = value;
  }

  add(row: number, col: number, delta: number): void {
    this.data[this.idx(row, col)]! += delta;
  }

  clone(): Matrix {
    return new Matrix(this.rows, this.cols, new Float64Array(this.data));
  }

  /** Augment matrix with vector b → [A | b] */
  augment(b: Float64Array): Matrix {
    const aug = Matrix.zeros(this.rows, this.cols + 1);
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        aug.set(r, c, this.get(r, c));
      }
      aug.set(r, this.cols, b[r] ?? 0);
    }
    return aug;
  }
}

export class Vector {
  readonly length: number;
  readonly data: Float64Array;

  constructor(length: number, data?: Float64Array) {
    this.length = length;
    this.data = data ?? new Float64Array(length);
  }

  static zeros(length: number): Vector {
    return new Vector(length);
  }

  get(i: number): number {
    return this.data[i]!;
  }

  set(i: number, value: number): void {
    this.data[i] = value;
  }

  add(i: number, delta: number): void {
    this.data[i]! += delta;
  }

  clone(): Vector {
    return new Vector(this.length, new Float64Array(this.data));
  }
}
