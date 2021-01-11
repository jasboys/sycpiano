import * as path from 'path';

type PolarToCartesianShape = (
    radius: number,
    angle: number,
    offset?: [number, number],
) => [number, number];

export const polarToCartesian: PolarToCartesianShape = (radius, angle, offset = [0, 0]) => (
    [
        radius * Math.cos(angle) + offset[0],
        radius * Math.sin(angle) + offset[1],
    ]
);

type CartesianToPolarShape = (
    x: number,
    y: number,
) => { radius: number; angle: number };

export const cartesianToPolar: CartesianToPolarShape = (x, y) => (
    {
        radius: Math.sqrt(x * x + y * y),
        angle: Math.atan2(y, x),
    }
);

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

export const getAudioContext = (): AudioContext => {
    if (acx.state === 'suspended') {
        const resume = async () => {
            await acx.resume();
            if (acx.state === 'running') {
                document.body.removeEventListener('touchend', resume, false);
            }
        };

        document.body.addEventListener('touchend', resume, false);
    }
    return acx;
};

declare global {
    interface Document {
        webkitHidden?: boolean;
        msHidden?: boolean;
    }
}

export const visibilityChangeApi = (typeof document.hidden !== 'undefined') ?
    {
        hidden: 'hidden',
        visibilityChange: 'visibilitychange',
    }
    : (typeof document.webkitHidden !== 'undefined') ?
        {
            hidden: 'webkitHidden',
            visibilityChange: 'webkitvisibilitychange',
        }
        : (typeof document.msHidden !== 'undefined') ?
            {
                hidden: 'msHidden',
                visibilityChange: 'msvisibilitychange',
            }
            : {};

export const getLastName = (name: string): string => {
    return /([^\s]+)\s?(?:\(.*\))?$/.exec(name)[1];
};

export const normalizeString = (str: string): string => {
    return str.normalize('NFD').replace(/[\u0300-\u036f":()',.-]/g, '').replace(/\s+/g, '-').replace(/_$/, '');
};

export const getPermaLink = (base: string, composer: string, piece: string, movement?: string): string => {
    return path.normalize(`${base}/${getLastName(composer)}/${normalizeString(piece)}${movement ? '/' + normalizeString(movement) : ''}`);
};

export const modulo = (n: number, m: number): number => {
    return ((n % m) + m) % m;
};
