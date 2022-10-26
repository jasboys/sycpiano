import * as React from 'react';

import styled from '@emotion/styled';

import { fetchDiscs } from 'src/components/About/Discs/reducers';
import DiscList from 'src/components/About/Discs/DiscList';
import { onScroll, scrollFn } from 'src/components/App/NavBar/reducers';

import { pushed } from 'src/styles/mixins';
import { navBarHeight } from 'src/styles/variables';
import { useAppDispatch } from 'src/hooks';
import { MediaContext } from 'src/components/App/App';
import { isHamburger } from 'src/screens';
import { toMedia } from 'src/mediaQuery';

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
    const mediaProps = React.useContext(MediaContext);
    const { isHamburger, hiDpx } = mediaProps;
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        dispatch(fetchDiscs());
    }, []);

    const onScrollDispatch = (triggerHeight: number, scrollTop: number) => {
        dispatch(onScroll({ triggerHeight, scrollTop }));
    };

    return (
        <StyledDiscs
            {...mediaProps}
            onScroll={isHamburger ? scrollFn(navBarHeight.get(hiDpx), onScrollDispatch) : undefined}
        >
            <DiscList />
        </StyledDiscs>
    );
};

export type DiscsType = typeof Discs;
export type RequiredProps = DiscsProps;
export default Discs;
