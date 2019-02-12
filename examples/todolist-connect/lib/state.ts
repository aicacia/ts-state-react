import { State } from "@stembord/state";
import { createContext } from "../../../lib";
import { INITIAL_STATE as todos } from "./stores/todos/definitions";

export const state = new State({
  todos
});
export type IState = typeof state.current;
export const { Provider, Consumer, connect } = createContext(state.getState());
