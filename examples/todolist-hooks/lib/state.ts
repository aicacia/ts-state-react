import { State } from "@stembord/state";
import { createHook } from "../../../lib";
import { INITIAL_STATE as todos } from "./stores/todos/definitions";

export const state = new State({
  todos
});
export type IState = typeof state.current;
export const useState = createHook(state);
