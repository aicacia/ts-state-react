import { State } from "@aicacia/state";
import { RecordOf } from "immutable";
import {
  Component,
  createElement,
  ComponentClass,
  ComponentType,
  PureComponent,
} from "react";
import { shallowEqual } from "shallow-equal-object";
import type { IMapStateToFunctions } from "./IMapStateToFunctions";
import type { IMapStateToProps } from "./IMapStateToProps";
import { returnsEmptyObject } from "./returnsEmptyObject";

export interface IConnectProps<StateProps, FunctionProps, OwnProps> {
  ownProps: OwnProps;
  stateProps: StateProps;
  functionProps: FunctionProps;
  Component: ComponentType<OwnProps & StateProps & FunctionProps>;
}

export class Connect<StateProps, FunctionProps, OwnProps> extends Component<
  IConnectProps<StateProps, FunctionProps, OwnProps>
> {
  constructor(props: IConnectProps<StateProps, FunctionProps, OwnProps>) {
    super(props);
  }
  shouldComponentUpdate(
    nextProps: IConnectProps<StateProps, FunctionProps, OwnProps>
  ) {
    return (
      !shallowEqual(this.props.ownProps, nextProps.ownProps) ||
      !shallowEqual(this.props.stateProps, nextProps.stateProps)
    );
  }
  render() {
    const { ownProps, stateProps, functionProps, Component } = this.props;

    return createElement(Component as any, {
      ...ownProps,
      ...stateProps,
      ...functionProps,
    });
  }
}

export function createConnect<T>(state: State<T>) {
  const connect = <
    TProps = Record<string, unknown>,
    TFunctionProps = Record<string, unknown>,
    TOwnProps = Record<string, unknown>
  >(
    mapStateToProps: IMapStateToProps<RecordOf<T>, TProps, TOwnProps>,
    mapStateToFunctions: IMapStateToFunctions<
      RecordOf<T>,
      TProps,
      TFunctionProps,
      TOwnProps
    > = returnsEmptyObject as any
  ) => (
    Component: ComponentType<TOwnProps & TProps & TFunctionProps>
  ): ComponentClass<TOwnProps> => {
    return class Connected extends PureComponent<
      TOwnProps,
      { value: RecordOf<T> }
    > {
      static displayName = `Connect(${
        Component.displayName || Component.name || "Component"
      })`;

      constructor(props: TOwnProps) {
        super(props);

        this.state = {
          value: state.getCurrent(),
        };
      }

      onChange = () => {
        this.setState({ value: state.getCurrent() });
      };

      componentDidMount() {
        state.on("change", this.onChange);
      }

      componentWillUnmount() {
        state.off("change", this.onChange);
      }

      render() {
        const ownProps = this.props,
          stateProps = mapStateToProps(this.state.value, ownProps),
          functionProps = mapStateToFunctions(
            this.state.value,
            ownProps,
            stateProps
          );

        return createElement(Connect as any, {
          Component,
          ownProps,
          stateProps,
          functionProps,
        });
      }
    };
  };

  return connect;
}
