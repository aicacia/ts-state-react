import * as React from "react";
import { connect, IState } from "../state";
import {
  create,
  ITodo,
  remove,
  selectAll,
  selectText,
  setText
} from "../stores/todos";
import { Todo } from "./Todo";

export interface ITodoListStateProps {
  text: string;
  list: ITodo[];
}
export interface ITodoListFunctionProps {}
export interface ITodoListProps
  extends ITodoListStateProps,
    ITodoListFunctionProps {}
export interface ITodoListState {}

export interface ITodoListContainerProps {}

const mapStateToProps = (
  state: IState,
  ownProps: ITodoListProps
): ITodoListStateProps => ({
  text: selectText(state),
  list: selectAll(state)
});

const mapStateToFunctions = (
  state: IState,
  ownProps: ITodoListProps,
  stateProps: ITodoListStateProps
): ITodoListFunctionProps => ({});

export const TodoList = connect<
  ITodoListStateProps,
  ITodoListFunctionProps,
  ITodoListContainerProps
>(
  mapStateToProps,
  mapStateToFunctions
)(
  class TodoListImpl extends React.PureComponent<
    ITodoListProps,
    ITodoListState
  > {
    onSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      create(this.props.text);
      setText("");
    };
    onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            {this.props.list.map(todo => (
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
