import { WithConditionalCSSProp } from '@emotion/react/types/jsx-namespace';
import * as React from 'react';

interface AsyncComponentBase<P> {
    moduleProvider?: () => Promise<React.ComponentType<P>>;
}

type AsyncComponentProps<P> = AsyncComponentBase<P> & P;

interface AsyncComponentState<P> {
    Component?: React.ComponentType<P>;
}

// Waits for moduleProvider to return a promise that contains the AsyncModule.
// Then sets the component of that module in the state to trigger mounting of
// component in render(). Passes through props the props.
export default class AsyncComponent<P> extends React.PureComponent<AsyncComponentProps<P>, AsyncComponentState<P>> {
    state: AsyncComponentState<P> = {
        Component: undefined,
    };

    constructor(props: AsyncComponentProps<P>) {
        super(props);
        this.props.moduleProvider?.().then((res) => {
            const Component = res;
            this.setState({ Component });
        });
    }

    render() {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const { Component } = this.state;
        const { moduleProvider, ...props } = this.props;
        return (
            (Component === undefined) ? null : <Component {...(props as P & WithConditionalCSSProp<P>)} />
        );
    }
}
