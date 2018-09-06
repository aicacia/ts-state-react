import * as React from "react";

export type IMapFn<IP = {}, OP = {}> = (
    state: { [key: string]: any },
    props: IP
) => OP;

export function createContext<S>(state: S) {
    const { Provider, Consumer } = React.createContext(state);

    const connect = <IP, OP>(map: IMapFn<IP, OP>) => (
        Component: React.ComponentClass<IP & OP>
    ): React.ComponentClass<IP> => {
        class Connect extends React.Component<IP> {
            static displayName = `Connect(${Component.displayName ||
                Component.name ||
                "Component"})`;

            componentRef: React.RefObject<React.Component>;

            constructor(props: IP) {
                super(props);

                this.componentRef = React.createRef();
            }

            render() {
                const props: IP = this.props,
                    ComponentCast: any = Component;

                return React.createElement(Consumer, {
                    children: (state: { [key: string]: any }) =>
                        React.createElement(ComponentCast, {
                            ref: this.componentRef,
                            ...(<{}>props),
                            ...(<{}>map(state, props))
                        })
                });
            }
        }

        return Connect;
    };

    return { connect, Provider };
}
