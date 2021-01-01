import { ChangeEvent, FormEvent } from "react";
import { useMapStateToProps } from "../connect";
import { create, remove, setText } from "../../../shared/stores/todos/actions";
import { selectText, selectAll } from "../../../shared/stores/todos/selectors";
import { Todo } from "../../../shared/components/Todo";

export function TodoList() {
  const props = useMapStateToProps((state) => ({
    text: selectText(state),
    list: selectAll(state),
  }));

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
}
