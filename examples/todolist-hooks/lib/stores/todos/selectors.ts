import { IState } from "../state";

export const selectAll = ({ todos: { list } }: IState) => list;
export const selectById = ({ todos: { list } }: IState, id: number) =>
  list.find((todo: ITodo) => todo.id === id);
