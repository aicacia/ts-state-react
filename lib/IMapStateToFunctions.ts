export type IMapStateToFunctions<
  TState,
  TStateProps,
  TFunctionProps,
  TOwnProps
> = (
  state: TState,
  ownProps: TOwnProps,
  stateProps: TStateProps
) => TFunctionProps;
