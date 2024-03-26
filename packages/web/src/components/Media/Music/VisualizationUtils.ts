/* global BINARY_PATH */
import axios from 'axios';
import {
    DenseMatrixDependencies,
    SparseMatrixDependencies,
    create,
    multiplyDependencies,
    type Matrix,
} from 'mathjs';
const { multiply, SparseMatrix, matrix } = create(
    {
        multiplyDependencies,
        DenseMatrixDependencies,
        SparseMatrixDependencies,
    },
    {},
);

import { getAudioContext } from 'src/components/Media/Music/utils';

export const CIRCLE_SAMPLES = 512;

type DrawCircleMaskShape = (
    context: CanvasRenderingContext2D,
    radius: number,
    dimensions: [number, number],
    center?: [number, number],
) => void;

export const drawCircleMask: DrawCircleMaskShape = (
    context,
    radius,
    dimensions,
    center = [0, 0],
) => {
    context.save();
    context.beginPath();
    context.arc(center[0], center[1], radius, 0, 2 * Math.PI);
    context.closePath();
    context.clip();
    context.clearRect(
        center[0] - dimensions[0] / 2,
        center[1] - dimensions[1] / 2,
        dimensions[0],
        dimensions[1],
    );
    context.restore();
};

const getCirclePoints = (points: number, offset = 0) => {
    const pointArray: Array<{
        x: number;
        y: number;
    }> = [];

    const twoPiPerPoints = (2 * Math.PI) / points;
    for (let i = 0; i < points; i++) {
        const angle = i * twoPiPerPoints + offset;
        pointArray.push({
            x: Math.cos(angle),
            y: Math.sin(angle),
        });
    }
    return pointArray;
};

interface WaveformHeader {
    version: number;
    flags: number;
    sampleRate: number;
    samplesPerPixel: number;
    length: number;
    channels?: number;
}

type DataViewDataType = 'int32' | 'uint32' | 'float32';

const getDatatypeAndReturnOffset = (
    dataView: DataView,
    dataType: DataViewDataType,
    offset = 0,
) => {
    switch (dataType) {
        case 'int32': {
            return [dataView.getInt32(offset, true), offset + 4];
        }
        case 'uint32': {
            return [dataView.getUint32(offset, true), offset + 4];
        }
        case 'float32': {
            return [dataView.getFloat32(offset, true), offset + 4];
        }
        default: {
            throw new Error('dataType extraction not implemented');
        }
    }
};

type HeaderStructure = [keyof WaveformHeader, DataViewDataType][];

const waveformHeaderStructures: HeaderStructure[] = [
    [
        ['version', 'int32'],
        ['flags', 'uint32'],
        ['sampleRate', 'int32'],
        ['samplesPerPixel', 'int32'],
        ['length', 'uint32'],
    ],
    [
        ['version', 'int32'],
        ['flags', 'uint32'],
        ['sampleRate', 'int32'],
        ['samplesPerPixel', 'int32'],
        ['length', 'uint32'],
        ['channels', 'int32'],
    ],
];

export class WaveformLoader {
    headerStructure?: HeaderStructure;
    header?: WaveformHeader;
    waveform?: Float32Array;
    angles?: Array<{ x: number; y: number }>;
    loaded?: Promise<void>;
    resolver?: () => void;

    reset = (): void => {
        this.header = undefined;
        this.waveform = undefined;
        this.angles = undefined;
        this.loaded = undefined;
    };

    private loadFile = async (filename: string): Promise<void> => {
        const { data: buffer } = await axios.get<ArrayBuffer>(filename, {
            responseType: 'arraybuffer',
            headers: {
                'Content-Type': 'application/octet-stream',
            },
        });
        const dataView = new DataView(buffer);
        const header: Partial<WaveformHeader> = {};
        header.version = dataView.getInt32(0, true);
        this.headerStructure = waveformHeaderStructures[header.version];

        let offset = 0;
        if (!this.headerStructure) {
            return;
        }

        // Get Header
        for (const [key, dataType] of this.headerStructure) {
            const [data, next] = getDatatypeAndReturnOffset(
                dataView,
                dataType,
                offset,
            );
            header[key] = data;
            offset = next;
        }

        const dataValues = header.flags
            ? new Int8Array(buffer, offset)
            : new Int16Array(buffer, offset);
        this.waveform = Float32Array.from(dataValues);
        const maxAbs = this.waveform?.reduce((acc: number, value: number) => {
            if (Math.abs(value) > acc) {
                return Math.abs(value);
            }
            return acc;
        }, 0);
        this.waveform = this.waveform?.map((val) => val / maxAbs);
        this.header = header as WaveformHeader;
        const length = this.waveform.length / 2;
        this.angles = getCirclePoints(length, Math.PI / length);
    };

    loadWaveformFile = (filename: string): void => {
        this.header = undefined;
        this.waveform = undefined;
        this.loaded = this.loadFile(filename);
    };
}

// export const waveformLoader = new WaveformLoader();

interface FIRHeader {
    numCrossings: number;
    samplesPerCrossing: number;
    cutoffcycle: number;
    kaiserBeta: number;
}

class FIRLoader {
    headerStructure: [keyof FIRHeader, DataViewDataType][] = [
        ['numCrossings', 'uint32'],
        ['samplesPerCrossing', 'uint32'],
        ['cutoffcycle', 'float32'],
        ['kaiserBeta', 'float32'],
    ];
    numCrossings!: number;
    samplesPerCrossing!: number;
    filterSize!: number;
    halfCrossings!: number;
    loaded: Promise<void>;
    coeffs!: Float32Array;
    deltas!: Float32Array;

    constructor() {
        this.loaded = this.loadFIRFile();
    }

    loadFIRFile = async () => {
        const { data: buffer } = await axios.get<ArrayBuffer>(
            `${BINARY_PATH}/fir.dat`,
            {
                responseType: 'arraybuffer',
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
            },
        );
        console.log('bufferSize', buffer.byteLength);

        const dataView = new DataView(buffer);
        const header: Partial<FIRHeader> = {};
        let offset = 0;

        // Get Header
        for (const [key, dataType] of this.headerStructure) {
            const [data, next] = getDatatypeAndReturnOffset(
                dataView,
                dataType,
                offset,
            );
            header[key] = data;
            offset = next;
        }
        if (!header.numCrossings || !header.samplesPerCrossing) {
            throw Error('Missing headers for FIR');
        }
        this.numCrossings = header.numCrossings;
        this.samplesPerCrossing = header.samplesPerCrossing;
        this.halfCrossings = (this.numCrossings - 1) / 2;
        this.filterSize = this.samplesPerCrossing * (this.numCrossings - 1) - 1;
        console.log(header);
        console.log(this.filterSize);
        this.coeffs = new Float32Array(buffer, offset, this.filterSize);
        offset += Float32Array.BYTES_PER_ELEMENT * this.filterSize;
        this.deltas = new Float32Array(buffer, offset, this.filterSize);
    };
}

export const firLoader = new FIRLoader();

interface ConstantQHeader {
    sampleRate: number;
    binsPerOctave: number;
    minFreq: number;
    maxFreq: number;
    numRows: number;
    numCols: number;
    innerPtrSize: number;
    outerPtrSize: number;
}

class ConstantQ {
    headerStructure: [keyof ConstantQHeader, DataViewDataType][] = [
        ['sampleRate', 'uint32'],
        ['binsPerOctave', 'uint32'],
        ['minFreq', 'float32'],
        ['maxFreq', 'float32'],
        ['numRows', 'uint32'],
        ['numCols', 'uint32'],
        ['innerPtrSize', 'uint32'],
        ['outerPtrSize', 'uint32'],
    ];
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    matrix?: Matrix;
    input = matrix([], 'dense', 'number');
    loaded: Promise<void>;
    minF = 0;
    maxF = 0;
    numRows = 0;
    numCols = 0;
    sampleRate: number;
    angles!: Array<{ x: number; y: number }>;

    constructor(sampleRate: number) {
        this.matrix;
        this.loaded = this.loadMatrix(`${BINARY_PATH}/CQ_${sampleRate}.dat`);
        this.sampleRate = sampleRate;
    }

    loadMatrix = async (filename: string): Promise<void> => {
        const { data: buffer } = await axios.get<ArrayBuffer>(filename, {
            responseType: 'arraybuffer',
            headers: {
                'Content-Type': 'application/octet-stream',
            },
        });

        const dataView = new DataView(buffer);
        const header: Partial<ConstantQHeader> = {};
        let offset = 0;

        // Get Header
        for (const [key, dataType] of this.headerStructure) {
            const [data, next] = getDatatypeAndReturnOffset(
                dataView,
                dataType,
                offset,
            );
            header[key] = data;
            offset = next;
        }

        if (
            !header.innerPtrSize ||
            !header.outerPtrSize ||
            !header.numCols ||
            !header.numRows ||
            !header.minFreq ||
            !header.maxFreq
        ) {
            throw Error('Missing ConstantQ headers');
        }
        const values = new Float32Array(buffer, offset, header.innerPtrSize);
        offset += Float32Array.BYTES_PER_ELEMENT * header.innerPtrSize;
        const innerPtr = new Int32Array(buffer, offset, header.innerPtrSize);
        offset += Int32Array.BYTES_PER_ELEMENT * header.innerPtrSize;
        const outerPtr = new Int32Array(buffer, offset, header.outerPtrSize);
        const o = {
            mathjs: 'SparseMatrix',
            values: [...values],
            index: [...innerPtr],
            ptr: [...outerPtr],
            size: [header.numRows, header.numCols],
            datatype: 'number',
        };
        this.numRows = header.numRows;
        this.numCols = header.numCols;
        this.minF = header.minFreq;
        this.maxF = header.maxFreq;
        this.matrix = SparseMatrix.fromJSON(o);
        this.input.resize([1, this.numRows]);

        const cqBins = 2 * this.numCols;
        const invCqBins = 1 / cqBins;
        this.angles = getCirclePoints(
            CIRCLE_SAMPLES,
            Math.PI * (invCqBins + 1),
        );
        console.log(header);
    };

    apply(input: Float32Array, output: Float32Array): void {
        if (this.matrix) {
            this.input._data = [Array.from(input)];
            output.set(multiply(this.input, this.matrix).toArray()[0]);
        }
    }
}

export const constantQ = new ConstantQ(getAudioContext().sampleRate);
