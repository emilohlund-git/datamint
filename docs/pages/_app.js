import "../components/tailwind.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head />
      <Component {...pageProps} />
    </>
  );
}
