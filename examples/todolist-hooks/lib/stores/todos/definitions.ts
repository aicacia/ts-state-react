export interface ITodo {
  id: number;
  text: string;
}

export interface ITodos {
  list: ITodo[];
}

export const INITIAL_STATE: ITodos = { list: [] };
export const STORE_NAME = "todos";
