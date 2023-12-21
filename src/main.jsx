import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import ReactGA from "react-ga4";
import mixpanel from "mixpanel-browser";

ReactGA.initialize("G-HK5TWK3JJV");
mixpanel.init("f235672d356c5b89e0cdcf779a9c4d4e", { debug: true });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
