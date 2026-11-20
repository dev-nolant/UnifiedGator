import "./globals.css";

export const metadata = { title: "Unified Gator" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      // suppress warning if theme is set before react draws
      // set ug-theme data-theme
      // children shows current page
      <html lang="en" suppressHydrationWarning>
      <body>
      <script dangerouslySetInnerHTML={{
            __html: 'try{var t=localStorage.getItem("ug-theme");if(t)document.documentElement.dataset.theme=t}catch(e){}',
            }}
        />
      {children}
      </body>
    </html>
  );
}
