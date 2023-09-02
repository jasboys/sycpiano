import styled from '@emotion/styled';
import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { useAppSelector } from 'src/hooks.js';

import { container } from 'src/styles/mixins';

const ContainerElement = styled.div(container, {
    height: '100%',
    width: '100%',
    overflow: 'hidden',
});

type ContainerProps = Record<never, unknown>;

const Container: React.FC<ContainerProps> = () => {
    return (
        <ContainerElement>
            <Outlet />
        </ContainerElement>
    );
};

export type ContainerType = typeof Container;
export type RequiredProps = ContainerProps;
export default Container;
