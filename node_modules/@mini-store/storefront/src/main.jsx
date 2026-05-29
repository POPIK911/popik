import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./global.css";
import { StoreProvider } from "./observer.jsx";
import { productsStore } from "./ProductsStore.js";

const stores = { productsStore };

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StoreProvider stores={stores}>
      <App />
    </StoreProvider>
  </React.StrictMode>,
);
