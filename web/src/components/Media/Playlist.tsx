import * as React from 'react';
import { Transition } from 'react-transition-group';

import { css } from '@emotion/react';

import { gsap } from 'gsap';

import PlaylistToggler from 'src/components/Media/PlaylistToggler';
import { PlaylistProps } from 'src/components/Media/types';
import { playlistBackground } from 'src/styles/colors';
import { lato1 } from 'src/styles/fonts';
import { noHighlight } from 'src/styles/mixins';
import { screenM, screenXSorPortrait } from 'src/styles/screens';
import { playlistContainerWidth, playlistWidth } from 'src/styles/variables';

const slideLeft = (element: HTMLElement, amount: number, delay = 0) => {
    gsap.fromTo(element, { x: amount, duration: 0.4 }, { x: 0, ease: 'Power3.easeOut', delay });
};

const slideRight = (element: HTMLElement, amount: number, delay = 0) => {
    gsap.fromTo(element, { x: 0, duration: 0.4 }, { x: amount, ease: 'Power3.easeOut', delay });
};

// need to add in css from parent
const playlistContainerStyle = css`
    position: absolute;
    height: 100%;
    right: 0;
    width: ${playlistContainerWidth.desktop};
    transform: translateX(${playlistWidth.desktop});
    font-family: ${lato1};
    z-index: 50;
    display: flex;
    ${noHighlight}

    ${screenM} {
        width: ${playlistContainerWidth.tablet};
        transform: translateX(${playlistWidth.tablet});
    }

    ${screenXSorPortrait} {
        width: 100%;
    }
`;

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

const Playlist: React.FC<PlaylistProps> = (props) => {
    const ulRef = React.useRef<HTMLUListElement>(null);

    const onEnter = (el: HTMLElement, isAppearing: boolean): void => {
        if ((!props.hasToggler || !props.shouldAppear) && isAppearing) {
            el.style.transform = 'translateX(0)';
        } else {
            if (ulRef.current) {
                const amount = ulRef.current.getBoundingClientRect().width;
                slideLeft(el, amount, (isAppearing) ? 0.25 : 0);
            }
        }
    };

    const onExit = (el: HTMLElement): void => {
        if (ulRef.current) {
            const amount = ulRef.current.getBoundingClientRect().width;
            slideRight(el, amount);
        }
    };

    return (
        <Transition<undefined>
            in={props.isShow}
            appear={true}
            onEnter={onEnter}
            onExit={onExit}
            timeout={400}
        >
            <div
                css={[
                    playlistContainerStyle,
                    props.extraStyles && props.extraStyles.div,
                ]}
            >
                {props.hasToggler && (
                    <PlaylistToggler
                        isPlaylistVisible={props.isShow}
                        onClick={() => {
                            props.togglePlaylist?.();
                        }}
                    />
                )}
                <ul
                    id={props.id}
                    ref={ulRef}
                    css={[
                        playlistStyle,
                        props.extraStyles && props.extraStyles.ul,
                    ]}
                    onScroll={props.onScroll}
                >
                    {props.children}
                </ul>
            </div>
        </Transition>
    );
}


export default Playlist;
