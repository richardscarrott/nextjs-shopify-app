import "@shopify/polaris/build/esm/styles.css";
import type { AppProps } from "next/app";

const App: React.FunctionComponent<AppProps> = ({ Component, pageProps }) => (
  <Component {...pageProps} />
);

export default App;
