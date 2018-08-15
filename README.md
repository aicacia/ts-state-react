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

let ID = 0;

export interface TodoState {
    list: [];
}

export const store = state.createStore("todos", {
    list: []
});

export const selectTodos = ({ list }: TodoState) => list;
export const selectTodoById = ({ list }: TodoState, id: number) =>
    list.find(todo => todo.id === id);

export const create = text => {
    const id = ID++;

    store.updateState(state => {
        const list = state.list.slice();

        list.push({
            id: id,
            text: text
        });

        return {
            list: list
        };
    });
};

export const remove = id => {
    store.updateState(state => {
        const index = list.findIndex(todo => todo.id === id);

        let list = state.list;

        if (index !== -1) {
            list = list.slice();
            list.slice(index, 1);
        }

        return {
            list: list
        };
    });
};
```

```ts
// ./src/stores/todoListForm.ts
import { state } from "../state";

export interface TodoListFormState {
    list: [];
}

export const store = state.createStore("todoListForm", {
    text: ""
});

export const selectText = ({ text }: TodoListFormState) => text;

export const change = text => {
    store.updateState(() => ({ text }));
};
```

## Root Component

```tsx
// ./src/components/Root/Root.tsx
import React from "react";
import PropTypes from "prop-types";
import { Provider, state } from "../state";
import { TodoList } from "../TodoList";

interface RootState {
    value: { [key: string]: any };
}

export class Root extends React.PureComponent<{}, RootState> {
    constructor(props) {
        super(props);

        this.setState({
            value: state.getState()
        });

        state.on("set-state", value => {
            this.setState({ value });
        });
    }

    componentDidMount() {
        this._isMounted = true;
    }
    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        return (
            <Provider value={this.state.value}>
                <TodoList />
            </Provider>
        );
    }
}
```

## Components

```tsx
// ./src/components/TodoList/TodoList.tsx
import React from "react";
import PropTypes from "prop-types";

interface TodoListProps {
    text: string,
    list: [],
    createTodo: (string) => void,
    changeText: (string) => void
}

export class TodoList extends React.PureComponent<TodoListProps> {
    constructor(props: TodoListProps) {
        super(props);

        this.onSubmit = e => {
            const { changeText, createTodo, text } = this.props;

            e.preventDefault();

            createTodo(text);
            changeText("");
        };

        this.onChange = e => {
            this.props.changeText(text: e.target.value);
        };
    }
    render() {
        const { text, list } = this.props;

        return (
            <div class="TodoList">
                <form onSubmit={this.onSubmit}>
                    <input
                        value={text}
                        onChange={this.onChange}
                    />
                </form>
                {list.map(todo => (
                    <p key={todo.id}>{todo.text}</p>
                ))}
            </div>
        );
    }
}
```

## Component Containers

```typescript
// ./src/components/TodoList/TodoListContainer.ts
import { connect } from "../state";
import { todoListForm, todos } from "../stores";
import { TodoList } from "./TodoList";

export connect(
    (state) => ({
        text: todoListForm.selectText(state.todoListForm),
        list: todos.selectTodos(state.todos),
        createTodo: todos.create,
        changeText: text => todoListForm.change({ text })
    })
)(TodoList);
```
