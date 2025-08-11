import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root {
  width:100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }
  body {
     font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui,
                 Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo',
                 'Noto Sans KR', 'Malgun Gothic', sans-serif;
    font-size: 16px; 
    line-height: 24px;
    color: #222;
    background-color: #fff;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  ul, ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  button {
    font-family: inherit;
    font-size: inherit;
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
  }
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: 600;
  }
  h1 { font-size: 28px; line-height: 36px; }
  h2 { font-size: 24px; line-height: 32px; }
  h3 { font-size: 20px; line-height: 28px; }
  p { margin: 0 0 1em; }
  small { font-size: 12px; line-height: 18px; }
`;
