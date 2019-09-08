import { State } from "@stembord/state";
import * as Enzyme from "enzyme";
import * as EnzymeAdapter from "enzyme-adapter-react-16";
import { JSDOM } from "jsdom";
import * as React from "react";
import * as tape from "tape";
import { createContext } from "./createContext";

const dom = new JSDOM("<!doctype html><html><body></body></html>");

(global as any).document = dom.window.document;
(global as any).window = dom.window;

const INITIAL_STATE = { form: { text: "" } },
  state = new State(INITIAL_STATE),
  formStore = state.getStore("form");

type IState = typeof state.current;

const { connect, Provider } = createContext(state.getState());

const selectText = (state: IState) => state.get("form").text;

let RENDER_CALLED = 0;

Enzyme.configure({ adapter: new EnzymeAdapter() });

interface ITextProps {
  text: string;
  symbol: string;
}

class TextImpl extends React.PureComponent<ITextProps> {
  render() {
    const { text, symbol } = this.props;

    RENDER_CALLED += 1;

    return (
      <p id="text">
        {text}
        {symbol}
      </p>
    );
  }
}

interface ITextOwnProps {
  symbol: string;
}

const ConnectedText = connect<ITextProps, {}, ITextOwnProps>(
  (state: IState, props: ITextOwnProps) => ({
    text: selectText(state),
    symbol: props.symbol
  })
)(TextImpl);

interface IFormProps {
  text: string;
  onChange(e: React.ChangeEvent<HTMLInputElement>): void;
}

class Form extends React.PureComponent<IFormProps> {
  render() {
    const { text, onChange } = this.props;

    RENDER_CALLED += 1;

    return <input id="input" onChange={onChange} type="text" value={text} />;
  }
}

const ConnectedForm = connect(
  (state: IState) => ({
    text: state.get("form").text
  }),
  () => ({
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      formStore.setState({ text: e.target.value });
    }
  })
)(Form);

interface IRootState {
  value: IState;
}

class Root extends React.Component<{}, IRootState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      value: state.getState()
    };

    state.on("set-state", value => {
      this.setState({ value });
    });
  }

  render() {
    return (
      <Provider value={this.state.value}>
        <ConnectedText key="text" symbol="!" />
        <ConnectedForm key="form" />
      </Provider>
    );
  }
}

tape("connect update", (assert: tape.Test) => {
  const wrapper = Enzyme.mount(<Root />);

  assert.equals(formStore.getState().text, "", "store text should be empty");
  assert.equals(
    (wrapper.find("#input").getDOMNode() as HTMLInputElement).value,
    "",
    "input value should reflect stores"
  );
  assert.equals(
    (wrapper.find("#text").getDOMNode() as HTMLParagraphElement).textContent,
    "!",
    "text value should reflect stores"
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

  assert.equals(RENDER_CALLED, 4, "render should have been called");

  assert.end();
});
