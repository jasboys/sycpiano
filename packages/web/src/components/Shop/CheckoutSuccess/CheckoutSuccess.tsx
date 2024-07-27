import styled from '@emotion/styled';
import axios from 'axios';
import type * as React from 'react';
import { useSearchParams } from 'react-router-dom';

import { toMedia } from 'src/mediaQuery';
import { screenPortrait, screenXS } from 'src/screens';
import { latoFont } from 'src/styles/fonts';
import { pushed } from 'src/styles/mixins';
import { useQuery } from '@tanstack/react-query';

const Container = styled.div(latoFont(300), pushed, {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 'auto',
    marginRight: 'auto',
    alignItems: 'center',
    [toMedia([screenXS, screenPortrait])]: {
        padding: '1rem',
        alignItems: 'flex-start',
    },
});

const LineItem = styled.li({
    marginTop: '0.8rem',
    marginBottom: '0.8rem',
});

const Thanks = styled.div({
    fontSize: '2rem',
    padding: '3rem 0 2rem 0',
    [toMedia([screenXS, screenPortrait])]: {
        padding: '2rem 0',
    },
});

const EmailedTo = styled.div({
    fontSize: '1.2rem',
    padding: '2rem 0 1rem 0',
});

const Questions = styled.div({
    fontSize: '1rem',
    padding: '2rem',
    [toMedia([screenXS, screenPortrait])]: {
        padding: '1rem 0',
    },
});

const ErrorDiv = styled.div(latoFont(300), {
    height: '100%',
    width: '100%',
    position: 'absolute',
    fontSize: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

interface CheckoutSuccessResponse {
    session: {
        customer_details: {
            email: string;
        };
        client_reference_id: string;
    };
    lineItems: string[];
}

const CheckoutSuccess: React.FC<Record<never, unknown>> = () => {
    const [search, _setSearch] = useSearchParams();

    const {
        data: { session, lineItems } = {},
        isPending,
        isSuccess,
    } = useQuery({
        queryKey: ['checkoutSuccess', search.get('session_id')],
        queryFn: async () => {
            const { data }: { data: CheckoutSuccessResponse } = await axios.get(
                '/api/shop/checkout-success',
                {
                    params: { session_id: search.get('session_id') },
                },
            );
            return data;
        },
    });

    return !isSuccess ? (
        <ErrorDiv>
            {isPending
                ? 'Fetching your payment details...'
                : 'There was a problem with the request.'}
        </ErrorDiv>
    ) : (
        <Container>
            <Thanks>Thank you for your purchase!</Thanks>
            <div css={{ fontSize: '1.2rem' }}>Reference ID: {session?.client_reference_id}</div>
            <EmailedTo>
                These scores will be emailed to{' '}
                <span css={{ fontWeight: 400 }}>{session?.customer_details.email}</span>:
            </EmailedTo>
            <ul>
                {lineItems?.map((item) => (
                    <LineItem key={item}>{item}</LineItem>
                ))}
            </ul>
            <Questions>
                Questions? Email{' '}
                <a
                    css={{ fontWeight: 400 }}
                    href="mailto:seanchen@seanchenpiano.com"
                >
                    seanchen@seanchenpiano.com
                </a>
            </Questions>
        </Container>
    );
};

export default CheckoutSuccess;
export type CheckoutSuccessType = typeof CheckoutSuccess;
export type RequiredProps = React.ComponentProps<CheckoutSuccessType>;
