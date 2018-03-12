import * as React from 'react';
import styled, { css } from 'react-emotion';

import TweenLite from 'gsap/TweenLite';

import { LazyImage } from 'src/components/LazyImage';
import { PhotoItem } from 'src/components/Media/Photos/types';
import { idFromItem, resizedPathFromItem, staticPathFromItem } from 'src/components/Media/Photos/utils';
import { ChildRendererProps } from 'src/components/Media/types';

import { lightBlue } from 'src/styles/colors';
import { generateSrcsetWidths, resizedImage } from 'src/styles/imageUrls';
import { screenWidths } from 'src/styles/screens';

const photoRowHover = (isMobile: boolean): string => (
    isMobile ? css({}) : css`
        &:hover {
            cursor: pointer;
            border-color: ${lightBlue};
        }
    `
);

const PhotoRow = styled<{ isMobile: boolean; }, 'div'>('div') `
    height: ${props => props.isMobile ? 'auto' : '300px'};
    border: 1px solid transparent;
    transition: all 0.2s;
    border-radius: 10px;
    line-height: ${props => props.isMobile ? 0 : 'inherit'};

    img {
        width: 100%;
    }

    /* tslint:disable:declaration-empty-line-before */

    ${props => photoRowHover(props.isMobile)}

    /* tslint:enable:declaration-empty-line-before */

    cursor: default;
    margin: 10px;
    overflow: hidden;
`;

const Highlight = styled<{ active: boolean; }, 'div'>('div') `
    padding-left: 15px;
    transition: border 0.15s;
    border-left: 7px solid ${props => props.active ? lightBlue : 'transparent'};
`;

const loadingStyle = css`
    background-color: rgb(208, 208, 208);
    fill: rgb(208, 208, 208);
    height: 300px;
`;

class PhotoListItem extends React.Component<ChildRendererProps<PhotoItem>, {}> {
    render() {
        const { item, currentItemId, isMobile, onClick } = this.props;
        const isActive = currentItemId === idFromItem(item);
        const mobileUrl = resizedPathFromItem(item, { gallery: true });
        const desktopUrl = staticPathFromItem(item, { gallery: true, thumbnail: true });
        const mobileWebP = resizedPathFromItem(item, { gallery: true, webp: true });
        const desktopWebP = resizedPathFromItem(item, { gallery: true, thumbnail: true, webp: true });
        const photoRow = (
            <PhotoRow onClick={() => onClick && onClick(item)} isMobile={isMobile}>
                <LazyImage
                    id={idFromItem(item)}
                    offset={500}
                    container="photos_ul"
                    alt={item.file}
                    isMobile={isMobile}
                    classNames={{
                        mobile: css` visibility: hidden; `,
                        desktop: css` visibility: hidden; `,
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
                            srcset: resizedImage(desktopWebP, { width: 400 }),
                            sizes: '400px',
                        },
                        jpg: {
                            srcset: `${desktopUrl} 400w`,
                            sizes: '400px',
                        },
                        src: desktopUrl,
                    }}
                    successCb={(el: HTMLImageElement) => {
                        TweenLite.to(el, 0.2, { autoAlpha: 1 });
                    }}
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
}

export default PhotoListItem;