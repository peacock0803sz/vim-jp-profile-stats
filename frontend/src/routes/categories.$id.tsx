import { useParams } from "react-router";

export function Component() {
  const { id } = useParams();
  return (
    <div>
      <h1>Category {id}</h1>
      <p>Category detail - coming soon</p>
    </div>
  );
}
