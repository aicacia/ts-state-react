import { State } from "@aicacia/state";
import { RecordOf } from "immutable";
import { useState, useEffect, useCallback } from "react";
import { shallowEqual } from "shallow-equal-object";

export function createUseMapStateToProps<T>(state: State<T>) {
  return function useMapStateToProps<TProps>(
    mapStateToProps: (state: RecordOf<T>) => TProps
  ) {
    const [props, setProps] = useState(mapStateToProps(state.getCurrent()));

    const onChange = useCallback(() => {
      const nextProps = mapStateToProps(state.getCurrent());

      if (!shallowEqual(props, nextProps)) {
        setProps(nextProps);
      }
    }, [props]);

    useEffect(() => {
      state.on("change", onChange);

      return () => {
        state.off("change", onChange);
      };
    }, [state, onChange]);

    return props;
  };
}

export function createHook<T>(state: State<T>) {
  return createUseMapStateToProps(state);
}
