import { css } from '@emotion/react';
import Markdown from 'markdown-to-jsx';
import React from 'react';
import { toMedia } from 'src/mediaQuery';
import { isHamburger, screenM, screenPortrait, screenXS } from 'src/screens';
import { logoBlue, offWhite } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';
import type { Blurb } from './types';

const bioTextStyles = {
    spacer: css({
        display: 'none',

        [toMedia([screenXS, screenPortrait])]: {
            display: 'block',
            minHeight: 'var(--bio-pic-min-height)',
            height: 'var(--bio-pic-height)',
            width: '100%',
            backgroundColor: 'transparent',
        },
    }),
    textGroup: css(latoFont(300), {
        [toMedia([screenXS, screenPortrait])]: {
            backgroundColor: 'white',
            padding: '20px 20px',
        },
        p: {
            fontSize: '1.0rem',
            lineHeight: '2rem',
            margin: '1.6rem 0',

            [toMedia(isHamburger)]: {
                '&:first-of-type': {
                    marginTop: 0,
                },
            },

            [toMedia(screenM)]: {
                fontSize: '1rem',
            },

            [toMedia([screenXS, screenPortrait])]: {
                fontSize: '1rem',
                lineHeight: '1.6rem',
                margin: '1.3rem 0',
                '&:last-of-type': {
                    marginBottom: '3rem',
                },
            },
        },
        span: {
            fontWeight: 400,
        },
    }),
    textContainer: css({
        boxSizing: 'border-box',
        flex: '1 0 45%',
        height: 'auto',
        padding: '3rem 40px 80px 60px',
        backgroundColor: offWhite,
        color: 'black',
        overflowY: 'scroll',

        [toMedia(screenM)]: {
            padding: '2rem 2rem 5rem 3rem',
        },

        [toMedia([screenXS, screenPortrait])]: {
            position: 'relative',
            zIndex: 1,
            marginTop: 0,
            height: '100%',
            left: 0,
            backgroundColor: 'transparent',
            padding: 0,
            overflowY: 'visible',
        },
    }),
    title: css(latoFont(400), {
        fontSize: '1.5rem',
        color: logoBlue,
    }),
};

interface BioTextProps {
    bio: Blurb[];
    needsTitle: boolean;
}

const BioText: React.FunctionComponent<BioTextProps> = (props) => {
    return (
        <div css={bioTextStyles.textContainer}>
            <div css={bioTextStyles.spacer} />
            {props.needsTitle && <div css={bioTextStyles.title}>Biography</div>}
            <div css={bioTextStyles.textGroup}>
                {props.bio.map(({ text }) => {
                    return (
                        <Markdown
                            key={text.substring(16)}
                            options={{
                                forceBlock: true,
                                overrides: {
                                    p: {
                                        component: 'p',
                                    },
                                    strong: {
                                        component: 'span',
                                    },
                                },
                            }}
                        >
                            {text}
                        </Markdown>
                    );
                })}
            </div>
        </div>
    );
};

export const MemoizedBioText = React.memo(BioText, (prev, next) => {
    return (
        prev.bio.length === next.bio.length &&
        prev.needsTitle === next.needsTitle
    );
});