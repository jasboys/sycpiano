import * as React from 'react';

import styled from '@emotion/styled';

import { fetchDiscs } from 'src/components/About/Discs/reducers';
import DiscList from 'src/components/About/Discs/DiscList';
import { onScroll, scrollFn } from 'src/components/App/NavBar/reducers';

import { pushed } from 'src/styles/mixins';
import { navBarHeight } from 'src/styles/variables';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { isHamburger } from 'src/screens';
import { toMedia } from 'src/MediaQuery';
import { mqSelectors } from 'src/components/App/reducers';

const StyledDiscs = styled.div(
    pushed,
    {
        width: '100%',
        backgroundColor: 'rgb(238 238 238)',
        overflowY: 'scroll',
        [toMedia(isHamburger)]: {
            height: '100%',
            marginTop: 0,
        }
    }
);

type DiscsProps = Record<never, unknown>;

const Discs: React.FC<DiscsProps> = () => {
    const isHamburger = useAppSelector(mqSelectors.isHamburger);
    const hiDpx = useAppSelector(mqSelectors.hiDpx)
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        dispatch(fetchDiscs());
    }, []);

    const onScrollDispatch = React.useCallback((triggerHeight: number, scrollTop: number) => {
        dispatch(onScroll({ triggerHeight, scrollTop }));
    }, []);

    return (
        <StyledDiscs
            onScroll={isHamburger ? scrollFn(navBarHeight.get(hiDpx), onScrollDispatch) : undefined}
        >
            <DiscList />
        </StyledDiscs>
    );
};

export type DiscsType = typeof Discs;
export type RequiredProps = DiscsProps;
export default Discs;
