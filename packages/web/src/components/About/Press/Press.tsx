import { css } from '@emotion/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { focusAtom } from 'jotai-optics';
import type * as React from 'react';

import AcclaimsList from 'src/components/About/Press/AcclaimsList';
import { navBarActions } from 'src/components/App/NavBar/store';
import { mediaQueriesBaseAtom } from 'src/components/App/store';
import { toMedia } from 'src/mediaQuery';
import { screenPortrait, screenXS } from 'src/screens';
import { pushed, verticalTextStyle } from 'src/styles/mixins';
import { navBarHeight } from 'src/styles/variables';

interface PressProps {
    className?: string;
}

const containerStyle = css(pushed, {
    width: '100%',
    overflowY: 'scroll',
    WebkitOverflowScrolling: 'touch',
    backgroundColor: 'rgb(244 244 244)',
    [toMedia([screenXS, screenPortrait])]: {
        marginTop: 0,
        height: '100%',
    },
});

const mediaQueries = focusAtom(mediaQueriesBaseAtom, (optic) =>
    optic.pick(['isHamburger', 'hiDpx']),
);

const verticalStyle = css(
    verticalTextStyle,
    {
        left: 'calc(50% - min(50%, 400px))',
        transform: 'rotate(90deg) translateY(50%)',
    }
)

const Press: React.FC<PressProps> = () => {
    const { isHamburger, hiDpx } = useAtomValue(mediaQueries);
    const onScroll = useSetAtom(navBarActions.onScroll);

    return (
        <>
        {!isHamburger && <div css={verticalStyle}>PRESS</div>}
        <div
            css={containerStyle}
            onScroll={
                isHamburger
                    ? (ev) => onScroll(navBarHeight.get(hiDpx), ev)
                    : undefined
            }
        >
            <AcclaimsList />
        </div>
        </>
    );
};

export type PressType = typeof Press;
export type RequiredProps = PressProps;
export default Press;
