import * as React from "react";
import { IState, useState } from "../state";
import { create, ITodo, remove, selectAll } from "../stores/todos";
import { Todo } from "./Todo";

interface ITodoListStateProps {
  list: ITodo[];
}
interface ITodoListFunctionProps {
  createTodo: (text: string) => void;
  removeTodo: (id: number) => void;
}
interface ITodoListProps {}

const mapStateToProps = (
  state: IState,
  props: ITodoListProps
): ITodoListStateProps => ({
  list: selectAll(state)
});

const mapStateToFunctions = (
  state: IState,
  ownProps: ITodoListProps,
  stateProps: ITodoListStateProps
): ITodoListFunctionProps => ({
  createTodo: create,
  removeTodo: remove
});

export const TodoList = (ownProps: ITodoListProps) => {
  const [text, setText] = React.useState("");
  const props = useState(mapStateToProps, mapStateToFunctions, ownProps);

  const onSubmit = e => {
    e.preventDefault();

    props.createTodo(text);
    setText("");
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input value={text} onChange={e => setText(e.target.value)} />
      </form>
      <ul>
        {props.list.map(todo => (
          <Todo
            key={todo.id}
            text={todo.text}
            onRemove={() => props.removeTodo(todo.id)}
          />
        ))}
      </ul>
    </div>
  );
};
