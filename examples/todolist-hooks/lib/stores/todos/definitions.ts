export interface ITodo {
  id: number;
  text: string;
}

export interface ITodos {
  text: string;
  todos: {
    [id: number]: ITodo;
  };
}

export const INITIAL_STATE: ITodos = { text: "", todos: {} };
export const STORE_NAME = "todos";
