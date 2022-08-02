import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "antd/dist/antd.min.css";
import axios from "axios";
axios.defaults.timeout = 10000;
// axios.defaults.baseURL = "http://192.168.50.206:8887";
axios.defaults.baseURL = "http://localhost:8887"

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
