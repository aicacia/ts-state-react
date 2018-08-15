import * as tape from "tape";
import { JSDOM } from "jsdom";
import * as React from "react";
import * as Enzyme from "enzyme";
import * as EnzymeAdapter from "enzyme-adapter-react-16";
import { State } from "@stembord/state";
import { createContext } from "../lib";

const dom = new JSDOM("<!doctype html><html><body></body></html>");

(global as any).document = dom.window.document;
(global as any).window = dom.window;

const state = new State(),
    formStore = state.createStore("form", { text: "" });

const { connect, Provider } = createContext(state.getState());

let RENDER_CALLED = 0;

Enzyme.configure({ adapter: new EnzymeAdapter() });

interface ITextProps {
    text: String;
}

class Text extends React.PureComponent<ITextProps> {
    render() {
        RENDER_CALLED += 1;
        return <p>{this.props.text}</p>;
    }
}

const ConnectedText = connect(({ form: { text } }) => ({
    text
}))(Text);

interface IFormProps {
    text: string;
    onChange(text: string): void;
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
            <input
                onChange={e => onChange((e.target as HTMLInputElement).value)}
                type="text"
                ref={this.inputRef}
                value={text}
            />
        );
    }
}

const onChange = (text: string) => {
    formStore.setState({ text });
};

var ConnectedForm = connect(({ form: { text } }) => ({
    text,
    onChange
}))(Form);

interface IRootState {
    value: { [key: string]: any };
}

class Root extends React.Component<{}, IRootState> {
    textRef: React.RefObject<any>;
    formRef: React.RefObject<any>;

    constructor(props: {}) {
        super(props);

        this.textRef = React.createRef();
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
                <ConnectedText ref={this.textRef} key="text" />
                <ConnectedForm ref={this.formRef} key="form" />
            </Provider>
        );
    }
}

tape("connect update", (assert: tape.Test) => {
    var wrapper = Enzyme.mount(React.createElement(Root));

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
