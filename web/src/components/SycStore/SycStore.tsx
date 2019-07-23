import styled from '@emotion/styled';
import * as React from 'react';
import { connect } from 'react-redux';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { addItemToCartAction, fetchItemsAction } from 'src/components/SycStore/actions';
import { ConnectedCart as Cart } from 'src/components/SycStore/Cart';
import { StoreItemsList } from 'src/components/SycStore/StoreItemsList';
import { StoreItem } from 'src/components/SycStore/types';
import { GlobalStateShape } from 'src/types';

import { pushed } from 'src/styles/mixins';

const SycStoreContainer = styled.div`
    ${pushed}
    overflow-y: scroll;
    background-color: #ebebeb;
`;

const StyledStoreItemsList = styled(StoreItemsList)`
    margin: 0 auto;
`;

interface SycStoreStateToPros {
    readonly items: StoreItem[];
}

interface SycStoreDispatchToProps {
    readonly fetchItemsAction: () => Promise<void>;
    readonly addItemToCart: (sku: string) => void;
}

interface SycOwnProps { isMobile: boolean; }

type SycStoreProps = SycOwnProps & SycStoreStateToPros & SycStoreDispatchToProps;

class SycStore extends React.PureComponent<SycStoreProps, {}> {
    componentDidMount() {
        this.props.fetchItemsAction();
    }

    render() {
        return (
            <SycStoreContainer>
                <StyledStoreItemsList
                    isMobile={this.props.isMobile}
                    items={this.props.items}
                    addItemToCart={this.props.addItemToCart}
                />
                <Cart />
            </SycStoreContainer>
        );
    }
}

const mapStateToProps = ({ sycStore }: GlobalStateShape) => ({
    items: sycStore.items,
});

const mapDispatchToProps = (dispatch: ThunkDispatch<GlobalStateShape, undefined, Action>) => ({
    fetchItemsAction: () => dispatch(fetchItemsAction()),
    addItemToCart: (sku: string) => dispatch(addItemToCartAction(sku)),
});

const connectedSycStore = connect<SycStoreStateToPros, SycStoreDispatchToProps, {}>(
    mapStateToProps,
    mapDispatchToProps,
)(SycStore);

export type SycStoreType = new (props: any) => React.Component<SycStoreProps>;
export type RequiredProps = SycOwnProps;
export default connectedSycStore;
