import { State } from "@aicacia/state";
import { createContext } from "../../../lib";
import { INITIAL_STATE as todos } from "./stores/todos/definitions";

export const state = new State({
  todos
});
export type IState = ReturnType<typeof state["getState"]>;
export const { Provider, Consumer, connect } = createContext(state.getState());

if (process.env.NODE_ENV !== "production") {
  if ((window as any).__REDUX_DEVTOOLS_EXTENSION__) {
    const devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect();

    devTools.subscribe((message: any) => {
      if (
        message.type === "DISPATCH" &&
        message.payload.type === "JUMP_TO_ACTION"
      ) {
        state.setStateJSON(JSON.parse(message.state));
      }
    });

    state.on("set-state-for", (name, storeState, meta) => {
      devTools.send(
        {
          type: (name || "unknown") + (meta ? "." + meta : ""),
          payload: storeState
        },
        state.getState()
      );
    });
  }
}
