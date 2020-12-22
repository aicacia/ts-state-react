import { ChangeEvent, FormEvent } from "react";
import { IState, useState } from "../connect";
import {
  create,
  ITodo,
  remove,
  selectAll,
  selectText,
  setText,
} from "../../../shared/stores/todos";
import { Todo } from "../../../shared/components/Todo";
import { List, RecordOf } from "immutable";

interface ITodoListStateProps {
  text: string;
  list: List<RecordOf<ITodo>>;
}
interface ITodoListFunctionProps {}
interface ITodoListProps {}

const mapStateToProps = (
  state: IState,
  _ownProps: ITodoListProps
): ITodoListStateProps => ({
  text: selectText(state),
  list: selectAll(state),
});

const mapStateToFunctions = (
  _state: IState,
  _ownProps: ITodoListProps,
  _stateProps: ITodoListStateProps
): ITodoListFunctionProps => ({});

export const TodoList = (ownProps: ITodoListProps) => {
  const props = useState(mapStateToProps, mapStateToFunctions, ownProps);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    create(props.text);
    setText("");
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    setText(e.target.value);

  const createOnRemove = (id: number) => () => remove(id);

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input value={props.text} onChange={onChange} />
      </form>
      <ul>
        {props.list.map((todo) => (
          <Todo
            key={todo.id}
            text={todo.text}
            onRemove={createOnRemove(todo.id)}
          />
        ))}
      </ul>
    </div>
  );
};
