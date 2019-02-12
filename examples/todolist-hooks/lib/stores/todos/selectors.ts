import { IState } from "../../state";

export const selectAll = ({ todos: { todos } }: IState) =>
  Object.keys(todos).map(id => todos[id]);
export const selectText = ({ todos: { text } }: IState) => text;
