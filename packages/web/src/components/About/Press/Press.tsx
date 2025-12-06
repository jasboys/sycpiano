import { css } from '@emotion/react';
import type * as React from 'react';

import AcclaimsList from 'src/components/About/Press/AcclaimsList';
import { toMedia } from 'src/mediaQuery';
import { screenPortrait, screenXS } from 'src/screens';
import { rootStore } from 'src/store.js';
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
    const { isHamburger, hiDpx } = rootStore.mediaQueries.useTrackedStore();

    return (
        <div
            css={containerStyle}
            onScroll={
                isHamburger
                    ? rootStore.navBar.set.onScroll(navBarHeight.get(hiDpx))
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
