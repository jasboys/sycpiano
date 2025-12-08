import { css } from '@emotion/react';
import { useAtomValue, useSetAtom } from 'jotai';
import { focusAtom } from 'jotai-optics';
import type * as React from 'react';

import DiscList from 'src/components/About/Discs/DiscList';
import { navBarActions } from 'src/components/App/NavBar/store';
import { mediaQueriesBaseAtom } from 'src/components/App/store';
import { toMedia } from 'src/mediaQuery';
import { isHamburger } from 'src/screens';
import { pushed } from 'src/styles/mixins';
import { navBarHeight } from 'src/styles/variables';

const containerStyle = css(pushed, {
    width: '100%',
    backgroundColor: 'rgb(238 238 238)',
    overflowY: 'scroll',
    [toMedia(isHamburger)]: {
        height: '100%',
        marginTop: 0,
    },
});

type DiscsProps = Record<never, unknown>;

const mediaQueries = focusAtom(mediaQueriesBaseAtom, (optic) =>
    optic.pick(['isHamburger', 'hiDpx']),
);

const Discs: React.FC<DiscsProps> = () => {
    const { isHamburger, hiDpx } = useAtomValue(mediaQueries);
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
            <DiscList />
        </div>
    );
};

export type DiscsType = typeof Discs;
export type RequiredProps = DiscsProps;
export default Discs;
