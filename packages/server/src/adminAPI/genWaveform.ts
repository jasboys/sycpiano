import { exec } from 'node:child_process';
import { parse } from 'node:path';

export const WAVEFORM_FOLDER = 'waveforms/';

export interface StreamInfo {
    index: number;
    sample_rate: string;
    duration: string;
}

export interface FFProbeStreamOutput {
    streams: StreamInfo[];
}

const TARGET_LENGTH = 1024;

const getFileInfo = (fileName: string) => {
    return new Promise<FFProbeStreamOutput>((res, rej) => {
        exec(
            `ffprobe -v quiet -print_format json -show_streams -i ${fileName}`,
            {
                cwd: process.env.MUSIC_ASSETS_DIR,
            },
            (err, stdout, stderr) => {
                if (err) {
                    console.error(err);
                    console.error(stderr);
                    rej();
                }
                res(JSON.parse(stdout));
            },
        );
    });
};

const callAudioWaveForm = (
    input: string,
    output: string,
    samplesPerPixel: number,
) => {
    return new Promise<void>((res, rej) => {
        exec(
            `audiowaveform -i ${input} -o ${output} -z ${samplesPerPixel} -b 8`,
            {
                cwd: process.env.MUSIC_ASSETS_DIR,
            },
            (err, stdout, stderr) => {
                if (err) {
                    console.error(err);
                    console.error(stderr);
                    rej();
                }
                console.log(stdout);
                res();
            },
        );
    });
};

export const getAudioDuration = async (audioFile: string) => {
    const { streams } = await getFileInfo(audioFile);
    const { duration: durationString } = streams[0];
    const duration = Number.parseFloat(durationString);
    return Math.round(duration);
};

export const genWaveformAndReturnDuration = async (audioFile: string) => {
    const { streams } = await getFileInfo(audioFile);
    const { sample_rate: sampleRateString, duration: durationString } =
        streams[0];
    const sampleRate = Number.parseInt(sampleRateString, 10);
    const duration = Number.parseFloat(durationString);
    const samplesPerPixel = (sampleRate * duration) / TARGET_LENGTH;
    const waveformFile = parse(audioFile).name;
    await callAudioWaveForm(
        audioFile,
        `${WAVEFORM_FOLDER}${waveformFile}.dat`,
        samplesPerPixel,
    );
    return Math.round(duration);
};
