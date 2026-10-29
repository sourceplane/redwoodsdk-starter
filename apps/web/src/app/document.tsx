import { SITE_NAME } from "@/app/site";

export const Document: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{SITE_NAME}</title>
      <link
        rel="icon"
        href="/favicon-light.svg"
        type="image/svg+xml"
        media="(prefers-color-scheme: light)"
      />
      <link
        rel="icon"
        href="/favicon-dark.svg"
        type="image/svg+xml"
        media="(prefers-color-scheme: dark)"
      />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin=""
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=optional"
        precedence="first"
      />
      <link rel="modulepreload" href="/src/client.tsx" />
    </head>
    <body>
      {children}
      <script>import("/src/client.tsx")</script>
    </body>
  </html>
);
