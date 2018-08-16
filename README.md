# js-state-react

connect react components with state stores

## State

```ts
// ./src/state.ts
import { State } from "@stembord/state";
import { createContext } from "@stembord/state-react";

export const state = new State();
export const { Provider, connect } = createContext(state.getState());
```

## Stores

```ts
// ./src/stores/todos.ts
import { state } from "../state";
import { IState } from "@stembord/state";

let ID = 0;

export interface ITodo {
    id: number;
    text: string;
}

export interface ITodos {
    list: Array<ITodo>;
}

export const store = state.createStore<ITodos>("todos", {
    list: []
});

export const selectAll = ({ todos: { list } }: IState) => list;
export const selectById = ({ todos: { list } }: IState, id: number) =>
    list.find((todo: ITodo) => todo.id === id);

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

````ts
// ./src/stores/todoListForm.ts
import { state } from "../state";
import { IState } from "@stembord/state";

export interface ITodoListForm {
    text: string;
}

export const store = state.createStore<ITodoListForm>("todoListForm", {
    text: ""
});

export const selectText = ({ todoListForm: { text } }: IState) => text;

export const changeText = (text: string) => {
    store.updateState(() => ({ text }));
};```

## Root Component

```tsx
// ./src/components/Root/Root.tsx
import * as React from "react";
import { IState } from "@stembord/state";
import { Provider, state } from "../../state";
import { TodoList } from "../TodoList";

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
                <TodoList />
            </Provider>
        );
    }
}
````

## Components

```tsx
// ./src/components/TodoList/TodoList.tsx
import * as React from "react";
import { ITodo } from "../../stores/todos";
import { Todo } from "./Todo";

interface ITodoListProps {
    text: string;
    list: Array<ITodo>;
    createTodo: (text: string) => void;
    changeText: (text: string) => void;
    removeTodo: (id: number) => void;
}

export class TodoList extends React.PureComponent<ITodoListProps> {
    onSubmit: (e: any) => void;
    onChange: (e: any) => void;

    constructor(props: ITodoListProps) {
        super(props);

        this.onSubmit = e => {
            const { changeText, createTodo, text } = this.props;

            e.preventDefault();

            createTodo(text);
            changeText("");
        };

        this.onChange = e => {
            this.props.changeText(e.target.value);
        };
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

```typescript
// ./src/components/TodoList/TodoListContainer.ts
import { connect } from "../../state";
import { todos, todoListForm } from "../../stores";
import { TodoList } from "./TodoList";
import { IState } from "@stembord/state";

export const TodoListContainer = connect((state: IState) => ({
    text: todoListForm.selectText(state),
    list: todos.selectAll(state),
    createTodo: todos.create,
    removeTodo: todos.remove,
    changeText: todoListForm.changeText
}))(TodoList);
```
