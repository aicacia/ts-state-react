# js-state-react

connect react components with state stores

## State

```ts
// ./src/state.ts
import { State } from "@stembord/state";
import { createContext } from "@stembord/state-react";
import { INITIAL_STATE as todos } from "./stores/todos/definitions";

export const state = new State({
    todos
});
export const IState = typeof state.current;
export const { Provider, connect } = createContext(state.getState());
```

## Stores

```ts
// ./src/stores/todos/definitions.ts
export interface ITodo {
    id: number;
    text: string;
}

export interface ITodos {
    list: ITodo[];
}

export const INITIAL_STATE: ITodos = { list: [] };
export const STORE_NAME = "todos";
```

```ts
// ./src/stores/todos/selectors.ts
import { IState } from "../state";

export const selectAll = ({ todos: { list } }: IState) => list;
export const selectById = ({ todos: { list } }: IState, id: number) =>
    list.find((todo: ITodo) => todo.id === id);
```

```ts
// ./src/stores/todos/actions.ts
import { state } from "../state";
import { STORE_NAME } from "./definitions.ts";

export const store = state.getStore(STORE_NAME);

let ID = 0;

export const create = (text: string) => {
    const id = ID++;

    store.updateState(({ list }: ITodos) => ({
        list: [
            ...list,
            {
                id: id,
                text: text
            }
        ]
    }));
};

export const remove = (id: number) => {
    store.updateState(({ list }: ITodos) => {
        const index = list.findIndex(todo => todo.id === id);

        if (index !== -1) {
            list = list.slice();
            list.splice(index, 1);
        }

        return {
            list: list
        };
    });
};
```

```ts
// ./src/stores/todos/index.ts
export * from "./definitions";
export * from "./selectors";
export * from "./actions";
```

```ts
// ./src/stores/index.ts
export * as todos from "./todos";
```

## Root Component

```tsx
// ./src/components/Root/Root.tsx
import * as React from "react";
import { Provider, IState, state } from "../../state";
import { TodoListContainer } from "./TodoListContainer";

interface IRootState {
    value: IState;
}

export class Root extends React.PureComponent<{}, IRootState> {
    private _isUpdating: boolean;
    private _isMounted: boolean;
    private _onSetState: () => void;
    private _runSetState: () => void;

    constructor(props: {}) {
        super(props);

        this._isUpdating = false;
        this._isMounted = false;

        this.state = {
            value: state.getState()
        };

        this._onSetState = () => {
            if (!this._isUpdating) {
                this._isUpdating = true;
                process.nextTick(this._runSetState);
            }
        };

        this._runSetState = () => {
            this._isUpdating = false;
            if (this._isMounted) {
                this.setState({ value: state.getState() });
            }
        };
    }

    componentDidMount() {
        this._isMounted = true;
        state.addListener("set-state", this._onSetState);
    }

    componentWillUnmount() {
        this._isMounted = false;
        state.removeListener("set-state", this._onSetState);
    }

    render() {
        return (
            <Provider value={this.state.value}>
                <TodoListContainer />
            </Provider>
        );
    }
}
```

## Components

```tsx
// ./src/components/TodoList.tsx
import * as React from "react";
import { ITodo } from "../../stores/todos";
import { Todo } from "./Todo";

interface ITodoListProps {
    text: string;
    list: ITodo[];
    createTodo: (text: string) => void;
    changeText: (text: string) => void;
    removeTodo: (id: number) => void;
}

export class TodoList extends React.PureComponent<ITodoListProps> {
    constructor(props: ITodoListProps) {
        super(props);

        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
    }
    onSubmit(e) {
        const { changeText, createTodo, text } = this.props;

        e.preventDefault();

        createTodo(text);
        changeText("");
    }
    onChange(e) {
        this.props.changeText(e.target.value);
    }
    render() {
        const { text, list, removeTodo } = this.props;

        return (
            <div>
                <form onSubmit={this.onSubmit}>
                    <input value={text} onChange={this.onChange} />
                </form>
                <ul>
                    {list.map(todo => (
                        <Todo
                            key={todo.id}
                            id={todo.id}
                            text={todo.text}
                            onRemove={removeTodo}
                        >
                            {todo.text}
                        </Todo>
                    ))}
                </ul>
            </div>
        );
    }
}
```

## Component Containers

```ts
// ./src/components/TodoListContainer.ts
import { connect, IState } from "../../state";
import { todos, todoListForm } from "../../stores";
import { TodoList } from "./TodoList";

export const TodoListContainer = connect(
    (state: IState) => ({
        text: todoListForm.selectText(state),
        list: todos.selectAll(state)
    }),
    () => ({
        createTodo: todos.create,
        removeTodo: todos.remove,
        changeText: todoListForm.changeText
    })
)(TodoList);
```
