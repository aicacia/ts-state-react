export type IMapStateToProps<TState, TStateProps, TOwnProps> = (
  state: TState,
  ownProps: TOwnProps
) => TStateProps;
