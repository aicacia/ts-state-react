import { State, IStateTypeOf } from "@aicacia/state";
import { render } from "@testing-library/react";
import { Simulate } from "react-dom/test-utils";
import { JSDOM } from "jsdom";
import { PureComponent } from "react";
import * as tape from "tape";
import { Record as ImmutableRecord, RecordOf } from "immutable";
import { createConnect } from ".";
import type { IJSONObject } from "@aicacia/json";

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

const connect = createConnect(state);

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
      formStore.update((state) => state.set("text", e.target.value));
    },
  })
)(Form);

tape("connect update", (assert: tape.Test) => {
  const wrapper = render(
    <>
      <ConnectedText key="text" symbol="!" />
      <ConnectedForm key="form" />
      <ConnectedDefaults />
    </>
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
