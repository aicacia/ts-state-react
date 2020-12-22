import { state } from "../../state";
import { STORE_NAME, Todo } from "./definitions";

export const store = state.getView(STORE_NAME);

let ID = 0;

export const setText = (text: string) =>
  store.update((state) => state.set("text", text), "setText");

export const create = (text: string) => {
  const id = ++ID;
  return store.update(
    (state) =>
      state.update("todos", (todos) => todos.set(id, Todo({ id, text }))),
    "create"
  );
};

export const remove = (id: number) =>
  store.update(
    (state) => state.update("todos", (todos) => todos.remove(id)),
    "remove"
  );
