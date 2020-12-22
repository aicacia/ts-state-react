import { State, IStateTypeOf } from "@aicacia/state";
import { render } from "@testing-library/react";
import { Simulate } from "react-dom/test-utils";
import { JSDOM } from "jsdom";
import { PureComponent } from "react";
import * as tape from "tape";
import { Record as ImmutableRecord } from "immutable";
import { createContext, createStateProvider } from ".";

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

const { connect, Provider } = createContext(state.getCurrent());

const selectText = (state: IState) => state.get("form").text;

type IDefaultsProps = Record<string, unknown>;

const DefaultsImpl = (() => () => <div>Defaults</div>)();

type IDefaultsOwnProps = Record<string, unknown>;
type IDefaultsFunctionProps = Record<string, unknown>;

const ConnectedDefaults = connect<
  IDefaultsProps,
  IDefaultsFunctionProps,
  IDefaultsOwnProps
>((_state: IState, _props: IDefaultsOwnProps) => ({}))(DefaultsImpl);

interface ITextProps {
  text: string;
  symbol: string;
}

class TextImpl extends PureComponent<ITextProps> {
  render() {
    const { text, symbol } = this.props;

    return (
      <p data-testid="text">
        {text}
        {symbol}
      </p>
    );
  }
}

interface ITextOwnProps {
  symbol: string;
}

type ITextFunctionProps = Record<string, unknown>;

const ConnectedText = connect<ITextProps, ITextFunctionProps, ITextOwnProps>(
  (state: IState, props: ITextOwnProps) => ({
    text: selectText(state),
    symbol: props.symbol,
  })
)(TextImpl);

interface IFormProps {
  text: string;
  onChange(e: React.ChangeEvent<HTMLInputElement>): void;
}

class Form extends PureComponent<IFormProps> {
  render() {
    const { text, onChange } = this.props;

    return (
      <input data-testid="input" onChange={onChange} type="text" value={text} />
    );
  }
}

const ConnectedForm = connect(
  (state: IState) => ({
    text: state.get("form").text,
  }),
  () => ({
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      formView.update((state) => state.set("text", e.target.value));
    },
  })
)(Form);

const App = createStateProvider(state, Provider, false);

tape("connect update", async (assert: tape.Test) => {
  const wrapper = render(
    <App>
      <ConnectedText key="text" symbol="!" />
      <ConnectedForm key="form" />
      <ConnectedDefaults />
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
