import { obj2mq } from './mediaQuery';

// Screen widths for media queries
const xs = 640;
const s = 800;
const m = 1024;
const l = 1280;
const xl = 1920;

// Screen heights for media queries
const short = 800;

// various media query selector defines
export const screenTouch = { hover: 'none', pointer: 'coarse' };
export const screenXS = { maxWidth: xs };
export const screenS = { maxWidth: s };
export const screenM = { maxWidth: m };
export const screenL = { maxWidth: l };
export const screenPortrait = { orientation: 'portrait' };
export const screenLandscape = { orientation: 'landscape' };
export const screenShort = { maxHeight: short };
export const minRes = { minResolution: 2.1 };
export const webkitMinDPR = { '-webkit-min-device-pixel-ratio': 2.1 };
export const isHamburger = {
    or: [
        minRes,
        webkitMinDPR,
        screenPortrait,
        { and: [screenL, screenLandscape] },
    ],
};

export const screenXL = { minWidth: xl };
export const screenLandLandscape = { ...screenLandscape, ...screenL };
export const screenXSandPortrait = { ...screenPortrait, ...screenXS };
export const screenMandPortrait = { ...screenPortrait, ...screenM };
export const hiDpx = [
    minRes,
    webkitMinDPR,
    { and: [screenShort, screenPortrait] },
];
export const GLOBAL_QUERIES = {
    screenTouch: obj2mq(screenTouch),
    screenXS: obj2mq(screenXS),
    screenS: obj2mq(screenS),
    screenM: obj2mq(screenM),
    screenL: obj2mq(screenL),
    screenPortrait: obj2mq(screenPortrait),
    screenLandscape: obj2mq(screenLandscape),
    hiDpx: obj2mq(hiDpx),
    isHamburger: obj2mq(isHamburger),
};

// cutoffs for <picture> size queries
export const screenWidths = [1600, 1440, 1080, 800, 768, 720, 640, 480, 320];
export const screenLengths = [2560, 2160, 1920, 1600, 1440, 1366, 1280, 1024];
