import * as React from "react";

export type IOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type IShared<
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

export interface IMapStateToProps<TStateProps, TOwnProps, State> {
    (state: State, ownProps: TOwnProps): TStateProps;
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

export const createContext = <TState>(state: TState) => {
    const { Provider, Consumer } = React.createContext(state);

    const connect = <TStateProps = {}, TOwnProps = {}>(
        mapStateToProps: IMapStateToProps<TStateProps, TOwnProps, TState>
    ) => <P extends IShared<TStateProps, P>>(
        Component: React.ComponentType<P>
    ): React.ComponentClass<
        IOmit<P, keyof IShared<TStateProps, P>> & TOwnProps
    > & { WrappedComponent: React.ComponentType<P> } => {
        const Connect = class Connect extends React.PureComponent<TOwnProps> {
            static displayName = `Connect(${Component.displayName ||
                Component.name ||
                "Component"})`;

            componentRef: React.RefObject<React.Component>;

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

    return { connect, Provider };
};
