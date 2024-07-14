import path from 'path-browserify';
import type { MusicFileItem } from './types.js';

type PolarToCartesianShape = (
    radius: number,
    angle: number,
    offset?: [number, number],
) => [number, number];

export const polarToCartesian: PolarToCartesianShape = (
    radius,
    angle,
    offset = [0, 0],
) => [
    radius * Math.cos(angle) + offset[0],
    radius * Math.sin(angle) + offset[1],
];

type CartesianToPolarShape = (
    x: number,
    y: number,
) => { radius: number; angle: number };

export const cartesianToPolar: CartesianToPolarShape = (x, y) => ({
    radius: Math.sqrt(x * x + y * y),
    angle: Math.atan2(y, x),
});

export const formatTime = (current: number): string => {
    if (current === -1) {
        return '--:--';
    }
    const minutes = Math.floor(current / 60);
    const seconds = Math.floor(current - 60 * minutes);
    const minutesDisplay = `${minutes < 10 ? '0' : ''}${minutes}`;
    const secondsDisplay = `${seconds < 10 ? '0' : ''}${seconds}`;
    return `${minutesDisplay}:${secondsDisplay}`;
};

declare global {
    interface Window {
        webkitAudioContext?: typeof AudioContext;
    }
}

const AudioContextFill = window.AudioContext || window.webkitAudioContext;
const acx: AudioContext = new AudioContextFill();

export const getAudioContext = (): AudioContext => acx;

export const getLastName = (name: string): string | undefined => {
    return /([^\s]+)\s?(?:\(.*\))?$/.exec(name)?.[1];
};

export const normalizeString = (str: string): string => {
    return (
        str
            .normalize('NFD')
            // biome-ignore lint/suspicious/noMisleadingCharacterClass: This works
            .replace(/[\u0300-\u036f":()',.-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/_$/, '')
    );
};

export interface BufferSrc {
    src: string;
    waveform: string;
}

export const getSrc = (music: MusicFileItem): string =>
    `${MUSIC_PATH}/${music.audioFile}`;

export const getWaveformSrc = (music: MusicFileItem): string =>
    `${MUSIC_PATH}/waveforms/${music.waveformFile}`;

export const getBufferSrc = (music?: MusicFileItem): BufferSrc | undefined =>
    music
        ? {
              src: getSrc(music),
              waveform: getWaveformSrc(music),
          }
        : undefined;

export const getPermaLink = (
    base: string,
    composer: string,
    piece: string,
    movement?: string,
): string => {
    return path.normalize(
        `${base}/${getLastName(composer)}/${normalizeString(piece)}${
            movement ? `/${normalizeString(movement)}` : ''
        }`,
    );
};

export const getRelativePermaLink = (
    composer: string,
    piece: string,
    movement?: string,
): string => {
    return path.normalize(
        `${getLastName(composer)}/${normalizeString(piece)}${
            movement ? `/${normalizeString(movement)}` : ''
        }`,
    );
};

export const modulo = (n: number, m: number): number => {
    return ((n % m) + m) % m;
};

export const nextPow2 = (vv: number): number => {
    let v = vv;
    v--;
    v |= v >> 1;
    v |= v >> 2;
    v |= v >> 4;
    v |= v >> 8;
    v |= v >> 16;
    v++;
    return v;
};
