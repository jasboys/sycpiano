import { css } from '@emotion/react';
import { gsap } from 'gsap';
import * as React from 'react';
import { Transition } from 'react-transition-group';

import PlaylistToggler from 'src/components/Media/PlaylistToggler';
import type { PlaylistProps } from 'src/components/Media/types';
import { toMedia } from 'src/mediaQuery';
import { screenM, screenPortrait, screenXS } from 'src/screens';
import { playlistBackground } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';
import { noHighlight } from 'src/styles/mixins';
import { playlistContainerWidth, playlistWidth } from 'src/styles/variables';

const slideLeft = (element: HTMLElement, amount: number, delay = 0) => {
    gsap.fromTo(
        element,
        { x: amount, duration: 0.4 },
        { x: 0, ease: 'Power3.easeOut', delay },
    );
};

const slideRight = (element: HTMLElement, amount: number, delay = 0) => {
    gsap.fromTo(
        element,
        { x: 0, duration: 0.4 },
        { x: amount, ease: 'Power3.easeOut', delay },
    );
};

// need to add in css from parent
const playlistContainerStyle = css(latoFont(100), noHighlight, {
    position: 'absolute',
    height: '100%',
    right: 0,
    width: playlistContainerWidth.desktop,
    transform: `translateX(${playlistWidth.desktop})`,
    zIndex: 50,
    display: 'flex',

    [toMedia(screenM)]: {
        width: playlistContainerWidth.tablet,
        transform: `translateX(${playlistWidth.tablet})`,
    },

    [toMedia([screenXS, screenPortrait])]: {
        width: '100%',
    },
});

const playlistStyle = css`
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    flex: 1;
    align-self: flex-start;
    background-color: ${playlistBackground};
`;

const Playlist = React.forwardRef<HTMLElement, PlaylistProps>((props, ref) => {
    const ulRef = React.useRef<HTMLUListElement | null>(null);
    const divRef = React.useRef<HTMLDivElement | null>(null);

    const onEnter = (isAppearing: boolean): void => {
        if ((!props.hasToggler || !props.shouldAppear) && isAppearing) {
            if (divRef.current) {
                divRef.current.style.transform = 'translateX(0)';
            }
        } else {
            if (ulRef.current && divRef.current) {
                const amount = ulRef.current.getBoundingClientRect().width;
                slideLeft(divRef.current, amount, isAppearing ? 0.25 : 0);
            }
        }
    };

    const onExit = (): void => {
        if (ulRef.current && divRef.current) {
            const amount = ulRef.current.getBoundingClientRect().width;
            slideRight(divRef.current, amount);
        }
    };

    return (
        <Transition
            in={props.isShow}
            appear={true}
            onEnter={onEnter}
            onExit={onExit}
            timeout={400}
            nodeRef={divRef}
        >
            <div
                css={[playlistContainerStyle, props.extraStyles?.div]}
                ref={divRef}
            >
                {props.hasToggler && (
                    <PlaylistToggler
                        isPlaylistVisible={props.isShow}
                        style={props.extraStyles?.toggler}
                        onClick={() => {
                            props.togglePlaylist?.();
                        }}
                    />
                )}
                <ul
                    id={props.id}
                    ref={(el) => {
                        ulRef.current = el;
                        if (ref) {
                            if (ref instanceof Function) {
                                ref(el);
                            } else {
                                ref.current = el;
                            }
                        }
                    }}
                    css={[playlistStyle, props.extraStyles?.ul]}
                    onScroll={props.onScroll}
                >
                    {props.children}
                </ul>
            </div>
        </Transition>
    );
});

export default Playlist;
