import { css } from '@emotion/react';
import { toMedia } from 'src/mediaQuery';
import { hiDpx, screenM } from 'src/screens';

import { colorVars, logoBlue } from 'src/styles/colors';
import { link } from 'src/styles/mixins';
import { camel2prop, camel2var, CSSVariables, desktopPlaylistWidth, navBarHeight, toPx } from 'src/styles/variables';
import { CSSVariableKeys } from 'src/types';

// font face helper
const loadFont = (fileName: string, fontFamily: string) => ({
    '@font-face': {
        fontFamily: fontFamily,
        src: `
            url('/static/fonts/${fileName}.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
            url('/static/fonts/${fileName}.woff2') format('woff2'), /* Modern Browsers */
            url('/static/fonts/${fileName}.woff') format('woff'), /* Modern Browsers */
            url('/static/fonts/${fileName}.ttf') format('truetype'),
            url('/static/fonts/${fileName}.svg#${fontFamily}') format('svg')
        `,
        fontWeight: 'normal',
        fontStyle: 'normal',
    }
});

// global CSS to be injected by <Global> component in App.tsx
export const globalCss = css([
    {
        ':root': {
            ...Object.entries(CSSVariables).reduce((prev, [prop, val]) => {
                return {
                    ...prev,
                    [camel2prop(prop as CSSVariableKeys)]: toPx(val),
                }
            }, {}),
            ...Object.entries(colorVars).reduce((prev, [prop, val]) => {
                return {
                    ...prev,
                    [camel2prop(prop as CSSVariableKeys)]: toPx(val),
                }
            }, {}),
            [toMedia(hiDpx)]: {
                [camel2prop('navBarHeight')]: toPx(navBarHeight.hiDpx),
            },
            [toMedia(screenM)]: {
                [camel2prop('playlistContainerWidth')]: '45vw',
                [camel2prop('playlistWidth')]: `calc(${camel2var('playlistContainerWidth')} - ${camel2var('playlistTogglerWidth')})`
            },
        },

        '*': {
            boxSizing: 'border-box',
            outline: 'none',
        },

        'html': {
            height: '100%',
            overflow: 'hidden',
        },

        'body': {
            margin: 0,
            height: '100%',
            backgroundColor: 'white',
        },

        '#app': {
            height: '100%',
        },

        'a': link(logoBlue),
    },
    loadFont('lato-hairline', 'LatoHairline'),
    loadFont('lato-thin', 'LatoThin'),
    loadFont('lato-light', 'LatoLight'),
    loadFont('lato-black', 'LatoBlack'),
    loadFont('lato-medium', 'LatoMedium'),
    loadFont('lato-bold', 'LatoBold'),
    loadFont('lato-semibold', 'LatoSemibold'),
    loadFont('lato-regular', 'LatoRegular'),
    loadFont('lato-heavy', 'LatoHeavy'),
    loadFont('lato-hairlineitalic', 'LatoHairlineItalic'),
    loadFont('lato-thinitalic', 'LatoThinItalic'),
    loadFont('lato-lightitalic', 'LatoLightItalic'),
    loadFont('lato-blackitalic', 'LatoBlackItalic'),
    loadFont('lato-mediumitalic', 'LatoMediumItalic'),
    loadFont('lato-bolditalic', 'LatoBoldItalic'),
    loadFont('lato-semibolditalic', 'LatoSemiboldItalic'),
    loadFont('lato-italic', 'LatoItalic'),
    loadFont('lato-heavyitalic', 'LatoHeavyItalic'),
]);
