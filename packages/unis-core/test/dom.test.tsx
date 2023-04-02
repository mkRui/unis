/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, expect, it } from "vitest";
import { useEffect } from "../src/api/useEffect";
import { useState } from "../src/api/useState";
import { h } from "../src/h";
import { render } from "../src/runtime/dom";
import { sleep } from "./util";

let root: Element;

beforeEach(() => {
  root = document.createElement("div");
  document.body.append(root);
});

afterEach(() => {
  root.innerHTML = "";
});

it("dom", async () => {
  const App = () => {
    let [toggle, setToggle] = useState(true);

    const getCurrentStyle = () => {
      return toggle
        ? {
            style: {
              background: "yellow",
            },
            tabindex: "1",
            className: "class1",
            onClick: () => {},
          }
        : {
            style: {
              background: "red",
            },
            tabindex: "2",
            onClick: () => {},
          };
    };

    useEffect(
      () => {
        setToggle(false);
      },
      () => []
    );

    return () => {
      return <div {...getCurrentStyle()}>hello</div>;
    };
  };

  render(<App />, root);
  expect(root.innerHTML).toBe(
    '<div style="background: yellow;" tabindex="1" class="class1">hello</div>'
  );
  await sleep(10);
  expect(root.innerHTML).toBe(
    '<div style="background: red;" tabindex="2">hello</div>'
  );
});
