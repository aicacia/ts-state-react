import * as React from "react";

export type IMapFn<S, A, B> = (state: S, props: A) => B;

export function createContext<S>(state: S) {
    const { Provider, Consumer } = React.createContext(state);

    const connect = <A = {}, B = {}>(map: IMapFn<S, B, Partial<A>>) => (
        Component: React.ComponentClass<A>
    ): React.ComponentClass<B> => {
        return class Connect extends React.PureComponent<B> {
            static displayName = `Connect(${Component.displayName ||
                Component.name ||
                "Component"})`;

            componentRef: React.RefObject<React.Component>;

            constructor(props: B) {
                super(props);

                this.componentRef = React.createRef();
            }

            render() {
                const props = this.props;

                return React.createElement(Consumer, {
                    children: (state: S) =>
                        React.createElement(Component as any, {
                            ref: this.componentRef,
                            ...(<{}>props),
                            ...(<{}>map(state, props))
                        })
                });
            }
        };
    };

    return { connect, Provider };
}
