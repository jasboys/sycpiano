// Various CSS emotion mixins

import { css, SerializedStyles } from '@emotion/react';
import { mix } from 'polished';
import darken from 'polished/lib/color/darken';

import { screenMorPortrait } from 'src/styles/screens';
import { navBarHeight } from 'src/styles/variables';
import { logoBlue } from './colors';

export const pushedHelper = (marginTop: number): { height: string; marginTop: string } => ({
    height: `calc(100% - ${marginTop}px)`,
    marginTop: `${marginTop}px`,
});

export const pushedDesktop = css(pushedHelper(navBarHeight.desktop));
export const pushedMobile = css(pushedHelper(navBarHeight.mobile));

export const pushed = css({
    ...pushedHelper(navBarHeight.desktop),
    [screenMorPortrait]: {
        ...pushedHelper(navBarHeight.mobile),
    },
});

export const link = (colorString: string, hoverDelta = 0.2): SerializedStyles => css`
    color: ${colorString};
    text-decoration: none;
    cursor: pointer;
    transition: color 0.5s;

    :hover {
        color: ${darken(hoverDelta, colorString)};
    }
`;

export const container = css`
    position: absolute;
    top: 0;
    left: 0;
`;

export const noHighlight = css({
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
})

export const getHoverStyle = (isMouseDown: boolean) => ({
    backgroundColor: mix(0.75, logoBlue, '#FFF'),
    color: 'white',
    cursor: 'pointer',
    border: `1px solid ${mix(0.75, logoBlue, '#FFF')}`,
    transform: isMouseDown ? 'translateY(-1.2px) scale(1.01)' : 'translateY(-2px) scale(1.04)',
    boxShadow: isMouseDown ? '0 1px 2px rgba(0, 0, 0, 0.8)' : '0 4px 6px rgba(0, 0, 0, 0.4)',
});