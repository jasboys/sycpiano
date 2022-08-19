import axios from 'axios';
import * as React from 'react';
import { clearCart } from 'src/components/Cart/reducers';
import styled from '@emotion/styled';
import { pushed } from 'src/styles/mixins';
import { lato2, } from 'src/styles/fonts';
import { screenXSorPortrait } from 'src/styles/screens';
import { useAppDispatch } from 'src/hooks';
import { useSearchParams } from 'react-router-dom';

const Container = styled.div(
    pushed,
    {
        fontFamily: lato2,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 'auto',
        marginRight: 'auto',
        alignItems: 'center',
        [screenXSorPortrait]: {
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
    [screenXSorPortrait]: {
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
    [screenXSorPortrait]: {
        padding: '1rem 0',
    }
});

interface CheckoutSuccessProps {
    isMobile?: boolean;
}

interface CheckoutSuccessResponse {
    session: {
        customer_details: {
            email: string;
        };
        client_reference_id: string;
    };
    lineItems: string[];
}

const CheckoutSuccess: React.FC<CheckoutSuccessProps> = () => {
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
export type RequiredProps = CheckoutSuccessProps;