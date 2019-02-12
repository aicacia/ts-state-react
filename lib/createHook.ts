import * as React from "react";
import { IMapStateToFunctions } from "./IMapStateToFunctions";
import { IMapStateToProps } from "./IMapStateToProps";
import { RETURNS_EMPTY_OBJECT } from "./RETURNS_EMPTY_OBJECT";

export const createUseState = <TState>(Context: React.Context<TState>) => {
  const useState = <TStateProps, TFunctionProps, TOwnProps = {}>(
    mapStateToProps: IMapStateToProps<TState, TStateProps, TOwnProps>,
    mapStateToFunctions: IMapStateToFunctions<
      TState,
      TStateProps,
      TFunctionProps,
      TOwnProps
    > = RETURNS_EMPTY_OBJECT as any,
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
