import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initCartAction, syncLocalStorage } from './actions';
import { GlobalStateShape } from 'src/types';
import { CartList } from 'src/components/Cart/CartList';


interface CartProps {
    styles: {
        [key: string]: React.CSSProperties;
    };
    attributes: {
        [key: string]: {
            [key: string]: string;
        };
    };
    setPopperElement: (el: HTMLDivElement) => void;
    setArrowElement: (el: HTMLDivElement) => void;
}

export const Cart: React.FC<CartProps> = (props) => {
    const dispatch = useDispatch();
    const cart = useSelector(({ cart }: GlobalStateShape) => cart.items);
    const firstRun = React.useRef(true);

    React.useEffect(() => {
        dispatch(initCartAction());
        firstRun.current = false;
    }, []);

    React.useEffect(() => {
        if (!firstRun.current) {
            dispatch(syncLocalStorage());
        }
    }, [cart.length]);

    // React.useEffect(() => {
    //     if (!visible) {
    //         TweenLite.to(elRef, 250, { height: 0 });
    //     }
    // }, [visible])

    // React.useLayoutEffect(() => {
    //     if (visible) {
    //         const height = elRef.clientHeight;
    //         TweenLite.to(elRef, 250, { height });
    //     }
    // }, [visible])

    return (
        <CartList {...props} />
    );
};

export type CartType = typeof Cart;