import { IStateTypeOf, State } from "@aicacia/state";
import {
  Component,
  Provider,
  createElement,
  ReactNode,
  ComponentClass,
} from "react";

export interface IStateProviderProps {
  children: ReactNode;
}

export interface IStateProviderState<T> {
  value: IStateTypeOf<State<T>>;
}

export type IStateProviderComponentClass<T> = ComponentClass<
  IStateProviderProps,
  IStateProviderState<T>
>;

export function createStateProvider<T>(
  state: State<T>,
  Provider: Provider<IStateTypeOf<State<T>>>,
  debounceUpdates = true
): IStateProviderComponentClass<T> {
  return class StateProvider extends Component<
    IStateProviderProps,
    IStateProviderState<T>
  > {
    private _isUpdating = false;
    private _isMounted = false;

    constructor(props: IStateProviderProps) {
      super(props);

      this.state = {
        value: state.getCurrent(),
      };
    }

    onChange = () => {
      if (!this._isUpdating) {
        this._isUpdating = true;

        if (debounceUpdates) {
          setTimeout(this.runChange, 0);
        } else {
          this.runChange();
        }
      }
    };

    runChange = () => {
      this._isUpdating = false;
      if (this._isMounted) {
        const nextValue = state.getCurrent();

        if (!this.state.value.equals(nextValue)) {
          this.setState({ value: nextValue });
        }
      }
    };

    componentDidMount() {
      this._isMounted = true;
      state.addListener("change", this.onChange);
    }

    componentWillUnmount() {
      this._isMounted = false;
      state.removeListener("change", this.onChange);
    }

    render() {
      return createElement(
        Provider,
        { value: this.state.value },
        this.props.children
      );
    }
  };
}
