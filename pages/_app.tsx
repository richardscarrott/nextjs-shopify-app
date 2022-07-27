import "../styles/globals.css";
import type { AppProps } from "next/app";

const App: React.FunctionComponent<AppProps> = ({ Component, pageProps }) => (
  <Component {...pageProps} />
);

export default App;
