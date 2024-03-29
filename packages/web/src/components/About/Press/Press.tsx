import { css } from '@emotion/react';
import * as React from 'react';

import { toMedia } from 'src/mediaQuery';
import AcclaimsList from 'src/components/About/Press/AcclaimsList';
import { fetchAcclaims } from 'src/components/About/Press/reducers';
import { onScroll, scrollFn } from 'src/components/App/NavBar/reducers';
import { mqSelectors } from 'src/components/App/reducers';
import { useAppDispatch, useAppSelector } from 'src/hooks';
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
    const isHamburger = useAppSelector(mqSelectors.isHamburger);
    const hiDpx = useAppSelector(mqSelectors.hiDpx);
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        dispatch(fetchAcclaims());
    });

    const onScrollDispatch = React.useCallback(
        (triggerHeight: number, scrollTop: number) => {
            dispatch(onScroll({ triggerHeight, scrollTop }));
        },
        [],
    );

    return (
        <div
            css={containerStyle}
            onScroll={
                isHamburger
                    ? scrollFn(navBarHeight.get(hiDpx), onScrollDispatch)
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
