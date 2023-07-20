import { css } from '@emotion/react';
import { toMedia } from 'src/mediaQuery';
import { hiDpx, screenM } from 'src/screens';

import { colorVars, logoBlue } from 'src/styles/colors';
import { link } from 'src/styles/mixins';
import { camel2prop, camel2var, CSSVariables, desktopPlaylistWidth, navBarHeight, toPx } from 'src/styles/variables';
import { CSSVariableKeys } from 'src/types';

const fontsFolder = '/static/fonts'

// font face helper
type loadFont = (
    fileName: string,
    fontFamily: string,
    fontWeight?: string | number,
    options?: {
        fontStyle?: 'normal' | 'italic' | 'bold';
        textRendering?: 'optimizeLegibility';
        fontDisplay?: 'swap';
        q?: 'v=3.19';
        fontNamedInstance?: string
    }
) => Record<'@font-face', any>;

const loadFont: loadFont = (fontFamily, fileName, fontWeight, options) => {
    const { fontStyle = 'normal', textRendering, q, fontNamedInstance } = options || {};
    return {
        '@font-face': {
            fontFamily,
            src: `
                url('${fontsFolder}/${fileName}.woff2${q ? `?${q}` : ''}') format('woff2'), /* Modern Browsers */
                url('${fontsFolder}/${fileName}.woff${q ? `?${q}` : ''}') format('woff'); /* Modern Browsers */
            `,
            fontWeight,
            fontStyle,
            textRendering,
            fontNamedInstance
        }
    };
};

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
    loadFont('Lato', 'Lato-Hairline', 100, { textRendering: 'optimizeLegibility' }),
    loadFont('Lato', 'Lato-HairlineItalic', 100, { fontStyle: 'italic', textRendering: 'optimizeLegibility' }),
    loadFont('Lato', 'Lato-Thin', 200, { textRendering: 'optimizeLegibility' }),
    loadFont('Lato', 'Lato-ThinItalic', 200, { fontStyle: 'italic', textRendering: 'optimizeLegibility' }),
    loadFont('Lato', 'Lato-Light', 300, { textRendering: 'optimizeLegibility' }),
    loadFont('Lato', 'Lato-LightItalic', 300, { fontStyle: 'italic', textRendering: 'optimizeLegibility' }),
    loadFont('Lato', 'Lato-Regular', 400, { textRendering: 'optimizeLegibility' }),
    loadFont('Lato', 'Lato-Italic', 400, { fontStyle: 'italic', textRendering: 'optimizeLegibility' }),
    loadFont('Lato', 'Lato-Medium', 500, { textRendering: 'optimizeLegibility' }),
    loadFont('Lato', 'Lato-MediumItalic', 500, { fontStyle: 'italic', textRendering: 'optimizeLegibility' }),
    loadFont('Lato', 'Lato-Semibold', 600, { textRendering: 'optimizeLegibility' }),
    loadFont('Lato', 'Lato-SemiboldItalic', 600, { fontStyle: 'italic', textRendering: 'optimizeLegibility' }),
    loadFont('Lato', 'Lato-Bold', 700, { textRendering: 'optimizeLegibility' }),
    loadFont('Lato', 'Lato-BoldItalic', 700, { fontStyle: 'italic', textRendering: 'optimizeLegibility' }),
    loadFont('Lato', 'Lato-Heavy', 800, { textRendering: 'optimizeLegibility' }),
    loadFont('Lato', 'Lato-HeavyItalic', 800, { fontStyle: 'italic', textRendering: 'optimizeLegibility' }),
    loadFont('Lato', 'Lato-Black', 900, { textRendering: 'optimizeLegibility' }),
    loadFont('Lato', 'Lato-BlackItalic', 900, { fontStyle: 'italic', 'textRendering': 'optimizeLegibility' }),

    loadFont('Inter', 'Inter-Thin', 100, { fontDisplay: 'swap', q: 'v=3.19' }),
    loadFont('Inter', 'Inter-ThinItalic', 100, { fontDisplay: 'swap', fontStyle: 'italic', q: 'v=3.19' }),
    loadFont('Inter', 'Inter-ExtraLight', 200, { fontDisplay: 'swap', q: 'v=3.19' }),
    loadFont('Inter', 'Inter-ExtraLightItalic', 200, { fontDisplay: 'swap', fontStyle: 'italic', q: 'v=3.19' }),
    loadFont('Inter', 'Inter-Light', 300, { fontDisplay: 'swap', q: 'v=3.19' }),
    loadFont('Inter', 'Inter-LightItalic', 300, { fontDisplay: 'swap', fontStyle: 'italic', q: 'v=3.19' }),
    loadFont('Inter', 'Inter-Regular', 400, { fontDisplay: 'swap', q: 'v=3.19' }),
    loadFont('Inter', 'Inter-Italic', 400, { fontDisplay: 'swap', fontStyle: 'italic', q: 'v=3.19' }),
    loadFont('Inter', 'Inter-Medium', 500, { fontDisplay: 'swap', q: 'v=3.19' }),
    loadFont('Inter', 'Inter-MediumItalic', 500, { fontDisplay: 'swap', fontStyle: 'italic', q: 'v=3.19' }),
    loadFont('Inter', 'Inter-SemiBold', 600, { fontDisplay: 'swap', q: 'v=3.19' }),
    loadFont('Inter', 'Inter-SemiBoldItalic', 600, { fontDisplay: 'swap', fontStyle: 'italic', q: 'v=3.19' }),
    loadFont('Inter', 'Inter-Bold', 700, { fontDisplay: 'swap', q: 'v=3.19' }),
    loadFont('Inter', 'Inter-BoldItalic', 700, { fontDisplay: 'swap', fontStyle: 'italic', q: 'v=3.19' }),
    loadFont('Inter', 'Inter-ExtraBold', 800, { fontDisplay: 'swap', q: 'v=3.19' }),
    loadFont('Inter', 'Inter-ExtraBoldItalic', 800, { fontDisplay: 'swap', fontStyle: 'italic', q: 'v=3.19' }),

    loadFont('Inter var', 'Inter-roman.var', '100 900', { fontDisplay: 'swap', q: 'v=3.19', fontNamedInstance: 'Regular'}),
    loadFont('Inter var', 'Inter-italic.var', '100 900', { fontStyle: 'italic', fontDisplay: 'swap', q: 'v=3.19', fontNamedInstance: 'Italic'}),

]);
