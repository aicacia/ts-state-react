import * as React from "react";

export type IMapFn<IP = {}, OP = {}> = (
    state: { [key: string]: any },
    props: IP
) => OP;

export function createContext<S>(state: S) {
    const { Provider, Consumer } = React.createContext(state);

    function connect<IP, OP>(map: IMapFn<IP, OP>) {
        return function<OS = {}>(
            Component: React.ComponentClass<OP, OS>
        ): React.ComponentClass<IP, {}> {
            class Connect extends React.Component<IP, {}> {
                static displayName = `Connect(${Component.displayName ||
                    Component.name ||
                    "Component"})`;

                componentRef: React.RefObject<React.Component>;

                constructor(props: IP) {
                    super(props);

                    this.componentRef = React.createRef();
                }

                render() {
                    return (
                        <Consumer>
                            {state => (
                                <Component
                                    ref={this.componentRef}
                                    {...map(state, this.props)}
                                />
                            )}
                        </Consumer>
                    );
                }
            }

            return Connect;
        };
    }

    return { connect, Provider };
}
