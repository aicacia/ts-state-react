import { State } from "@aicacia/state";
import { RecordOf } from "immutable";
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

export interface IStateProviderState<T extends RecordOf<any>> {
  value: T;
}

export type IStateProviderComponentClass<
  T extends RecordOf<any>
> = ComponentClass<IStateProviderProps, IStateProviderState<T>>;

export function createStateProvider<T extends RecordOf<any>>(
  state: State<T>,
  Provider: Provider<T>,
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
          process.nextTick(this.runChange);
        } else {
          this.runChange();
        }
      }
    };

    runChange = () => {
      this._isUpdating = false;
      if (this._isMounted) {
        this.setState({ value: state.getCurrent() });
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
