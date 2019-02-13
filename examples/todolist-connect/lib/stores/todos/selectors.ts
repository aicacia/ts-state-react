import { IState } from "../../state";
import { STORE_NAME } from "./definitions";

export const selectAll = (state: IState) =>
  Object.keys(state.get(STORE_NAME).todos).map(
    id => state.get(STORE_NAME).todos[id]
  );
export const selectText = (state: IState) => state.get(STORE_NAME).text;
