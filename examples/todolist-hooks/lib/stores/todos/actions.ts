import { state } from "../../state";
import { STORE_NAME } from "./definitions";

export const store = state.getStore(STORE_NAME);

let ID = 0;

export const setText = (text: string) => {
  store.updateState(state => ({ ...state, text }), "setText");
};

export const create = (text: string) => {
  const id = ID++;

  store.updateState(
    state => ({
      ...state,
      todos: {
        ...state.todos,
        [id]: {
          id,
          text
        }
      }
    }),
    "create"
  );
};

export const remove = (id: number) => {
  store.updateState(state => {
    const nextState = { ...state, todos: { ...state.todos } };
    delete nextState.todos[id];
    return nextState;
  }, "remove");
};
