// Some styling defines

import decamelize from 'decamelize';
import { CSSVariableKeys } from 'src/types';

export const camel2prop = (property: CSSVariableKeys) => {
    return `--${decamelize(property, { separator: '-' })}`;
};

export const camel2var = (property: CSSVariableKeys) => {
    return `var(${camel2prop(property)})`;
};

export const toPx = (value: string | number) => {
    return typeof value === 'number' ? `${value}px` : value;
};

// true and false allow indexing using hiDpx boolean
export const navBarHeight = {
    get(hiDpx: boolean) {
        return hiDpx ? 60 : 80;
    },
    lowDpx: 80,
    hiDpx: 60,
};

export const navBarMarginTop = 18;

export const desktopPlaylistWidth = 550;

export const playlistContainerWidth = {
    desktop: `${desktopPlaylistWidth}px`,
    tablet: '45vw',
};

export const playlistTogglerWidth = 24;

export const playlistWidth = {
    desktop: `${desktopPlaylistWidth - playlistTogglerWidth}px`,
    tablet: `calc(${playlistContainerWidth.tablet} - ${playlistTogglerWidth}px)`,
};

export const playlistPadding = 10;

export const cartWidth = 400;

export const CSSVariables = {
    navBarHeight: navBarHeight.lowDpx,
    // navBarHeightHiDpx: navBarHeight.hiDpx,
    navBarMarginTop,
    playlistContainerWidth: desktopPlaylistWidth,
    // playlistContainerWidthMedium: '45vw',
    playlistTogglerWidth: 24,
    playlistWidth: 'calc(var(--playlist-container-width) - var(--playlist-toggler-width))',
    // playlistWidthMedium: `calc(${camel2var('playlistContainerWidthMedium')} - ${camel2var('playlistTogglerWidth')})`,
    playlistPadding,
    cartWidth,
};
