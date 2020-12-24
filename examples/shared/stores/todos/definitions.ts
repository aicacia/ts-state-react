import { IJSONObject } from "@aicacia/json";
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

export function TodosFromJSON(json: IJSONObject): RecordOf<ITodos> {
  return Todos({
    text: json.text as string,
    todos: Object.entries(json.todos).reduce(
      (todos, [jsonId, json]) =>
        todos.set(parseInt(jsonId), Todo(json as IJSONObject)),
      OrderedMap<number, RecordOf<ITodo>>()
    ),
  });
}

export const INITIAL_STATE = Todos();
export const STORE_NAME = "todos";
