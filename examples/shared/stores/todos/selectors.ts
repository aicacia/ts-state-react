import { IState } from "../../state";
import { STORE_NAME } from "./definitions";

export const selectAll = (state: IState) =>
  state.get(STORE_NAME).todos.valueSeq().toList();
export const selectText = (state: IState) => state.get(STORE_NAME).text;
