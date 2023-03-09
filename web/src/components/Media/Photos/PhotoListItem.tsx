import * as React from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { gsap } from 'gsap';

import { LazyImage } from 'src/components/LazyImage';
import { PhotoItem } from 'src/components/Media/Photos/types';
import { idFromItem, resizedPathFromItem, staticPathFromItem } from 'src/components/Media/Photos/utils';
import { ChildRendererProps } from 'src/components/Media/types';

import { lightBlue } from 'src/styles/colors';
import { generateSrcsetWidths, resizedImage } from 'src/imageUrls';
import { screenWidths, screenPortrait, screenXS } from 'src/screens';
import { isImageElement } from 'src/utils';
import { toMedia } from 'src/mediaQuery';

const PhotoRow = styled.div<{ isLoaded: boolean }>`
    position: relative;
    height: 200px;
    border: 1px solid transparent;
    transition: all 0.2s;
    border-radius: 10px;
    cursor: default;
    margin: 10px;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        position: absolute;
        object-fit: cover;
    }

    &:hover {
        cursor: pointer;
        border-color: white;
    }

    ${toMedia([screenXS, screenPortrait])} {
        height: ${props => props.isLoaded ? 'auto' : '300px'};
        line-height: 0;

        img {
            position: relative;
        }

        &:hover {
            border-color: unset;
        }
    }
`;

const Highlight = styled.div<{ active: boolean }>`
    padding-left: 0;
    transition: border 0.15s;
    border-left: 7px solid ${props => props.active ? 'var(--light-blue)' : 'transparent'};
`;

const loadingStyle = css`
    background-color: rgb(208 208 208);
    fill: rgb(208 208 208);
    height: 100%;
    width: 100%;
    position: absolute;
`;

const PhotoListItem: React.FC<ChildRendererProps<PhotoItem>> = (props) => {
    const [isLoaded, setIsLoaded] = React.useState(false);

    const successCb = (el: HTMLImageElement | HTMLElement | Element | undefined) => {
        setIsLoaded(true);
        if (el && isImageElement(el)) {
            gsap.to(el, { duration: 0.2, autoAlpha: 1 });
        }
    };

    const { item, currentItemId, isMobile, onClick } = props;
    const isActive = currentItemId === idFromItem(item);
    const mobileUrl = resizedPathFromItem(item, { gallery: true });
    const desktopUrl = staticPathFromItem(item, { gallery: true, thumbnail: true });
    const mobileWebP = resizedPathFromItem(item, { gallery: true, webp: true });
    const desktopWebP = resizedPathFromItem(item, { gallery: true, thumbnail: true, webp: true });
    const photoRow = (
        <PhotoRow onClick={() => onClick && onClick(item)} isLoaded={isLoaded}>
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
    return isMobile ? photoRow : (
        <Highlight active={isActive}>
            {photoRow}
        </Highlight>
    );
}

export default PhotoListItem;
