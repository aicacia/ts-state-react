import { State } from "@stembord/state";
import * as Enzyme from "enzyme";
import * as EnzymeAdapter from "enzyme-adapter-react-16";
import { JSDOM } from "jsdom";
import * as React from "react";
import * as tape from "tape";
import { createContext } from "../lib";

const dom = new JSDOM("<!doctype html><html><body></body></html>");

(global as any).document = dom.window.document;
(global as any).window = dom.window;

const INITIAL_STATE = { form: { text: "" } },
  state = new State(INITIAL_STATE),
  formStore = state.getStore("form");

type IState = typeof INITIAL_STATE;

const { connect, Provider } = createContext(state.getState());

const selectText = ({ form }: IState) => form.text;

let RENDER_CALLED = 0;

Enzyme.configure({ adapter: new EnzymeAdapter() });

interface ITextProps {
  text: string;
  symbol: string;
}

class Text extends React.PureComponent<ITextProps> {
  render() {
    const { text, symbol } = this.props;
    RENDER_CALLED += 1;
    return (
      <p>
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
)(Text);

interface IFormProps {
  text: string;
  onChange(e: React.ChangeEvent<HTMLInputElement>): void;
}

class Form extends React.PureComponent<IFormProps> {
  inputRef: any;

  constructor(props: IFormProps) {
    super(props);

    this.inputRef = React.createRef();
  }

  render() {
    const { text, onChange } = this.props;

    RENDER_CALLED += 1;

    return (
      <input onChange={onChange} type="text" ref={this.inputRef} value={text} />
    );
  }
}

const ConnectedForm = connect(
  ({ form: { text } }: IState) => ({
    text
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
  formRef: React.RefObject<any>;

  constructor(props: {}) {
    super(props);

    this.formRef = React.createRef();

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
        <ConnectedForm ref={this.formRef} key="form" />
      </Provider>
    );
  }
}

tape("connect update", (assert: tape.Test) => {
  const wrapper = Enzyme.mount(<Root />);

  assert.equals(
    ((wrapper.instance() as Root).formRef.current.constructor as any)
      .displayName,
    "Connect(Form)",
    "should wrap component name"
  );
  assert.equals(formStore.getState().text, "", "store text should be empty");
  assert.equals(
    (wrapper.instance() as Root).formRef.current.componentRef.current.props
      .text,
    "",
    "component props should reflect stores"
  );

  wrapper.find("input").simulate("change", { target: { value: "text" } });

  assert.equals(
    formStore.getState().text,
    "text",
    "store's value should update"
  );
  assert.equals(
    (wrapper.instance() as Root).formRef.current.componentRef.current.props
      .text,
    "text",
    "text should update to new store's value"
  );

  wrapper.find("input").simulate("change", { target: { value: "text" } });

  assert.equals(
    formStore.getState().text,
    "text",
    "store's text should not have changed"
  );
  assert.equals(
    (wrapper.instance() as Root).formRef.current.componentRef.current.props
      .text,
    "text",
    "text should not have changed"
  );
  wrapper.unmount();

  assert.equals(RENDER_CALLED, 4, "render should have been called");

  assert.end();
});
