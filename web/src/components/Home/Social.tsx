import styled from '@emotion/styled';
import * as React from 'react';
import { Transition } from 'react-transition-group';

import { Elastic, TweenLite } from 'gsap';

import { lato2i } from 'src/styles/fonts';
import { staticImage } from 'src/styles/imageUrls';
import { noHighlight } from 'src/styles/mixins';
import { screenXSandPortrait, screenXSorPortrait } from 'src/styles/screens';

import socials from 'src/components/Home/socials';

const textShadowColor = 'rgba(0, 0, 0, 0.75)';

const Handle = styled('div')`
    ${noHighlight}
    margin: 15px 0;
    font-family: ${lato2i};
    font-size: 30px;
    color: white;
    text-shadow: 0 0 6px ${textShadowColor};
    text-decoration: underline;
    -webkit-tap-highlight-color: transparent;

    &:hover {
        cursor: pointer;
    }

    ${screenXSorPortrait} {
        width: 100%;
        bottom: 15%;
    }
`;

const SocialContainer = styled('div')`
    position: absolute;
    width: fit-content;
    top: 55%;
    left: 50%;
    transform: translateX(-50%);

    ${screenXSandPortrait} {
        bottom: 12%;
        font-size: 0.8rem;
        top: unset;
    }
`;

const SocialLink = styled.a<{ show: boolean; canHover: boolean }>`
    padding: 1.5rem 0;
    width: calc(100vw / ${Object.keys(socials).length});
    max-width: 120px;
    flex: 0 0 auto;
    height: 100%;
    opacity: 0;
    pointer-events: ${props => props.show ? 'unset' : 'none'};
    filter: drop-shadow(0 0 0.5rem black);

    ${screenXSandPortrait} {
        padding: 0.8rem 0;
    }

    ${props => props.canHover ? `
        transition: transform 0.1s linear, filter 0.1s linear;
        &:hover {
            transform: scale(1.1);
            filter: drop-shadow(0 0 0.75rem black);
        }
    ` : ''}
`;

const SocialIconsContainer = styled.div`
    display: flex;
`;

interface SocialMediaLinkProps {
    className?: string;
    social: string;
    show: boolean;
    canHover: boolean;
    url: string;
}

const SocialMediaLink: React.FC<SocialMediaLinkProps> = (props) => (
    <SocialLink canHover={props.canHover} show={props.show} href={props.url} target="_blank">
        <img
            className={''}
            src={staticImage(`/logos/${props.social}.svg`)}
        />
    </SocialLink>
);

interface SocialState {
    show: boolean;
    canHover: { [key: string]: boolean };
}

class Social extends React.PureComponent<Record<string, unknown>, SocialState> {
    defaultCanHover = Object.keys(socials).reduce((prev, curr) => {
        return {
            ...prev,
            [curr]: false,
        };
    }, {});

    state: SocialState = {
        show: false,
        canHover: this.defaultCanHover,
    };

    onHandleClick = (): void => {
        this.setState({ show: !this.state.show });
    }

    onSocialEnter = (id: number) => (el: HTMLLinkElement): void => {
        const relative = id - (Object.keys(socials).length / 2 - 0.5);
        TweenLite.fromTo(el, 0.25,
            {
                opacity: 0,
                y: `-50%`,
                x: `${relative * -100}%`,
            }, {
                opacity: 1,
                y: `0%`,
                x: `0%`,
                delay: .05 * id,
                ease: Elastic.easeOut.config(1, 0.75),
                clearProps: 'transform',
            });
    }

    onSocialExit = (id: number) => (el: HTMLLinkElement): void => {
        const relative = id - Math.floor(Object.keys(socials).length / 2);
        TweenLite.fromTo(el, 0.25,
            {
                opacity: 1,
                y: `0%`,
                x: `0%`,
            }, {
                opacity: 0,
                y: `-50%`,
                x: `${relative * -100}%`,
                delay: .05 * id,
                ease: Elastic.easeOut.config(1, 0.75),
                clearProps: 'transform',
            });
        this.setState({ canHover: this.defaultCanHover });
    }
    render(): JSX.Element {
        return (
            <SocialContainer>
                <Handle onClick={this.onHandleClick}>@seanchenpiano</Handle>
                <SocialIconsContainer>
                    {
                        Object.keys(socials).map((key, idx) => (
                            <Transition<undefined>
                                key={key}
                                in={this.state.show}
                                onEnter={this.onSocialEnter(idx)}
                                onExit={this.onSocialExit(idx)}
                                timeout={250 + 50 * idx}
                                onEntered={() => this.setState({ canHover: { ...this.state.canHover, [key]: true } })}
                            >
                                <SocialMediaLink canHover={this.state.canHover[key]} show={this.state.show} url={socials[key]} social={key} />
                            </Transition>
                        ))
                    }
                </SocialIconsContainer>
            </SocialContainer>
        );
    }
}

export default Social;
