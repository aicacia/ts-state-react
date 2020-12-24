import { Context, useContext, createContext } from "react";
import type { IMapStateToFunctions } from "./IMapStateToFunctions";
import type { IMapStateToProps } from "./IMapStateToProps";
import { returnsEmptyObject } from "./returnsEmptyObject";

export const createUseState = <T>(Context: Context<T>) => {
  const useState = <
    TProps,
    TFunctionProps,
    TOwnProps = Record<string, unknown>
  >(
    mapStateToProps: IMapStateToProps<T, TProps, TOwnProps>,
    mapStateToFunctions: IMapStateToFunctions<
      T,
      TProps,
      TFunctionProps,
      TOwnProps
    > = returnsEmptyObject as any,
    ownProps: TOwnProps = {} as any
  ) => {
    const state = useContext(Context),
      stateProps = mapStateToProps(state, ownProps),
      functionProps = mapStateToFunctions(state, ownProps, stateProps);

    return { ...ownProps, ...stateProps, ...functionProps };
  };

  return useState;
};

export const createHook = <T>(initialState: T) => {
  const Context = createContext(initialState),
    { Provider, Consumer } = Context,
    useState = createUseState(Context);

  return { useState, Context, Provider, Consumer };
};
