import path from 'path-browserify';

import type { PhotoItem } from 'src/components/Media/Photos/types';

export const idFromItem = (item?: PhotoItem): string | undefined =>
    item === undefined ? undefined : path.basename(item.file, '.jpg');

export const staticPathFromItem = (
    item: PhotoItem,
    options?: { gallery?: boolean; thumbnail?: boolean },
): string =>
    item &&
    path.normalize(
        path.join(
            '/static/images',
            options?.gallery ? 'gallery' : '',
            options?.thumbnail ? 'thumbnails' : '',
            item.file,
        ),
    );

export const resizedPathFromItem = (
    item: PhotoItem,
    options?: { gallery?: boolean; thumbnail?: boolean; webp?: boolean },
): string =>
    item &&
    path.normalize(
        path.join(
            '/',
            options?.gallery ? 'gallery' : '',
            options?.thumbnail ? 'thumbnails' : '',
            options?.webp ? item.file.replace('jpg', 'webp') : item.file,
        ),
    );
