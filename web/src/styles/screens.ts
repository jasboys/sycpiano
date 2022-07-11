// Screen widths for media queries
const xs = '800px';
const m = '1280px';
const xl = '1280px';

export const reactMediaMobileQuery = `(orientation: portrait), (max-width: ${xs})`;
export const reactMediaMediumQuery = `(max-width: ${m})`;

type DimensionName = keyof MediaQueryBounds;

const dimensionNameMap: { [key in DimensionName]: string } = {
    minWidth: 'min-width',
    maxWidth: 'max-width',
    minHeight: 'min-height',
    maxHeight: 'max-height',
    orientation: 'orientation',
};

interface MediaQueryBounds {
    minWidth?: string;
    maxWidth?: string;
    minHeight?: string;
    maxHeight?: string;
    orientation?: string;
}

const mediaQuery = (mediaQueryBounds: MediaQueryBounds): string => {
    const widthQueries =
        (Object.keys(mediaQueryBounds) as DimensionName[])
            .map((dimension: DimensionName) => (
                dimension
                    ? `(${dimensionNameMap[dimension]} : ${mediaQueryBounds[dimension]})`
                    : ''
            ));

    return widthQueries.reduce((accumulator, curr, idx) => (
        `${accumulator}${idx > 0 ? ` and ${curr}` : curr}`
    ), '@media only screen and ');
};

// various media query selector defines
export const screenXS = mediaQuery({ maxWidth: xs });
export const screenM = mediaQuery({ maxWidth: m });
export const screenXL = mediaQuery({ minWidth: xl });
export const screenPortrait = mediaQuery({ orientation: 'portrait' });
export const screenXSandPortrait = mediaQuery({ orientation: 'portrait', maxWidth: xs });
export const screenMandPortrait = mediaQuery({ orientation: 'portrait', maxWidth: m });
export const screenXSorPortrait = `${screenPortrait}, ${screenXS}`;
export const screenMorPortrait = `${screenM}, ${screenPortrait}`;
export const screenBreakPoints = {
    xs: { maxWidth: 640 },
    medium: [{ maxWidth: 1280 }, { orientation: 'portrait' }],
};

// cutoffs for <picture> size queries
export const screenWidths = [1600, 1440, 1080, 800, 768, 720, 640, 480, 320];
export const screenLengths = [2560, 2160, 1920, 1600, 1440, 1366, 1280, 1024];
