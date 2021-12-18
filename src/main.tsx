import React from "react";
import ReactDOM from "react-dom";
import { List } from "./list";
import { Upload } from "./upload";

function App() {
  if (window.location.href.includes("list")) return <List />;
  return <Upload />;
}

ReactDOM.render(<App />, document.getElementById("app"));
