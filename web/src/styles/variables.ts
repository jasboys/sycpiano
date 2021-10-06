// Some styling defines

export const navBarHeight = {
    desktop: 80,
    mobile: 60,
};

export const navBarMarginTop = 18;

const desktopPlaylistWidth = 550;

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
