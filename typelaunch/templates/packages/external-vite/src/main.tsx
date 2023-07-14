import { Component } from "solid-js";
import { render } from "solid-js/web";

import viteLogo from "./assets/vite.svg";
import "./assets/index.css";

import { Counter } from "./lib";

const Main: Component = () => (
  <div class="App">
    <div>
      <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
        <img src={viteLogo} class="logo" alt="Vite logo" />
      </a>
    </div>
    <h1>TypeLaunch Turbo: Vite + SolidJS</h1>
    <div class="card">
      <Counter initialValue={1} />
    </div>
    <p class="read-the-docs">Click on the Vite logo to learn more</p>
  </div>
);

// rome-ignore lint/style/noNonNullAssertion: This is guaranteed in `index.html`
render(() => <Main />, document.getElementById("app")!);
