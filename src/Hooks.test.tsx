import { State, IStateTypeOf } from "@aicacia/state";
import { render } from "@testing-library/react";
import { Simulate } from "react-dom/test-utils";
import { JSDOM } from "jsdom";
import * as tape from "tape";
import { Record as ImmutableRecord } from "immutable";
import { createHook, createStateProvider } from ".";

const dom = new JSDOM();

(global as any).window = dom.window;
(global as any).document = dom.window.document;

const FormState = ImmutableRecord({
  text: "",
});

const AppState = ImmutableRecord({
  form: FormState(),
});

const state = new State(AppState()),
  formView = state.getView("form");

type IState = IStateTypeOf<typeof state>;

const { useState, Provider } = createHook(state.getCurrent());

const selectText = (state: IState) => state.get("form").text;

interface IDefaultsStateProps {}
interface IDefaultsOwnProps {}

const DefaultsMapStateToProps = (
  _state: IState,
  _ownProps: IDefaultsOwnProps
): IDefaultsStateProps => ({});

const Defaults = () => {
  useState(DefaultsMapStateToProps);

  return <div>Defaults</div>;
};

interface ITextStateProps {
  text: string;
  symbol: string;
}

interface ITextFunctionProps {}

interface ITextOwnProps {
  symbol: string;
}

const TextMapStateToProps = (
  state: IState,
  ownProps: ITextOwnProps
): ITextStateProps => ({
  text: selectText(state),
  symbol: ownProps.symbol,
});
const TextMapStateToFunctions = (
  _state: IState,
  _ownProps: ITextOwnProps,
  _stateProps: ITextStateProps
): ITextFunctionProps => ({});

const Text = (ownProps: ITextOwnProps) => {
  const useStateProps = useState(
    TextMapStateToProps,
    TextMapStateToFunctions,
    ownProps
  );

  return (
    <p data-testid="text">
      {useStateProps.text}
      {useStateProps.symbol}
    </p>
  );
};

interface IFormStateProps {
  text: string;
}
interface IFormFunctionProps {
  onChange(e: React.ChangeEvent<HTMLInputElement>): void;
}
interface IFormOwnProps {}

const FormMapStateToProps = (
  state: IState,
  _ownProps: IFormOwnProps
): IFormStateProps => ({
  text: state.get("form").text,
});
const FormMapStateToFunctions = (): IFormFunctionProps => ({
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
    formView.update((state) => state.set("text", e.target.value));
  },
});

const Form = (ownProps: IFormOwnProps) => {
  const useStateProps = useState(
    FormMapStateToProps,
    FormMapStateToFunctions,
    ownProps
  );

  return (
    <input
      data-testid="input"
      onChange={useStateProps.onChange}
      type="text"
      value={useStateProps.text}
    />
  );
};

const App = createStateProvider(state, Provider, false);

tape("hook update", async (assert: tape.Test) => {
  const wrapper = render(
    <App>
      <Text symbol="!" />
      <Form />
      <Defaults />
    </App>
  );

  assert.equals(formView.getCurrent().text, "", "store text should be empty");
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
    formView.getCurrent().text,
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
    formView.getCurrent().text,
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
