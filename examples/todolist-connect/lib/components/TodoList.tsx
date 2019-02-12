import * as React from "react";
import { ITodo } from "../stores/todos";
import { Todo } from "./Todo";

export interface ITodoListStateProps {
  list: ITodo[];
}
export interface ITodoListFunctionProps {
  createTodo: (text: string) => void;
  removeTodo: (id: number) => void;
}
export interface ITodoListProps
  extends ITodoListStateProps,
    ITodoListFunctionProps {}
export interface ITodoListState {
  text: string;
}

export class TodoList extends React.PureComponent<
  ITodoListProps,
  ITodoListState
> {
  constructor(props: ITodoListProps) {
    super(props);

    this.state = {
      text: ""
    };
  }
  onSubmit = e => {
    e.preventDefault();

    this.props.createTodo(this.state.text);
    this.setState({ text: "" });
  };
  onChange = e => {
    this.setState({ text: e.target.value });
  };
  render() {
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <input value={this.state.text} onChange={this.onChange} />
        </form>
        <ul>
          {this.props.list.map(todo => (
            <Todo
              key={todo.id}
              text={todo.text}
              onRemove={() => this.props.removeTodo(todo.id)}
            />
          ))}
        </ul>
      </div>
    );
  }
}
