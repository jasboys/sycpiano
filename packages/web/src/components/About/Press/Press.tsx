import * as React from 'react';

import styled from '@emotion/styled';

import AcclaimsList from 'src/components/About/Press/AcclaimsList';
import { onScroll, scrollFn } from 'src/components/App/NavBar/reducers';

import { pushed } from 'src/styles/mixins';
import { screenXS, screenPortrait } from 'src/screens';
import { navBarHeight } from 'src/styles/variables';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { fetchAcclaims } from 'src/components/About/Press/reducers';
import { toMedia } from 'src/mediaQuery';
import { mqSelectors } from 'src/components/App/reducers';

interface PressProps {
    className?: string;
}

const PressContainer = styled.div(
    pushed,
    {
        width: '100%',
        overflowY: 'scroll',
        WebkitOverflowScrolling: 'touch',
        [toMedia([screenXS, screenPortrait])]: {
            marginTop: 0,
            height: '100%',
        },
        backgroundColor: 'rgb(244 244 244)'
    },
);

const Press: React.FC<PressProps> = () => {
    const isHamburger = useAppSelector(mqSelectors.isHamburger);
    const hiDpx = useAppSelector(mqSelectors.hiDpx);
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        dispatch(fetchAcclaims());
    });

    const onScrollDispatch = React.useCallback((triggerHeight: number, scrollTop: number) => {
        dispatch(onScroll({ triggerHeight, scrollTop }));
    }, []);

    return (
        <PressContainer onScroll={isHamburger ? scrollFn(navBarHeight.get(hiDpx), onScrollDispatch) : undefined}>
            <AcclaimsList />
        </PressContainer>
    );
};

export type PressType = typeof Press;
export type RequiredProps = PressProps;
export default Press;
