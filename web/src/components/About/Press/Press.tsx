import * as React from 'react';

import styled from '@emotion/styled';

import AcclaimsList from 'src/components/About/Press/AcclaimsList';
import { onScroll, scrollFn } from 'src/components/App/NavBar/reducers';

import { pushed } from 'src/styles/mixins';
import { screenXSorPortrait } from 'src/styles/screens';
import { navBarHeight } from 'src/styles/variables';
import { useAppDispatch } from 'src/hooks';
import { fetchAcclaims } from 'src/components/About/Press/reducers';

interface PressProps {
    className?: string;
    isMobile?: boolean;
}

const PressContainer = styled.div(
    pushed,
    {
        width: '100%',
        overflowY: 'scroll',
        WebkitOverflowScrolling: 'touch',
        [screenXSorPortrait]: {
            marginTop: 0,
            height: '100%',
        },
    },
);

const Press: React.FC<PressProps> = (props) => {
    const dispatch = useAppDispatch();

    React.useEffect(() => {
        dispatch(fetchAcclaims());
    });

    const onScrollDispatch = (triggerHeight: number, scrollTop: number) => {
        dispatch(onScroll({ triggerHeight, scrollTop }));
    };

    return (
        <PressContainer onScroll={props.isMobile ? scrollFn(navBarHeight.mobile, onScrollDispatch) : undefined}>
            <AcclaimsList isMobile={props.isMobile} />
        </PressContainer>
    );
};

const MemoizedPress = React.memo(Press, (prev, next) => prev.isMobile === next.isMobile)

export type PressType = typeof MemoizedPress;
export type RequiredProps = PressProps;
export default MemoizedPress;
