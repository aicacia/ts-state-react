import * as React from "react";
import { IState, useState } from "../state";
import {
  create,
  ITodo,
  remove,
  selectAll,
  selectText,
  setText
} from "../stores/todos";
import { Todo } from "./Todo";

interface ITodoListStateProps {
  text: string;
  list: ITodo[];
}
interface ITodoListFunctionProps {}
interface ITodoListProps {}

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

export const TodoList = (ownProps: ITodoListProps) => {
  const props = useState(mapStateToProps, mapStateToFunctions, ownProps);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    create(props.text);
    setText("");
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setText(e.target.value);

  const createOnRemove = (id: number) => () => remove(id);

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input value={props.text} onChange={onChange} />
      </form>
      <ul>
        {props.list.map(todo => (
          <Todo
            key={todo.id}
            text={todo.text}
            onRemove={createOnRemove(todo.id)}
          />
        ))}
      </ul>
    </div>
  );
};
