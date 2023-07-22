import axios from 'axios';
import * as React from 'react';
import { clearCart } from 'src/components/Cart/reducers';
import styled from '@emotion/styled';
import { pushed } from 'src/styles/mixins';
import { latoFont } from 'src/styles/fonts';
import { screenPortrait, screenXS } from 'src/screens';
import { toMedia } from 'src/mediaQuery';
import { useAppDispatch } from 'src/hooks';
import { useSearchParams } from 'react-router-dom';

const Container = styled.div(
    latoFont(200),
    pushed,
    {
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 'auto',
        marginRight: 'auto',
        alignItems: 'center',
        [toMedia([screenXS, screenPortrait])]: {
            padding: '1rem',
            alignItems: 'flex-start',
        }
    },
);

const LineItem = styled.li({
    marginTop: '0.8rem',
    marginBottom: '0.8rem',
});

const Thanks = styled.div({
    fontSize: '2rem',
    padding: '3rem 0 2rem 0',
    [toMedia([screenXS, screenPortrait])]: {
        padding: '2rem 0',
    }
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
    }
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
    const [ search, _setSearch ] = useSearchParams();
    const dispatch = useAppDispatch();
    const [email, setEmail] = React.useState<string>();
    const [clientRef, setClientRef] = React.useState('');
    const [items, setItems] = React.useState<string[]>([]);

    React.useEffect(() => {
        dispatch(clearCart());
        const fetchData = async () => {
            try {
                const {
                    data: { session, lineItems }
                }: { data: CheckoutSuccessResponse } = await axios.get('/api/shop/checkout-success', {
                    params: { session_id: search.get('session_id') }
                });

                setEmail(session.customer_details.email);
                setClientRef(session.client_reference_id);
                setItems(lineItems);
            } catch (e) {
                console.error(`Error trying to fetch checkout session ID.`);
            }
        };

        fetchData();
    }, []);

    return !email ? null : (
        <Container>
            <Thanks>Thank you for your purchase!</Thanks>
            <div css={{ fontSize: '1.2rem' }}>Reference ID: {clientRef}</div>
            <EmailedTo>
                These scores will be emailed to <span css={{ fontWeight: 'bold' }}>{email}</span>:
            </EmailedTo>
            <ul>
                {items.map((item, idx) => (
                    <LineItem key={idx}>
                        {item}
                    </LineItem>
                ))}
            </ul>
            <Questions>Questions? Email <a href="mailto:seanchen@seanchenpiano.com">seanchen@seanchenpiano.com</a></Questions>
        </Container>
    );
};

export default CheckoutSuccess;
export type CheckoutSuccessType = typeof CheckoutSuccess;
export type RequiredProps = React.ComponentProps<CheckoutSuccessType>;