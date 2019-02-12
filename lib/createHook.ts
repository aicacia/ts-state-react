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
    const get = (nextState: TState) => {
      const stateProps = mapStateToProps(nextState, ownProps),
        functionProps = mapStateToFunctions(nextState, ownProps, stateProps);

      return { ...ownProps, ...stateProps, ...functionProps };
    };

    const onChange = (nextState: TState) => {
      setState(get(nextState));
    };

    const [currentState, setState] = React.useState(get(state.getState()));

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
