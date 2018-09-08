import * as React from "react";

export type IMapFn<IP, OP, S> = (state: S, props: IP) => OP;

export function createContext<S>(state: S) {
    const { Provider, Consumer } = React.createContext(state);

    const connect = <A = {}, B = {}>(
        map: IMapFn<Partial<B>, Partial<A>, S>
    ) => (Component: React.ComponentClass<A>): React.ComponentClass<B> => {
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
                            ...(<{}>map(state, (props as any) as Partial<B>))
                        })
                });
            }
        };
    };

    return { connect, Provider };
}
