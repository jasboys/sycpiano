import styled from '@emotion/styled';
import * as React from 'react';
import { fetchShopItems } from 'src/components/Shop/ShopList/reducers'
import { ShopList } from 'src/components/Shop/ShopList';

import { container } from 'src/styles/mixins';
import { TransitionGroup, Transition } from 'react-transition-group';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Location } from 'history';
import { fadeOnEnter, fadeOnExit } from 'src/utils';
import { CheckoutSuccess } from 'src/components/Shop/CheckoutSuccess/CheckoutSuccess';
import { FAQs } from 'src/components/Shop/FAQs/FAQs';
import { useAppDispatch } from 'src/hooks';
import Signup from './Signup';

const AuthContainer = styled.div(
    container,
    {
        height: '100%',
        width: '100%',
        overflow: 'hidden',
    }
);

const FadingContainer = styled.div({
    height: '100%',
    width: '100%',
    visibility: 'hidden',
    position: 'absolute',
});

interface AuthorizationProps { isMobile: boolean; }

const Authorization: React.FC<AuthorizationProps> = ({ isMobile }) => {
    const location = useLocation();
    // const dispatch = useAppDispatch();

    React.useEffect(() => {
        // dispatch(fetchShopItems());
    }, []);

    // console.log(location);

    return (
        <AuthContainer>
            <TransitionGroup component={null}>
                <Transition<undefined>
                    key={location.pathname}
                    onEntering={fadeOnEnter(0.25)}
                    onExiting={fadeOnExit()}
                    timeout={750}
                    appear={true}
                >
                    <FadingContainer>
                        <Routes location={location}>
                            <Route path="/auth/signup" element={
                                <Signup isMobile={isMobile} />
                            } />

                            {/* // <Route
                            //     path="/shop/scores/:product?"
                            //     render={(childProps) => (
                            //         <ShopList {...childProps} isMobile={isMobile} />
                            //     )}
                            // />
                            // <Route
                            //     path="/shop/retrieve-purchased"
                            //     render={(childProps) => (
                            //         <RetrievalForm {...childProps} isMobile={isMobile} />
                            //     )}
                            // />
                            // <Route
                            //     path="/shop/faqs"
                            //     render={(childProps) => (
                            //         <FAQs {...childProps} isMobile={isMobile} />
                            //     )}
                            // /> */}
                        </Routes>
                    </FadingContainer>
                </Transition>
            </TransitionGroup>
        </AuthContainer>
    );
}

export type ShopType = typeof Authorization;
export type RequiredProps = AuthorizationProps;
export default Authorization;
