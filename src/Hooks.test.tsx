import { State, IStateTypeOf } from "@aicacia/state";
import { render } from "@testing-library/react";
import { Simulate } from "react-dom/test-utils";
import { JSDOM } from "jsdom";
import * as tape from "tape";
import { Record as ImmutableRecord, RecordOf } from "immutable";
import { createHook, createStateProvider } from ".";
import { IJSONObject } from "@aicacia/json";

const dom = new JSDOM();

(global as any).window = dom.window;
(global as any).document = dom.window.document;

interface IFormState {
  text: string;
}

const FormState = ImmutableRecord<IFormState>({
  text: "",
});

function FormStateFromJSON(json: IJSONObject): RecordOf<IFormState> {
  return FormState({ text: json.text as string });
}

const state = new State(
    {
      form: FormState(),
    },
    {
      form: FormStateFromJSON,
    }
  ),
  formStore = state.getStore("form");

type IState = IStateTypeOf<typeof state>;

const { useMapStateToProps, Provider } = createHook(state.getCurrent());

const selectText = (state: IState) => state.get("form").text;

const Defaults = () => {
  useMapStateToProps(() => ({}));
  return <div>Defaults</div>;
};

interface ITextOwnProps {
  symbol: string;
}

function Text(ownProps: ITextOwnProps) {
  const useStateProps = useMapStateToProps((state) => ({
    text: selectText(state),
    symbol: ownProps.symbol,
  }));

  return (
    <p data-testid="text">
      {useStateProps.text}
      {useStateProps.symbol}
    </p>
  );
}

function Form() {
  const useStateProps = useMapStateToProps((state) => ({
    text: state.get("form").text,
  }));

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    formStore.update((state) => state.set("text", e.target.value));
  }

  return (
    <input
      data-testid="input"
      onChange={onChange}
      type="text"
      value={useStateProps.text}
    />
  );
}

const App = createStateProvider(state, Provider, false);

tape("hook update", async (assert: tape.Test) => {
  const wrapper = render(
    <App>
      <Text symbol="!" />
      <Form />
      <Defaults />
    </App>
  );

  assert.equals(formStore.getCurrent().text, "", "store text should be empty");
  assert.equals(
    (wrapper.getByTestId("input") as HTMLInputElement).value,
    "",
    "input value should reflect stores"
  );
  assert.equals(
    (wrapper.getByTestId("text") as HTMLParagraphElement).textContent,
    "!",
    "text value should reflect stores"
  );

  Simulate.change(wrapper.getByTestId("input"), {
    target: { value: "text" } as any,
  });

  assert.equals(
    formStore.getCurrent().text,
    "text",
    "store's value should update"
  );
  assert.equals(
    (wrapper.getByTestId("input") as HTMLInputElement).value,
    "text",
    "input value should update to new store's value"
  );
  assert.equals(
    (wrapper.getByTestId("text") as HTMLParagraphElement).textContent,
    "text!",
    "text value should update to new store's value"
  );

  Simulate.change(wrapper.getByTestId("input"), {
    target: { value: "text" } as any,
  });

  assert.equals(
    formStore.getCurrent().text,
    "text",
    "store's text should not have changed"
  );
  assert.equals(
    (wrapper.getByTestId("input") as HTMLInputElement).value,
    "text",
    "input value should not have changed"
  );
  assert.equals(
    (wrapper.getByTestId("text") as HTMLParagraphElement).textContent,
    "text!",
    "text value should not have changed"
  );

  wrapper.unmount();

  assert.end();
});
