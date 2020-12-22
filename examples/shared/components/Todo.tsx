export interface ITodoProps {
  text: string;
  onRemove();
}

export const Todo = (props: ITodoProps) => (
  <li>
    <span>{props.text}</span>
    <button onClick={props.onRemove}>X</button>
  </li>
);
