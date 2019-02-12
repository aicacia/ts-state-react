import { State } from "@stembord/state";
import * as React from "react";
import { IMapStateToFunctions } from "./IMapStateToFunctions";
import { IMapStateToProps } from "./IMapStateToProps";
import { RETURNS_EMPTY_OBJECT } from "./RETURNS_EMPTY_OBJECT";

export const createHook = <TState>(state: State<TState>) => {
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
    const [currentState, setState] = React.useState(getState(state.getState()));

    function getState(nextState: TState) {
      const stateProps = mapStateToProps(nextState, ownProps),
        functionProps = mapStateToFunctions(nextState, ownProps, stateProps);

      return { ...ownProps, ...stateProps, ...functionProps };
    }

    function onChange(nextState: TState) {
      setState(getState(nextState));
    }

    React.useEffect(() => {
      state.addListener("set-state", onChange);

      return () => {
        state.removeListener("set-state", onChange);
      };
    });

    return currentState;
  };

  return useState;
};
