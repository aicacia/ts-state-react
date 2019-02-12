import * as React from "react";
import { shallowEqual } from "shallow-equal-object";
import { IMapStateToFunctions } from "./IMapStateToFunctions";
import { IMapStateToProps } from "./IMapStateToProps";
import { RETURNS_EMPTY_OBJECT } from "./RETURNS_EMPTY_OBJECT";

interface IntermediateProps<StateProps, FunctionProps, OwnProps> {
  componentRef: React.RefObject<
    React.ComponentType<StateProps & FunctionProps>
  >;
  props: OwnProps;
  stateProps: StateProps;
  functionProps: FunctionProps;
  Component: React.ComponentType<StateProps & FunctionProps>;
}

class Intermediate<StateProps, FunctionProps, OwnProps> extends React.Component<
  IntermediateProps<StateProps, FunctionProps, OwnProps>
> {
  constructor(props: IntermediateProps<StateProps, FunctionProps, OwnProps>) {
    super(props);
  }
  shouldComponentUpdate(
    nextProps: IntermediateProps<StateProps, FunctionProps, OwnProps>
  ) {
    return (
      !shallowEqual(this.props.props, nextProps.props) ||
      !shallowEqual(this.props.stateProps, nextProps.stateProps)
    );
  }
  render() {
    const {
      componentRef,
      props,
      stateProps,
      functionProps,
      Component
    } = this.props;

    return React.createElement(Component as any, {
      ref: componentRef,
      ...(props || {}),
      ...(stateProps || {}),
      ...(functionProps || {})
    });
  }
}

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
          props = this.props,
          stateProps = mapStateToProps(state, props),
          functionProps = mapStateToFunctions(state, props, stateProps);

        return React.createElement(Intermediate as any, {
          componentRef,
          Component,
          props,
          stateProps,
          functionProps
        });
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
