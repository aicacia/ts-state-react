import { IState } from "../../state";

export const selectAll = (state: IState) =>
  Object.keys(state.get("todos")).map(id => state.get("todos")[id]);
export const selectText = (state: IState) => state.get("todos").text;
