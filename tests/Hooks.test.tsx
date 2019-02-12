import { State } from "@stembord/state";
import * as Enzyme from "enzyme";
import * as EnzymeAdapter from "enzyme-adapter-react-16";
import { JSDOM } from "jsdom";
import * as React from "react";
import * as tape from "tape";
import { createHook } from "../lib";

const dom = new JSDOM("<!doctype html><html><body></body></html>");

(global as any).document = dom.window.document;
(global as any).window = dom.window;

const INITIAL_STATE = { form: { text: "" } },
  state = new State(INITIAL_STATE),
  formStore = state.getStore("form");

type IState = typeof INITIAL_STATE;

const useState = createHook(state);

const selectText = ({ form }: IState) => form.text;

let RENDER_CALLED = 0;

Enzyme.configure({ adapter: new EnzymeAdapter() });

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
  symbol: ownProps.symbol
});
const TextMapStateToFunctions = (
  state: IState,
  ownProps: ITextOwnProps,
  stateProps: ITextStateProps
): ITextFunctionProps => ({});

const Text = (ownProps: ITextOwnProps) => {
  const props = useState(
    TextMapStateToProps,
    TextMapStateToFunctions,
    ownProps
  );

  RENDER_CALLED += 1;

  return (
    <p id="text">
      {props.text}
      {props.symbol}
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
  { form: { text } }: IState,
  ownProps: IFormOwnProps
): IFormStateProps => ({
  text
});
const FormMapStateToFunctions = (): IFormFunctionProps => ({
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
    formStore.setState({ text: e.target.value });
  }
});

const Form = (ownProps: IFormOwnProps) => {
  const props = useState(
    FormMapStateToProps,
    FormMapStateToFunctions,
    ownProps
  );

  RENDER_CALLED += 1;

  return (
    <input
      id="input"
      onChange={props.onChange}
      type="text"
      value={props.text}
    />
  );
};

const Root = () => (
  <div>
    <Text symbol="!" />
    <Form />
  </div>
);

tape("hook update", (assert: tape.Test) => {
  const wrapper = Enzyme.mount(<Root />);

  assert.equals(formStore.getState().text, "", "store text should be empty");
  assert.equals(
    (wrapper.find("#input").getDOMNode() as HTMLInputElement).value,
    "",
    "input element should reflect stores"
  );

  wrapper.find("#input").simulate("change", { target: { value: "text" } });

  setTimeout(() => {
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

    wrapper.find("#input").simulate("change", { target: { value: "text" } });

    setTimeout(() => {
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
      wrapper.unmount();

      assert.equals(RENDER_CALLED, 4, "render should have been called");

      assert.end();
    });
  });
});
