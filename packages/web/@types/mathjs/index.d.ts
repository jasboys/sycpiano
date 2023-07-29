declare module 'mathjs' {
    class MatrixBase {
        toArray: () => ArrayLike<ArrayLike<number>>;
        valueOf: () => ArrayLike<number>;
        resize: (
            size: Array<number>,
            _default?: number,
            copy?: boolean,
        ) => Matrix;
        _data: ArrayLike<ArrayLike<number>>;
    }

    export class SparseMatrix extends MatrixBase {
        fromJSON: (object: Record<string, unknown>) => SparseMatrix;
    }

    export class DenseMatrix extends MatrixBase {
        fromJSON: (object: Record<string, unknown>) => DenseMatrix;
    }

    export type Matrix = SparseMatrix | DenseMatrix;

    export function multiply(d: DenseMatrix, a: Matrix): DenseMatrix;

    interface configOptions {
        epsilon?: number;
        matrix?: string;
        number?: string;
        precision?: number;
        predictable?: boolean;
        randomSeed?: string;
    }

    interface dependencies {
        SparseMatrix: SparseMatrix;
        DenseMatrix: DenseMatrix;
        multiply: typeof multiply;
        matrix: <T extends 'dense' | 'sparse'>(
            data: number[] | number[][],
            type: T,
            dataType?: string,
        ) => {
            dense: DenseMatrix;
            sparse: SparseMatrix;
        }[T];
        transpose: (m: Matrix) => Matrix;
    }

    export function create(
        factories: Record<string, unknown>,
        config: configOptions,
    ): dependencies;
    export function SparseMatrixDependencies(): Record<string, unknown>;
    export function multiplyDependencies(): Record<string, unknown>;
    export function DenseMatrixDependencies(): Record<string, unknown>;
    export function transposeDependencies(): Record<string, unknown>;
}