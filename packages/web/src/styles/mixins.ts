// Various CSS emotion mixins

import { css } from '@emotion/react';
import { mix, darken } from 'polished';

import { hiDpx } from 'src/screens';
import { navBarHeight } from 'src/styles/variables';
import { logoBlue } from './colors';
import { toMedia } from 'src/mediaQuery';

export const pushedHelper = (marginTop: number, unit: '%' | 'vh' = '%') => ({
    height: `calc(100${unit} - ${marginTop}px)`,
    marginTop: `${marginTop}px`,
});

export const pushedDesktop = css(pushedHelper(navBarHeight.lowDpx));
export const pushedMobile = css(pushedHelper(navBarHeight.hiDpx));

export const pushed = css({
    ...pushedHelper(navBarHeight.lowDpx),
    [toMedia(hiDpx)]: {
        ...pushedHelper(navBarHeight.hiDpx),
    },
});

export const link = (colorString: string, hoverDelta = 0.2) => css({
    color: colorString,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.5s',
    '&:hover': {
        color: darken(hoverDelta, colorString),
    }
});

export const container = css({
    position: 'absolute',
    top: 0,
    left: 0,
});

export const noHighlight = css({
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
});

export const getHoverStyle = (isMouseDown: boolean) => css({
    backgroundColor: mix(0.75, logoBlue, '#FFF'),
    color: 'white',
    cursor: 'pointer',
    border: `1px solid ${mix(0.75, logoBlue, '#FFF')}`,
    transform: isMouseDown ? 'translateY(-1.2px) scale(1.01)' : 'translateY(-2px) scale(1.04)',
    boxShadow: isMouseDown ? '0 1px 2px rgba(0, 0, 0, 0.8)' : '0 4px 6px rgba(0, 0, 0, 0.4)',
});

export const cardShadow = `
    0 1px 3px 0 rgba(0 0 0 / 0.2),
    0 1px 1px 0 rgba(0 0 0 / 0.14),
    0 2px 1px -1px rgba(0 0 0 / 0.12);
`