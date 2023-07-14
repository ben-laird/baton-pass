import { add_rs, greet, subtract_rs } from "@typelaunch-turbo/wasm-vite-rs";
import { Component, createSignal } from "solid-js";

export interface CounterProps {
  initialValue?: number;
}

export const Counter: Component<CounterProps> = (props) => {
  const [count, setCount] = createSignal(props.initialValue || 0);

  return (
    <>
      <button type="button" onClick={() => setCount((count) => count + 1)}>
        <code>count</code> is {count()}. Click to increase it!
      </button>
      <button
        type="button"
        onClick={() => {
          setCount((count) => (count > 0 ? count - 1 : count));
        }}
      >
        <code>count</code> is {count()}. Click to decrease it!
      </button>
      <button type="button" onClick={() => greet("rust/wasm")}>
        Say hello with WebAssembly!
      </button>
      <p>
        Edit <code>src/App.tsx</code> or <code>src/Example.tsx</code> and save
        to watch Vite's HMR in action!
      </p>
      <p>1 + 1 = {add_rs(1, 1)}</p>
      <p>3 - 2 = {subtract_rs(3, 2)}</p>
      <p>
        {count()} + 1 = {add_rs(count(), 1)}
      </p>
    </>
  );
};
