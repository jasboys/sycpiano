import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { gsap } from 'gsap';
import * as React from 'react';

import { toMedia } from 'src/MediaQuery';
import { LazyImage } from 'src/components/LazyImage';
import { PhotoItem } from 'src/components/Media/Photos/types';
import {
    idFromItem,
    resizedPathFromItem,
    staticPathFromItem,
} from 'src/components/Media/Photos/utils';
import { ChildRendererProps } from 'src/components/Media/types';
import { generateSrcsetWidths, resizedImage } from 'src/imageUrls';
import { screenPortrait, screenWidths, screenXS } from 'src/screens';
import { isImageElement } from 'src/utils';

const PhotoRow = styled.div<{ isLoaded: boolean }>(
    {
        position: 'relative',
        height: 200,
        transition: 'all 0.2s',
        borderRadius: 10,
        cursor: 'default',
        margin: 10,
        overflow: 'hidden',
        boxShadow: '0px 2px 7px -2px rgba(0 0 0 / 0.8)',
        img: {
            width: '100%',
            height: '100%',
            position: 'absolute',
            objectFit: 'cover',
        },
        '&:hover': {
            cursor: 'pointer',
            borderColor: 'white',
        },
        [toMedia([screenXS, screenPortrait])]: {
            lineHeight: 0,

            img: {
                position: 'relative',
            },

            '&:hover': {
                borderColor: 'unset',
            },
        },
    },
    ({ isLoaded }) => ({
        [toMedia([screenXS, screenPortrait])]: {
            height: isLoaded ? 'auto' : 300,
        },
    }),
);

const Highlight = styled.div<{ active: boolean }>(
    {
        paddingLeft: 0,
        transition: 'border 0.15s',
    },
    ({ active }) => ({
        borderLeft: `7px solid ${active ? 'var(--light-blue)' : 'transparent'}`,
    }),
);

const loadingStyle = css({
    backgroundColor: 'rgb(208 208 208)',
    fill: 'rgb(208 208 208)',
    height: '100%',
    width: '100%',
    position: 'absolute',
});

const PhotoListItem: React.FC<ChildRendererProps<PhotoItem>> = (props) => {
    const [isLoaded, setIsLoaded] = React.useState(false);

    const successCb = React.useCallback(
        (el: HTMLImageElement | HTMLElement | Element | undefined) => {
            setIsLoaded(true);
            if (el && isImageElement(el)) {
                gsap.to(el, { duration: 0.2, autoAlpha: 1 });
            }
        },
        [],
    );

    const { item, currentItemId, isMobile, onClick } = props;
    const isActive = currentItemId === idFromItem(item);
    const mobileUrl = resizedPathFromItem(item, { gallery: true });
    const desktopUrl = staticPathFromItem(item, {
        gallery: true,
        thumbnail: true,
    });
    const mobileWebP = resizedPathFromItem(item, { gallery: true, webp: true });
    const desktopWebP = resizedPathFromItem(item, {
        gallery: true,
        thumbnail: true,
        webp: true,
    });
    const photoRow = (
        <PhotoRow onClick={() => onClick?.(item)} isLoaded={isLoaded}>
            <LazyImage
                id={idFromItem(item)}
                offset={500}
                container="photos_ul"
                alt={item.file}
                isMobile={isMobile}
                loadingComponent="default"
                csss={{
                    mobile: css({ visibility: 'hidden' }),
                    desktop: css({ visibility: 'hidden' }),
                    loading: loadingStyle,
                }}
                mobileAttributes={{
                    webp: {
                        srcset: generateSrcsetWidths(mobileWebP, screenWidths),
                        sizes: '100vw',
                    },
                    jpg: {
                        srcset: generateSrcsetWidths(mobileUrl, screenWidths),
                        sizes: '100vw',
                    },
                    src: resizedImage(mobileUrl, { width: 640 }),
                }}
                desktopAttributes={{
                    webp: {
                        srcset: resizedImage(desktopWebP, { width: 300 }),
                        sizes: '300px',
                    },
                    jpg: {
                        srcset: `${desktopUrl} 300w`,
                        sizes: '300px',
                    },
                    src: desktopUrl,
                }}
                successCb={successCb}
            />
        </PhotoRow>
    );
    // Only wrap with Highlight component in non-mobile width/layout,
    // since photos aren't selectable in mobile width/layout
    // (i.e. the user doesn't need to know which photo is currently selected).
    return isMobile ? (
        photoRow
    ) : (
        <Highlight active={isActive}>{photoRow}</Highlight>
    );
};

export default PhotoListItem;
