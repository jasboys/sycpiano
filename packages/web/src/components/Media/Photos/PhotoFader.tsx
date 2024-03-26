import { css } from '@emotion/react';
import { fitGradient } from 'dont-crop';
import { gsap } from 'gsap';
import * as React from 'react';
import { Transition } from 'react-transition-group';

import { LazyImage } from 'src/components/LazyImage';
import type { PhotoItem } from 'src/components/Media/Photos/types';
import {
    idFromItem,
    resizedPathFromItem,
    staticPathFromItem,
} from 'src/components/Media/Photos/utils';
import { useAppDispatch } from 'src/hooks.js';
import { generateSrcsetWidths } from 'src/imageUrls';
import { screenWidths } from 'src/screens';
import { fadeOnEnter, fadeOnExit, isImageElement } from 'src/utils';
import { setBackground } from './reducers.js';
import { lightBlue } from 'src/styles/colors.js';
import { LoadingInstance } from 'src/components/LoadingSVG.jsx';

interface PhotoFaderProps {
    readonly item: PhotoItem;
    readonly isCurrent?: boolean;
    readonly idx: number;
    isMobile: boolean;
}

const spinnerStyle = css({
    position: 'absolute',
    padding: '0.18rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    backgroundColor: 'rgba(255 255 255 / 0.5)',
    boxShadow: '0px 2px 7px -2px rgba(0 0 0 / 0.8)',
    svg: {
        padding: '0.7rem',
        fill: 'none',
        stroke: lightBlue,
        height: 120,
    },
});

const LoadingGroup = () => {
    return (
        <div css={spinnerStyle}>
            <LoadingInstance />
        </div>
    );
};

const PhotoFader: React.FC<PhotoFaderProps> = ({
    item,
    isCurrent,
    idx,
    isMobile,
}) => {
    const urlWebP = resizedPathFromItem(item, { gallery: true, webp: true });
    const urlJpg = resizedPathFromItem(item, { gallery: true });
    const dispatch = useAppDispatch();

    const successCb = React.useCallback(
        (el: HTMLImageElement | HTMLElement | Element | undefined) => {
            if (el && isImageElement(el)) {
                dispatch(setBackground(fitGradient(el)));
                gsap.to(el, { autoAlpha: 1, duration: 0.2 });
            }
        },
        [],
    );

    return (
        <Transition<undefined>
            key={idx}
            mountOnEnter={true}
            unmountOnExit={true}
            in={isCurrent}
            onEntering={fadeOnEnter()}
            onExiting={fadeOnExit()}
            appear={true}
            timeout={250}
        >
            <LazyImage
                id={`${idFromItem(item)}_view`}
                alt="Sean Chen Pianist Photo Viewer"
                csss={{
                    desktop: css` visibility: hidden; `,
                    picture: css`
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        padding: 1rem 1rem 3rem;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        img {
                            box-shadow: 0px 2px 7px -2px rgba(0 0 0 / 0.8);
                        }
                    `,
                }}
                desktopAttributes={{
                    webp: {
                        srcset: generateSrcsetWidths(urlWebP, screenWidths),
                        sizes: '100vh',
                    },
                    jpg: {
                        srcset: generateSrcsetWidths(urlJpg, screenWidths),
                        sizes: '100vh',
                    },
                    src: staticPathFromItem(item),
                }}
                loadingComponent={LoadingGroup}
                successCb={successCb}
                isMobile={isMobile}
            />
        </Transition>
    );
};

const MemoedFader = React.memo(PhotoFader);

export default MemoedFader;
