import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "./styles/global.js";
import { theme } from "./styles/theme.js";
import { RequestProvider } from "./context/context.jsx";
import { AuthProvider } from "./context/AuthProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <RequestProvider>
          <App />
        </RequestProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);
