import { PureComponent, ChangeEvent, FormEvent } from "react";
import { connect, IState } from "../connect";
import { create, remove, setText } from "../../../shared/stores/todos/actions";
import { ITodo } from "../../../shared/stores/todos/definitions";
import { selectText, selectAll } from "../../../shared/stores/todos/selectors";
import { Todo } from "../../../shared/components/Todo";
import { List, RecordOf } from "immutable";

export interface ITodoListStateProps {
  text: string;
  list: List<RecordOf<ITodo>>;
}
export interface ITodoListFunctionProps {}
export interface ITodoListProps
  extends ITodoListStateProps,
    ITodoListFunctionProps {}
export interface ITodoListState {}

export interface ITodoListContainerProps {}

const mapStateToProps = (
  state: IState,
  _ownProps: ITodoListProps
): ITodoListStateProps => ({
  text: selectText(state),
  list: selectAll(state),
});

const mapStateToFunctions = (
  _state: IState,
  _ownProps: ITodoListProps,
  _stateProps: ITodoListStateProps
): ITodoListFunctionProps => ({});

export const TodoList = connect<
  ITodoListStateProps,
  ITodoListFunctionProps,
  ITodoListContainerProps
>(
  mapStateToProps,
  mapStateToFunctions
)(
  class TodoListImpl extends PureComponent<ITodoListProps, ITodoListState> {
    onSubmit = (e: FormEvent) => {
      e.preventDefault();

      create(this.props.text);
      setText("");
    };
    onChange = (e: ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value);
    };
    createOnRemove = (id: number) => () => remove(id);
    render() {
      return (
        <div>
          <form onSubmit={this.onSubmit}>
            <input value={this.props.text} onChange={this.onChange} />
          </form>
          <ul>
            {this.props.list.map((todo) => (
              <Todo
                key={todo.id}
                text={todo.text}
                onRemove={this.createOnRemove(todo.id)}
              />
            ))}
          </ul>
        </div>
      );
    }
  }
);
