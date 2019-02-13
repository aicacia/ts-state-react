import * as React from "react";
import { shallowEqual } from "shallow-equal-object";
import { IMapStateToFunctions } from "./IMapStateToFunctions";
import { IMapStateToProps } from "./IMapStateToProps";
import { RETURNS_EMPTY_OBJECT } from "./RETURNS_EMPTY_OBJECT";

export interface IConnectProps<StateProps, FunctionProps, OwnProps> {
  componentRef: React.RefObject<
    React.ComponentType<OwnProps & StateProps & FunctionProps>
  >;
  ownProps: OwnProps;
  stateProps: StateProps;
  functionProps: FunctionProps;
  Component: React.ComponentType<OwnProps & StateProps & FunctionProps>;
}

export class Connect<
  StateProps,
  FunctionProps,
  OwnProps
> extends React.Component<IConnectProps<StateProps, FunctionProps, OwnProps>> {
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
    const {
      componentRef,
      ownProps,
      stateProps,
      functionProps,
      Component
    } = this.props;

    return React.createElement(Component as any, {
      ref: componentRef,
      ...(ownProps || {}),
      ...(stateProps || {}),
      ...(functionProps || {})
    });
  }
}

export const createConnect = <TState>(Context: React.Context<TState>) => {
  const connect = <TStateProps = {}, TFunctionProps = {}, TOwnProps = {}>(
    mapStateToProps: IMapStateToProps<TState, TStateProps, TOwnProps>,
    mapStateToFunctions: IMapStateToFunctions<
      TState,
      TStateProps,
      TFunctionProps,
      TOwnProps
    > = RETURNS_EMPTY_OBJECT as any
  ) => (
    Component: React.ComponentType<TOwnProps & TStateProps & TFunctionProps>
  ): React.ComponentClass<TOwnProps> => {
    return class Connected extends React.PureComponent<TOwnProps> {
      static displayName = `Connect(${Component.displayName ||
        Component.name ||
        "Component"})`;

      componentRef: React.RefObject<
        React.ComponentType<TOwnProps & TStateProps & TFunctionProps>
      >;

      constructor(props: TOwnProps) {
        super(props);

        this.componentRef = React.createRef();
      }

      consumerRender = (state: TState) => {
        const componentRef = this.componentRef,
          ownProps = this.props,
          stateProps = mapStateToProps(state, ownProps),
          functionProps = mapStateToFunctions(state, ownProps, stateProps);

        return React.createElement(Connect as any, {
          componentRef,
          Component,
          ownProps,
          stateProps,
          functionProps
        });
      };

      render() {
        return React.createElement(Context.Consumer, {
          children: this.consumerRender
        });
      }
    };
  };

  return connect;
};

export const createContext = <TState>(initialState: TState) => {
  const Context = React.createContext(initialState),
    { Provider, Consumer } = Context,
    connect = createConnect(Context);

  return { connect, Provider, Consumer, Context };
};
