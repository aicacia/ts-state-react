import { state } from "../../state";
import { ITodos, STORE_NAME } from "./definitions";

export const store = state.getStore(STORE_NAME);

let ID = 0;

export const create = (text: string) => {
  const id = ID++;

  store.updateState(({ list }: ITodos) => ({
    list: [
      ...list,
      {
        id,
        text
      }
    ]
  }));
};

export const remove = (id: number) => {
  store.updateState(({ list }: ITodos) => {
    const index = list.findIndex(todo => todo.id === id);

    if (index !== -1) {
      list = list.slice();
      list.splice(index, 1);
    }

    return {
      list
    };
  });
};
