import * as React from "react";
import { shallowEqual } from "shallow-equal-object";

export interface IMapStateToProps<TState, TStateProps, TOwnProps> {
    (state: TState, ownProps: TOwnProps): TStateProps;
}

export interface IMapStateToFunctions<
    TState,
    TStateProps,
    TFunctionProps,
    TOwnProps
> {
    (
        state: TState,
        ownProps: TOwnProps,
        stateProps: TStateProps
    ): TFunctionProps;
}

interface IntermediateProps<StateProps, FunctionProps> {
    componentRef: React.RefObject<
        React.ComponentType<StateProps & FunctionProps>
    >;
    stateProps: StateProps;
    functionProps: FunctionProps;
    Component: React.ComponentType<StateProps & FunctionProps>;
}

class Intermediate<StateProps, FunctionProps> extends React.Component<
    IntermediateProps<StateProps, FunctionProps>
> {
    constructor(props: IntermediateProps<StateProps, FunctionProps>) {
        super(props);
    }
    shouldComponentUpdate(
        nextProps: IntermediateProps<StateProps, FunctionProps>
    ) {
        return !shallowEqual(this.props.stateProps, nextProps.stateProps);
    }
    render() {
        const {
            componentRef,
            stateProps,
            functionProps,
            Component,
            children
        } = this.props;

        return React.createElement(Component as any, {
            ref: componentRef,
            ...(stateProps || {}),
            ...(functionProps || {})
        }, children);
    }
}

const RETURNS_EMPTY_OBJECT = () => ({});

export const createContext = <TState>(state: TState) => {
    const { Provider, Consumer } = React.createContext(state);

    const connect = <TStateProps = {}, TFunctionProps = {}, TOwnProps = {}>(
        mapStateToProps: IMapStateToProps<TState, TStateProps, TOwnProps>,
        mapStateToFunctions: IMapStateToFunctions<
            TState,
            TStateProps,
            TFunctionProps,
            TOwnProps
        > = RETURNS_EMPTY_OBJECT as any
    ) => (
        Component: React.ComponentType<TStateProps & TFunctionProps>
    ): React.ComponentClass<TOwnProps> => {
        return class Connect extends React.PureComponent<TOwnProps> {
            static displayName = `Connect(${Component.displayName ||
                Component.name ||
                "Component"})`;

            componentRef: React.RefObject<
                React.ComponentType<TStateProps & TFunctionProps>
            >;

            constructor(props: TOwnProps) {
                super(props);

                this.componentRef = React.createRef();
                this.consumerRender = this.consumerRender.bind(this);
            }

            consumerRender(state: TState) {
                const componentRef = this.componentRef,
                    stateProps = mapStateToProps(state, this.props),
                    functionProps = mapStateToFunctions(
                        state,
                        this.props,
                        stateProps
                    );

                return React.createElement(Intermediate as any, {
                    componentRef,
                    Component,
                    stateProps,
                    functionProps
                }, this.props.children);
            }

            render() {
                return React.createElement(Consumer, {
                    children: this.consumerRender
                });
            }
        };
    };

    return { connect, Provider, Consumer };
};

export type IContext = ReturnType<typeof createContext>;

export type IConnect = IContext["connect"];

export type IProvider<TState> = React.ComponentType<
    React.ProviderProps<TState>
>;

export type IConsumer<TState> = React.ComponentType<
    React.ConsumerProps<TState>
>;
