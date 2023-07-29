import * as React from 'react';

interface AsyncComponentBase<P extends object> {
    moduleProvider?: () => Promise<React.ComponentType<P>>;
}

type AsyncComponentProps<P extends object> = AsyncComponentBase<P> & P;

interface AsyncComponentState<P extends object> {
    Component?: React.ComponentType<P>;
}

// Waits for moduleProvider to return a promise that contains the AsyncModule.
// Then sets the component of that module in the state to trigger mounting of
// component in render(). Passes through props the props.
export default class AsyncComponent<
    P extends object,
> extends React.PureComponent<AsyncComponentProps<P>, AsyncComponentState<P>> {
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
        const { Component } = this.state;
        const { moduleProvider, ...props } = this.props;
        return Component === undefined ? null : <Component {...(props as P)} />;
    }
}
