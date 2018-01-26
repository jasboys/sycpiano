import { css } from 'emotion';

const xl = '1600px';

interface Rules { [key: string]: string; }

type DimensionName = keyof MediaQueryBounds;

const dimensionNameMap: { [key in DimensionName]: string } = {
    minWidth: 'min-width',
    maxWidth: 'max-width',
};

interface MediaQueryBounds {
    minWidth?: string;
    maxWidth?: string;
}

const mediaQuery = (mediaQueryBounds: MediaQueryBounds): string => {
    const widthQueries = Object
        .keys(mediaQueryBounds)
        .map((dimension: DimensionName) => (
            dimension
                ? `(${dimensionNameMap[dimension]}: ${mediaQueryBounds[dimension]})`
                : ''
        ));

    return widthQueries.reduce((accumulator, curr, idx) => (
        `${accumulator}${idx > 0 ? ` and ${curr}` : curr}`
    ), '');
};

export const screenXL = (rules: Rules) => css({ [mediaQuery({ minWidth: xl })]: rules });