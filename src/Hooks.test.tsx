import { State } from "@aicacia/state";
import * as Enzyme from "enzyme";
import * as EnzymeAdapter from "enzyme-adapter-react-16";
// @ts-ignore
import { JSDOM } from "jsdom";
import * as React from "react";
import * as tape from "tape";
import { createHook } from "./createHook";

const dom = new JSDOM("<!doctype html><html><body></body></html>");

(global as any).document = dom.window.document;
(global as any).window = dom.window;

const INITIAL_STATE = { form: { text: "" } },
  state = new State(INITIAL_STATE),
  formStore = state.getStore("form");

type IState = ReturnType<typeof state.getState>;

const { useState, Provider } = createHook(state.getState());

const selectText = (state: IState) => state.get("form").text;

let RENDER_CALLED = 0;

Enzyme.configure({ adapter: new EnzymeAdapter() });

interface IDefaultsStateProps {}
interface IDefaultsOwnProps {}

const DefaultsMapStateToProps = (
  _state: IState,
  _ownProps: IDefaultsOwnProps
): IDefaultsStateProps => ({});

const Defaults = () => {
  useState(DefaultsMapStateToProps);

  RENDER_CALLED += 1;

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

  RENDER_CALLED += 1;

  return (
    <p id="text">
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
    formStore.setState({ text: e.target.value });
  },
});

const Form = (ownProps: IFormOwnProps) => {
  const useStateProps = useState(
    FormMapStateToProps,
    FormMapStateToFunctions,
    ownProps
  );

  RENDER_CALLED += 1;

  return (
    <input
      id="input"
      onChange={useStateProps.onChange}
      type="text"
      value={useStateProps.text}
    />
  );
};

interface IRootState {
  value: IState;
}

class Root extends React.Component<Record<string, unknown>, IRootState> {
  constructor(props: Record<string, unknown>) {
    super(props);

    this.state = {
      value: state.getState(),
    };

    state.on("set-state", (value) => {
      this.setState({ value });
    });
  }

  render() {
    return (
      <Provider value={this.state.value}>
        <Text symbol="!" />
        <Form />
        <Defaults />
      </Provider>
    );
  }
}

tape("hook update", (assert: tape.Test) => {
  const wrapper = Enzyme.mount(<Root />);

  assert.equals(formStore.getState().text, "", "store text should be empty");
  assert.equals(
    (wrapper.find("#input").getDOMNode() as HTMLInputElement).value,
    "",
    "input element should reflect stores"
  );
  assert.equals(
    (wrapper.find("#text").getDOMNode() as HTMLParagraphElement).textContent,
    "!",
    "text element should reflect stores"
  );

  wrapper.find("#input").simulate("change", { target: { value: "text" } });

  assert.equals(
    formStore.getState().text,
    "text",
    "store's value should update"
  );
  assert.equals(
    (wrapper.find("#input").getDOMNode() as HTMLInputElement).value,
    "text",
    "input value should update to new store's value"
  );
  assert.equals(
    (wrapper.find("#text").getDOMNode() as HTMLParagraphElement).textContent,
    "text!",
    "text value should update to new store's value"
  );

  wrapper.find("#input").simulate("change", { target: { value: "text" } });

  assert.equals(
    formStore.getState().text,
    "text",
    "store's text should not have changed"
  );
  assert.equals(
    (wrapper.find("#input").getDOMNode() as HTMLInputElement).value,
    "text",
    "input value should not have changed"
  );
  assert.equals(
    (wrapper.find("#text").getDOMNode() as HTMLParagraphElement).textContent,
    "text!",
    "text value should not have changed"
  );

  wrapper.unmount();

  assert.equals(RENDER_CALLED, 9, "render should have been called");

  assert.end();
});
