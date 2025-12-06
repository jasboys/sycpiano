import { css } from '@emotion/react';
import type * as React from 'react';

import DiscList from 'src/components/About/Discs/DiscList';
import { toMedia } from 'src/mediaQuery';
import { isHamburger } from 'src/screens';
import { rootStore } from 'src/store.js';
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

const Discs: React.FC<DiscsProps> = () => {
    const { isHamburger, hiDpx } = rootStore.mediaQueries.useTrackedStore()

    return (
        <div
            css={containerStyle}
            onScroll={
                isHamburger
                    ? rootStore.navBar.set.onScroll(navBarHeight.get(hiDpx))
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
