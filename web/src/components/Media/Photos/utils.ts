import * as path from 'path';

import { PhotoItem } from 'src/components/Media/Photos/types';

export const idFromItem = (item: PhotoItem): string =>
        item && path.basename(item.file, '.jpg');

export const staticPathFromItem = (item: PhotoItem, options?: { gallery?: boolean; thumbnail?: boolean }): string =>
        item && path.normalize(path.join(
                '/static/images',
                (options && options.gallery) ? 'gallery' : '',
                (options && options.thumbnail) ? 'thumbnails' : '',
                item.file,
        ));

export const resizedPathFromItem = (item: PhotoItem, options?: { gallery?: boolean; thumbnail?: boolean; webp?: boolean }): string =>
        item && path.normalize(path.join(
                '/',
                (options && options.gallery) ? 'gallery' : '',
                (options && options.thumbnail) ? 'thumbnails' : '',
                (options && options.webp) ? item.file.replace('jpg', 'webp') : item.file,
        ));
