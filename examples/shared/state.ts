import { IStateTypeOf, State } from "@aicacia/state";
import { Record } from "immutable";
import { INITIAL_STATE as todos } from "./stores/todos/definitions";

export const AppState = Record({
  todos,
});

export const state = new State(AppState());
export type IState = IStateTypeOf<typeof state>;

if (process.env.NODE_ENV !== "production") {
  if ((window as any).__REDUX_DEVTOOLS_EXTENSION__) {
    const devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect();

    devTools.subscribe((message: any) => {
      if (
        message.type === "DISPATCH" &&
        message.payload.type === "JUMP_TO_ACTION"
      ) {
        state.fromJSON(JSON.parse(message.state));
      }
    });

    state.on("change", (newState, path, action) => {
      if (action) {
        path = [...path, action];
      }
      devTools.send(
        {
          type: path.join("."),
          payload: newState,
        },
        newState
      );
    });
  }
}
