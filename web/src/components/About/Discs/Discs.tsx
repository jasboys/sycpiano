import * as React from 'react';

import styled from '@emotion/styled';

import { fetchDiscs } from 'src/components/About/Discs/reducers';
import DiscList from 'src/components/About/Discs/DiscList';
import { onScroll, scrollFn } from 'src/components/App/NavBar/reducers';

import { pushed } from 'src/styles/mixins';
import { screenXSorPortrait } from 'src/styles/screens';
import { navBarHeight } from 'src/styles/variables';
import { useAppDispatch } from 'src/hooks';

const StyledDiscs = styled.div`
    ${pushed}
    width: 100%;
    background-color: rgb(238, 238, 238);
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;

    ${screenXSorPortrait} {
        height: 100%;
        margin-top: 0;
        overflow-y: scroll;
        -webkit-overflow-scrolling: touch;
    }
`;

interface DiscsProps {
    readonly isMobile: boolean;
}

const Discs: React.FC<DiscsProps> = (props) => {
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        dispatch(fetchDiscs());
    }, []);

    const onScrollDispatch = (triggerHeight: number, scrollTop: number) => {
        dispatch(onScroll({ triggerHeight, scrollTop }));
    };

    return (
        <StyledDiscs
            onScroll={props.isMobile ? scrollFn(navBarHeight.mobile, onScrollDispatch) : undefined}
        >
            <DiscList
                isMobile={props.isMobile}
            />
        </StyledDiscs>
    );
};

const MemoizedDiscs = React.memo(Discs, (prev, next) => prev.isMobile === next.isMobile);

export type DiscsType = typeof MemoizedDiscs;
export type RequiredProps = DiscsProps;
export default MemoizedDiscs;
