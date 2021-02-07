import { State } from "@aicacia/state";
import { RecordOf } from "immutable";
import { useState, useEffect, useRef } from "react";
import { shallowEqual } from "shallow-equal-object";

export function createHook<T>(state: State<T>) {
  return function useMapStateToProps<TProps>(
    mapStateToProps: (state: RecordOf<T>) => TProps
  ) {
    const [props, setProps] = useState(() =>
        mapStateToProps(state.getCurrent())
      ),
      lastProps = useRef<TProps>();

    useEffect(() => {
      function onChange(state: RecordOf<T>) {
        const nextProps = mapStateToProps(state);

        if (!shallowEqual(lastProps.current, nextProps)) {
          lastProps.current = nextProps;
          setProps(nextProps);
        }
      }
      state.on("change", onChange);
      return () => {
        state.off("change", onChange);
      };
    });

    return props;
  };
}
