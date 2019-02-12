import * as React from "react";
import { IState, Provider, state } from "../state";
import { TodoListContainer } from "./TodoListContainer";

interface IRootState {
  value: IState;
}

export class Root extends React.PureComponent<{}, IRootState> {
  private _isUpdating: boolean = false;
  private _isMounted: boolean = false;

  constructor(props: {}) {
    super(props);

    this.state = {
      value: state.getState()
    };
  }

  onSetState = () => {
    if (!this._isUpdating) {
      this._isUpdating = true;
      process.nextTick(this.runSetState);
    }
  };

  runSetState = () => {
    this._isUpdating = false;
    if (this._isMounted) {
      this.setState({ value: state.getState() });
    }
  };

  componentDidMount() {
    this._isMounted = true;
    state.addListener("set-state", this.onSetState);
  }

  componentWillUnmount() {
    this._isMounted = false;
    state.removeListener("set-state", this.onSetState);
  }

  render() {
    return (
      <Provider value={this.state.value}>
        <TodoListContainer />
      </Provider>
    );
  }
}
