import { Context, useContext, createContext, useState, useMemo } from "react";
import { shallowEqual } from "shallow-equal-object";

export function createUseMapStateToProps<T>(Context: Context<T>) {
  return function useMapStateToProps<TProps>(
    mapStateToProps: (state: T) => TProps
  ) {
    const state = useContext(Context),
      [props, setProps] = useState(mapStateToProps(state));

    useMemo(() => {
      const nextProps = mapStateToProps(state);

      if (!shallowEqual(props, nextProps)) {
        setProps(nextProps);
      }
    }, [state]);

    return props;
  };
}

export function createHook<T>(initialState: T) {
  const Context = createContext(initialState),
    { Provider, Consumer } = Context,
    useMapStateToProps = createUseMapStateToProps(Context);

  return { useMapStateToProps, Context, Provider, Consumer };
}
