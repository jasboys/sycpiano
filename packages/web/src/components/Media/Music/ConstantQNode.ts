import { constantQ } from 'src/components/Media/Music/VisualizationUtils';

export class ConstantQNode extends AnalyserNode {
    maxBin?: number;
    highPassBin?: number;
    intArray!: Uint8Array<ArrayBuffer>;
    floatArray!: Float32Array;
    endIdx!: number;

    constructor(ctx: BaseAudioContext, options?: AnalyserOptions) {
        super(ctx, options);
        this.initialize();
    }

    initialize = async (): Promise<void> => {
        await constantQ.loaded;
        this.fftSize = constantQ.numRows * 2;
        this.endIdx = this.fftSize / 2 - 1;
        const halfSR = constantQ.sampleRate / 2;
        this.maxBin = Math.round((constantQ.numRows * 22050) / halfSR);
        this.highPassBin = Math.round(
            (constantQ.maxF * constantQ.numRows) / halfSR,
        );
        this.floatArray = new Float32Array(constantQ.numRows);
        this.intArray = new Uint8Array(constantQ.numRows);
    };

    getConstantQ = (data: Float32Array) => {
        if (this.maxBin === undefined || this.highPassBin === undefined) {
            return {
                lowFreq: 0,
                highFreq: 0,
            };
        }
        let lowFreq = 0;
        let highFreq = 0;

        // get byte data, and store into normalized[L,R], while accumulating
        this.getByteFrequencyData(this.intArray);

        let i = 0;
        for (const d of this.intArray) {
            const temp = d / 255;
            this.floatArray[i] = temp;
            if (i < this.maxBin) {
                if (i) {
                    lowFreq += temp;
                }
                if (i >= this.highPassBin) {
                    highFreq += temp;
                }
            }
            i++;
        }

        // FFT -> CQ
        constantQ.apply(this.floatArray, data);
        return {
            lowFreq: lowFreq / this.highPassBin,
            highFreq: highFreq / (this.maxBin - this.highPassBin),
        };
    };
}
