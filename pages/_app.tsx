/*
 * @Description: app
 * @Author: Sunly
 * @Date: 2023-11-22 14:17:33
 */
import { theme, ConfigProvider } from "antd";

import type { AppProps } from "next/app";

import "@/styles/global.css";

const { darkAlgorithm } = theme;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
      <Component {...pageProps} />
    </ConfigProvider>
  );
}
