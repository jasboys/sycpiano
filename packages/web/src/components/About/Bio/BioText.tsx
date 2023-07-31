import { css } from '@emotion/react';
import React from 'react';
import Markdown from 'markdown-to-jsx';
import { toMedia } from 'src/mediaQuery';
import { isHamburger, screenM, screenXS, screenPortrait } from 'src/screens';
import { offWhite, logoBlue } from 'src/styles/colors';
import { latoFont } from 'src/styles/fonts';
import { Blurb } from './types';
import { pictureHeight } from './common';

const bioTextStyles = {
    p: css({
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
    }),
    spacer: css({
        display: 'none',

        [toMedia([screenXS, screenPortrait])]: {
            display: 'block',
            minHeight: pictureHeight,
            height: 'min(50vw, 33vh)',
            width: '100%',
            backgroundColor: 'transparent',
        },
    }),
    textGroup: css(latoFont(300), {
        [toMedia([screenXS, screenPortrait])]: {
            backgroundColor: 'white',
            padding: '20px 20px',
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
    nameSpan: css(latoFont(400)),
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
                                    p: <p css={bioTextStyles.p} />,
                                    strong: (
                                        <span css={bioTextStyles.nameSpan} />
                                    ),
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