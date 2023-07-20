// Defines for all the fonts.

export const interFont = (fontWeight?: number, slant?: number) => ({
    fontFamily: 'Inter, sans-serif',
    fontWeight,
    '@supports (font-variation-settings: normal)': {
        fontFamily: 'Inter var, sans-serif',
        fontVariationSettings: `${fontWeight ? `wght ${fontWeight}, ` : ''}slnt -${slant ?? 0}`
    },
    fontFeatureSettings: 'cpsp, ss01, ss03, liga, calt, ccmp, kern'
});

export const latoFont = (fontWeight?: number, italics = false) => ({
    fontFamily: 'Lato, sans-serif',
    fontWeight,
    fontStyle: italics ? 'italic' : 'normal',
});