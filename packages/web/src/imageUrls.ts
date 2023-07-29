/* global IMAGES_PATH */
type imageFormat = 'jpg' | 'webp';

// Functions to return the correct image url, depending on jpg or webp.
export const sycWithPianoBW = (format: imageFormat = 'jpg'): string =>
    `/syc_withpiano_bw.${format}`;
export const cliburn1 = (format: imageFormat = 'jpg'): string =>
    `/gallery/cliburn1.${format}`;
export const seanChenContactPhotoUrl = (format: imageFormat = 'jpg'): string =>
    `/gallery/syc_headshot1.${format}`;
export const joelHarrisonContactPhotoUrl = (
    format: imageFormat = 'jpg',
): string => `/joel.${format}`;
export const marthaWoodsContactPhotoUrl = (): string => '/logos/wentworth.svg';
// export const marthaWoodsContactPhotoUrl = (format: imageFormat = 'jpg') => `/wentworth.${format}`;
export const bg1 = '/bg_1.jpg';
export const homeBackground = (format: imageFormat = 'jpg'): string =>
    `/syc_chair_bg_clean.${format}`;
export const sycChairVertical = (format: imageFormat = 'jpg'): string =>
    `/syc_chair_vertical.${format}`;

// url should contain leading slash
export const staticImage = (url: string): string => `${IMAGES_PATH}${url}`;

import { stringify } from 'qs';

// Generates url to call the resized api for specified image and dimensions.
export const resizedImage = (
    url: string,
    opt: { width?: number; height?: number },
): string => `/resized${url}?${stringify(opt)}`;

// Generates source set urls and widths for <picture> elements.
export const generateSrcsetWidths = (url: string, widths: number[]): string =>
    widths.reduce((acc, curr) => {
        return `${resizedImage(url, {
            width: curr,
        })} ${curr}w${acc ? ', ' : ''}${acc}`;
    }, '');

// Generates source set urls and heights for <picture> elements.
export const generateSrcsetHeights = (url: string, heights: number[]): string =>
    heights.reduce((acc, curr) => {
        return `${resizedImage(url, {
            height: curr,
        })} ${curr}h${acc ? ', ' : ''}${acc}`;
    }, '');
