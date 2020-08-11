import * as React from "react";
import { IMapStateToFunctions } from "./IMapStateToFunctions";
import { IMapStateToProps } from "./IMapStateToProps";
import { returnsEmptyObject } from "./returnsEmptyObject";

export const createUseState = <TState>(Context: React.Context<TState>) => {
  const useState = <
    TStateProps,
    TFunctionProps,
    TOwnProps = Record<string, unknown>
  >(
    mapStateToProps: IMapStateToProps<TState, TStateProps, TOwnProps>,
    mapStateToFunctions: IMapStateToFunctions<
      TState,
      TStateProps,
      TFunctionProps,
      TOwnProps
    > = returnsEmptyObject as any,
    ownProps: TOwnProps = {} as any
  ) => {
    const state = React.useContext(Context),
      stateProps = mapStateToProps(state, ownProps),
      functionProps = mapStateToFunctions(state, ownProps, stateProps);

    return { ...ownProps, ...stateProps, ...functionProps };
  };

  return useState;
};

export const createHook = <TState>(initialState: TState) => {
  const Context = React.createContext(initialState),
    { Provider, Consumer } = Context,
    useState = createUseState(Context);

  return { useState, Context, Provider, Consumer };
};
