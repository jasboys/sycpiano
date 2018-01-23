import * as React from 'react';
import styled from 'react-emotion';
import { Transition } from 'react-transition-group';

import TweenLite from 'gsap/TweenLite';

import PlaylistToggler from 'src/components/Media/PlaylistToggler';
import { PlaylistProps } from 'src/components/Media/types';
import { playlistBackground } from 'src/styles/colors';
import { lato1 } from 'src/styles/fonts';
import { noHighlight } from 'src/styles/mixins';
import { playlistTogglerWidth, playlistWidth } from 'src/styles/variables';

const slideLeft = (element: HTMLElement, amount: number, delay = 0) => {
    TweenLite.fromTo(element, 0.4, { x: amount }, { x: 0, ease: 'Power3.easeOut', delay });
};

const slideRight = (element: HTMLElement, amount: number, delay = 0) => {
    TweenLite.fromTo(element, 0.4, { x: 0 }, { x: amount, ease: 'Power3.easeOut', delay });
};

// need to add in css from parent
const PlaylistAndToggler = styled<{ extraStyles: string; }, 'div'>('div')`
    position: fixed;
    height: inherit;
    right: 0;
    width: ${playlistWidth};
    transform: translateX(${playlistWidth - playlistTogglerWidth}px);
    font-family: ${lato1};
    z-index: 50;
    display: flex;
    ${noHighlight}
    ${props => props.extraStyles}
`;

const StyledPlaylist = styled('ul')`
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    flex: 1;
    align-self: flex-start;
    background-color: ${playlistBackground};
`;

class Playlist<T> extends React.Component<PlaylistProps<T>, {}> {
    ulRef: HTMLUListElement = null;

    render() {
        const props = this.props;
        return (
            <Transition
                in={props.isShow}
                appear={true}
                onEnter={(el, isAppearing) => {
                    const amount = this.ulRef.getBoundingClientRect().width;
                    if ((!props.hasToggler || !props.shouldAppear) && isAppearing) {
                        el.style.transform = 'translateX(0)';
                    } else {
                        slideLeft(el, amount, (isAppearing) ? 0.25 : 0);
                    }
                }}
                onExit={(el) => {
                    const amount = this.ulRef.getBoundingClientRect().width;
                    slideRight(el, amount);
                }}
                timeout={400}
            >
                <PlaylistAndToggler extraStyles={props.extraStyles}>
                    {props.hasToggler && <PlaylistToggler
                        isPlaylistVisible={props.isShow}
                        onClick={() => {
                            props.togglePlaylist();
                        }}
                    />}
                    <StyledPlaylist innerRef={(ul) => this.ulRef = ul}>
                        {props.items.map((item: any) => (
                            <props.ChildRenderer
                                key={item.id}
                                currentItemId={props.currentItemId}
                                item={item}
                                onClick={props.onClick}
                            />
                        ))}
                    </StyledPlaylist>
                </PlaylistAndToggler>
            </Transition>
        );
    }
}

export default Playlist;
