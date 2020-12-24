import { IStateTypeOf, State, initReduxDevTools } from "@aicacia/state";
import {
  INITIAL_STATE as todos,
  TodosFromJSON,
} from "./stores/todos/definitions";

export const state = new State(
  {
    todos,
  },
  {
    todos: TodosFromJSON,
  }
);
export type IState = IStateTypeOf<typeof state>;

if (process.env.NODE_ENV !== "production") {
  initReduxDevTools(state);
}
