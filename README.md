# ts-state-react

connect react components with state stores

## Examples

install [parcel](https://parceljs.org/)

### Hooks

```ts
export const state = new State(INITIAL_STATE);
// Provider and Consumer from Context created with React.createContext
// useState is hook used to map state to props
export const { useState, Provider, Consumer, Context } = createHook(
  state.getState()
);
```

```bash
$ cd examples/todolist-hooks
$ parcel index.html
```

### Connect

```ts
export const state = new State(INITIAL_STATE);
// Provider and Consumer from Context created with React.createContext
// connect is used to map state to props
export const { Context, Provider, Consumer, connect } = createContext(
  state.getState()
);
```

```bash
$ cd examples/todolist-connect
$ parcel index.html
```
