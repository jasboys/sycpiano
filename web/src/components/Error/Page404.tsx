import * as React from 'react';
import { Helmet } from 'react-helmet';

import styled from '@emotion/styled';

import { lato2 } from 'src/styles/fonts';
import { titleStringBase } from 'src/utils';

const StyledDiv = styled.div`
    height: 100%;
    width: 100%;
    position: absolute;
    font-size: 3em;
    font-family: ${lato2};
    display: flex;
    align-items: center;
    justify-content: center;
`;

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
