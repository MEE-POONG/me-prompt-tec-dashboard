import "@/styles/globals.css";
import type { AppProps } from "next/app";
import VersionBadge from "@/components/VersionBadge";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <VersionBadge />
    </>
  );
}
