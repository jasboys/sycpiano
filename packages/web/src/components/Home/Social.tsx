import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { Elastic, gsap } from 'gsap';
import * as React from 'react';
import { Transition } from 'react-transition-group';

import socials from 'src/components/Home/socials';
import { staticImage } from 'src/imageUrls';
import { toMedia } from 'src/mediaQuery';
import { isHamburger, screenPortrait, screenXS } from 'src/screens';
import { latoFont } from 'src/styles/fonts';
import { noHighlight } from 'src/styles/mixins';

const textShadowColor = 'rgba(0, 0, 0, 0.75)';

const pulse = keyframes({
    'from, to': {
        textShadow: `0 0 4px ${textShadowColor}`,
    },
    '50%': {
        textShadow: '0 0 4px rgba(255, 255, 255, 1)',
    },
});

const Handle = styled('div')`
    ${noHighlight}
    margin: 1.2rem 0;
    -webkit-tap-highlight-color: transparent;

    ${toMedia([screenXS, screenPortrait])} {
        width: 100%;
        bottom: 15%;
    }
`;

const HandleText = styled('span')(latoFont(200, true), {
    fontSize: 'min(2rem, calc(100vh / 20))',
    color: 'white',
    textShadow: `0 0 6px ${textShadowColor}`,
    textDecoration: 'underline',
    animation: `${pulse} 4s ease infinite`,
    '&:hover': {
        cursor: 'pointer',
        animationPlayState: 'paused',
    },
    [toMedia({ and: [isHamburger, screenPortrait] })]: {
        fontSize: 'min(3rem, calc(100vw / 16))',
    },
});

const SocialContainer = styled('div')({
    position: 'absolute',
    width: 'fit-content',
    top: 'calc(59.6% - 43.3px)',
    left: '50%',
    transform: 'translateX(-50%)',
    [toMedia({ and: [isHamburger, screenPortrait] })]: {
        bottom: '12%',
        top: 'unset',
    },
});

const SocialLink = styled.a<{ show: boolean; canHover: boolean }>`
    padding: 1.5rem 0;
    width: calc(100vw / ${Object.keys(socials).length});
    max-width: 120px;
    flex: 0 0 auto;
    height: 100%;
    opacity: 0;
    pointer-events: ${(props) => (props.show ? 'unset' : 'none')};
    filter: drop-shadow(0 0 0.5rem black);

    ${toMedia(isHamburger)} {
        padding: 0.8rem 0;
    }

    ${(props) =>
        props.canHover
            ? `
        transition: transform 0.1s linear, filter 0.1s linear;
        &:hover {
            transform: scale(1.1);
            filter: drop-shadow(0 0 0.75rem black);
        }
    `
            : ''}
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

const SocialMediaLink = (
    props: React.ComponentPropsWithRef<'a'> & SocialMediaLinkProps,
) => (
    <SocialLink
        canHover={props.canHover}
        show={props.show}
        href={props.url}
        target="_blank"
        ref={props.ref}
    >
        <img
            alt={`${props.social} icon`}
            src={staticImage(`/logos/${props.social}.svg`)}
        />
    </SocialLink>
);

const defaultCanHover = Object.keys(socials).reduce(
    (prev, curr) => {
        prev[curr] = false;
        return prev;
    },
    {} as Record<string, boolean>,
);

const socialLength = Object.keys(socials).length;

const Social = () => {
    const [show, setShow] = React.useState<boolean>(false);
    const [canHover, setCanHover] = React.useState<Record<string, boolean>>({});
    const refs = React.useRef<React.RefObject<HTMLAnchorElement | null>[]>(
        Object.keys(socials).map(() => React.createRef<HTMLAnchorElement>()),
    );

    const onSocialEnter = React.useCallback(
        (id: number, ref: React.RefObject<HTMLAnchorElement | null>) => () => {
            const relative = id - (socialLength / 2 - 0.5);
            ref.current &&
                gsap.fromTo(
                    ref.current,
                    {
                        opacity: 0,
                        y: '-50%',
                        x: `${relative * -100}%`,
                        duration: 0.25,
                    },
                    {
                        opacity: 1,
                        y: '0%',
                        x: '0%',
                        delay: 0.05 * id,
                        ease: Elastic.easeOut.config(1, 0.75),
                        clearProps: 'transform',
                    },
                );
        },
        [],
    );

    const onSocialExit = React.useCallback(
        (id: number, ref: React.RefObject<HTMLAnchorElement | null>) => () => {
            const relative = id - Math.floor(socialLength / 2);
            ref.current &&
                gsap.fromTo(
                    ref.current,
                    {
                        opacity: 1,
                        y: '0%',
                        x: '0%',
                        duration: 0.25,
                    },
                    {
                        opacity: 0,
                        y: '-50%',
                        x: `${relative * -100}%`,
                        delay: 0.05 * id,
                        ease: Elastic.easeOut.config(1, 0.75),
                        clearProps: 'transform',
                    },
                );
            setCanHover(defaultCanHover);
        },
        [],
    );

    return (
        <SocialContainer>
            <Handle
                onClick={() => {
                    setShow(!show);
                }}
            >
                <HandleText>@seanchenpiano</HandleText>
            </Handle>
            <SocialIconsContainer>
                {Object.keys(socials).map((key, idx) => (
                    <Transition
                        key={key}
                        in={show}
                        onEnter={onSocialEnter(idx, refs.current[idx])}
                        onExit={onSocialExit(idx, refs.current[idx])}
                        timeout={250 + 50 * idx}
                        onEntered={() =>
                            setCanHover({
                                ...canHover,
                                [key]: true,
                            })
                        }
                        nodeRef={refs.current[idx]}
                    >
                        <SocialMediaLink
                            canHover={canHover[key]}
                            show={show}
                            url={socials[key]}
                            social={key}
                            ref={(el) => {
                                refs.current[idx].current = el;
                            }}
                        />
                    </Transition>
                ))}
            </SocialIconsContainer>
        </SocialContainer>
    );
};

export default Social;
