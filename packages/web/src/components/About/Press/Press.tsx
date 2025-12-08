import { css } from '@emotion/react';
import { useAtomValue, useSetAtom } from 'jotai';
import type * as React from 'react';

import AcclaimsList from 'src/components/About/Press/AcclaimsList';
import { navBarActions } from 'src/components/App/NavBar/store';
import { mediaQueriesAtoms } from 'src/components/App/store';
import { toMedia } from 'src/mediaQuery';
import { screenPortrait, screenXS } from 'src/screens';
import { pushed } from 'src/styles/mixins';
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

const Press: React.FC<PressProps> = () => {
    const isHamburger = useAtomValue(mediaQueriesAtoms.isHamburger);
    const hiDpx = useAtomValue(mediaQueriesAtoms.hiDpx);
    const onScroll = useSetAtom(navBarActions.onScroll);

    return (
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
    );
};

export type PressType = typeof Press;
export type RequiredProps = PressProps;
export default Press;
