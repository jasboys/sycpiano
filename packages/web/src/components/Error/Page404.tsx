import * as React from 'react';
import { Helmet } from 'react-helmet-async';

import styled from '@emotion/styled';

import { latoFont } from 'src/styles/fonts';
import { titleStringBase } from 'src/utils';

const StyledDiv = styled.div(
    latoFont(300),
    {
        height: '100%',
        width: '100%',
        position: 'absolute',
        fontSize: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    });

const Page404: React.FunctionComponent<unknown> = () => (
    <>
        <Helmet
            title={`${titleStringBase} | 404: Page Not Found`}
        />
        <StyledDiv>
            404: Page Not Found
        </StyledDiv>
    </>
);

export type Page404Type = typeof Page404;
export default Page404;
