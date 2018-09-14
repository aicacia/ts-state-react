import * as React from "react";

export type IOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type IShared<
    InjectedProps,
    DecorationTargetProps extends IShared<InjectedProps, DecorationTargetProps>
> = {
    [P in Extract<
        keyof InjectedProps,
        keyof DecorationTargetProps
    >]?: InjectedProps[P] extends DecorationTargetProps[P]
        ? DecorationTargetProps[P]
        : never
};

export interface IMapStateToProps<TState, TStateProps, TOwnProps> {
    (state: TState, ownProps: TOwnProps): TStateProps;
}

export interface IInferableComponentEnhancerWithProps<
    TInjectedProps,
    TNeedsProps
> {
    <P extends IShared<TInjectedProps, P>>(
        component: React.ComponentType<P>
    ): React.ComponentClass<
        IOmit<P, keyof IShared<TInjectedProps, P>> & TNeedsProps
    > & { WrappedComponent: React.ComponentType<P> };
}

export type IProvider<TState> = React.ComponentType<
    React.ProviderProps<TState>
>;

export type IConsumer<TState> = React.ComponentType<
    React.ConsumerProps<TState>
>;

export type IConnect<TState> = <TStateProps = {}, TOwnProps = {}>(
    mapStateToProps: IMapStateToProps<TState, TStateProps, TOwnProps>
) => <P extends IShared<TStateProps, P>>(
    Component: React.ComponentType<P>
) => React.ComponentClass<
    Pick<P, Exclude<keyof P, Extract<keyof TStateProps, keyof P>>> & TOwnProps,
    any
> & { WrappedComponent: React.ComponentType<P> };

export interface IContext<TState> {
    connect: IConnect<TState>;
    Provider: IProvider<TState>;
    Consumer: IConsumer<TState>;
}

export const createContext = <TState>(state: TState): IContext<TState> => {
    const { Provider, Consumer } = React.createContext(state);

    const connect = <TStateProps = {}, TOwnProps = {}>(
        mapStateToProps: IMapStateToProps<TState, TStateProps, TOwnProps>
    ) => <P extends IShared<TStateProps, P>>(
        Component: React.ComponentType<P>
    ): React.ComponentClass<
        IOmit<P, keyof IShared<TStateProps, P>> & TOwnProps
    > & { WrappedComponent: React.ComponentType<P> } => {
        const Connect = class Connect extends React.PureComponent<TOwnProps> {
            static displayName = `Connect(${Component.displayName ||
                Component.name ||
                "Component"})`;

            componentRef: React.RefObject<React.ComponentType<P>>;

            constructor(props: TOwnProps) {
                super(props);

                this.componentRef = React.createRef();
            }

            render() {
                const props = this.props;

                return React.createElement(Consumer, {
                    children: (state: TState) =>
                        React.createElement(Component as any, {
                            ref: this.componentRef,
                            ...(props as {}),
                            ...(mapStateToProps(state, props) as {})
                        })
                });
            }
        };

        return Connect as any;
    };

    return { connect, Provider, Consumer };
};
