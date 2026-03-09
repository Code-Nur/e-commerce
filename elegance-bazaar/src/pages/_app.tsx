// pages/_app.tsx
import type { AppProps } from "next/app";
import Script from "next/script";
import Layout from "../src/components/Layout"; // Layout.tsx yo'lini to'g'ri yozing (src/components/Layout bo'lsa shunday)

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Google Analytics - cookie xatosini hal qilish uchun */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-LZSME9LNTB"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-LZSME9LNTB', {
            cookie_domain: window.location.hostname,  // Bu muhim! elegance-bazaar.vercel.app uchun cookie o'rnatadi
            // Agar HTTPS bo'lsa va kerak bo'lsa qo'shing:
            // cookie_flags: 'SameSite=None; Secure'
          });
        `}
      </Script>

      {/* Sizning Layout + sahifalar */}
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;
