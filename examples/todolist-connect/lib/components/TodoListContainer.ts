import { connect } from "../state";
import { create, remove, selectAll } from "../stores/todos";
import {
  ITodoListFunctionProps,
  ITodoListStateProps,
  TodoList
} from "./TodoList";

export interface ITodoListContainerProps {}

export const TodoListContainer = connect<
  ITodoListStateProps,
  ITodoListFunctionProps,
  ITodoListContainerProps
>(
  state => ({
    list: selectAll(state)
  }),
  () => ({
    createTodo: create,
    removeTodo: remove
  })
)(TodoList);
