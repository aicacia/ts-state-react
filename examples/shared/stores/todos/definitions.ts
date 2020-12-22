import { OrderedMap, Record, RecordOf } from "immutable";

export interface ITodo {
  id: number;
  text: string;
}

export const Todo = Record<ITodo>({
  id: 0,
  text: "",
});

export interface ITodos {
  text: string;
  todos: OrderedMap<number, RecordOf<ITodo>>;
}

export const Todos = Record<ITodos>({
  text: "",
  todos: OrderedMap(),
});

export const INITIAL_STATE = Todos();
export const STORE_NAME = "todos";
