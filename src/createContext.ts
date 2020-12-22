import { RecordOf } from "immutable";
import {
  Component,
  createElement,
  Context,
  ComponentClass,
  ComponentType,
  PureComponent,
  createContext as reactCreateContext,
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

export const createConnect = <T extends RecordOf<any>>(Context: Context<T>) => {
  const connect = <
    TProps = Record<string, unknown>,
    TFunctionProps = Record<string, unknown>,
    TOwnProps = Record<string, unknown>
  >(
    mapStateToProps: IMapStateToProps<T, TProps, TOwnProps>,
    mapStateToFunctions: IMapStateToFunctions<
      T,
      TProps,
      TFunctionProps,
      TOwnProps
    > = returnsEmptyObject as any
  ) => (
    Component: ComponentType<TOwnProps & TProps & TFunctionProps>
  ): ComponentClass<TOwnProps> => {
    return class Connected extends PureComponent<TOwnProps> {
      static displayName = `Connect(${
        Component.displayName || Component.name || "Component"
      })`;

      constructor(props: TOwnProps) {
        super(props);
      }

      consumerRender = (state: T) => {
        const ownProps = this.props,
          stateProps = mapStateToProps(state, ownProps),
          functionProps = mapStateToFunctions(state, ownProps, stateProps);

        return createElement(Connect as any, {
          Component,
          ownProps,
          stateProps,
          functionProps,
        });
      };

      render() {
        return createElement(Context.Consumer, null, this.consumerRender);
      }
    };
  };

  return connect;
};

export const createContext = <T extends RecordOf<any>>(initialState: T) => {
  const Context = reactCreateContext(initialState),
    { Provider, Consumer } = Context,
    connect = createConnect(Context);

  return { connect, Provider, Consumer, Context };
};
