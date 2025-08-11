import "pretendard/dist/web/static/pretendard.css";
import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
 

  *, *::before, *::after { box-sizing: border-box; }

  html, body, #root {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: ${({ theme }) => theme.font.family};
    font-size: ${({ theme }) => theme.font.size.body};
    line-height: ${({ theme }) => theme.font.lineHeight.body};
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.bg};
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
    font-weight: ${({ theme }) => theme.font.weight.semibold};
  }

  h1 { font-size: ${({ theme }) => theme.font.size.h1}; line-height: ${({
  theme,
}) => theme.font.lineHeight.h1}; }
  h2 { font-size: ${({ theme }) => theme.font.size.h2}; line-height: ${({
  theme,
}) => theme.font.lineHeight.h2}; }
  h3 { font-size: ${({ theme }) => theme.font.size.h3}; line-height: ${({
  theme,
}) => theme.font.lineHeight.h3}; }

  p { margin: 0 0 1em; }

  small { font-size: ${({ theme }) => theme.font.size.small}; line-height: ${({
  theme,
}) => theme.font.lineHeight.small}; }


`;
