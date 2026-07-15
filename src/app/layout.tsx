import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Link from "@/components/Link";
import ButtonLink from "@/components/ButtonLink";
import theme from "@/theme";
import {ThemeProvider} from "@mui/material/styles";
import { StrictMode } from "react";



export const metadata: Metadata = {
  title: "Ewidencja Faktur",
  description: "",
  // As this is internal tool, we likely dont want search engines indexing it
  robots: "none",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased`}>
      
      <body className="min-h-full flex flex-col">
        <StrictMode>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <AppBar position="static">
              <Toolbar>
                <ButtonLink
                  href="/"
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                Strona główna
              </ButtonLink>
                <ButtonLink
                  href="/rejestr"
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                Rejestr dokumentów
              </ButtonLink>
              <ButtonLink
                  href="/nowy"
                  
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                Nowy dokument
              </ButtonLink>
              <ButtonLink
                  href="/kategorie"
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                Zarządzanie kategoriami
              </ButtonLink>
              </Toolbar>
            </AppBar>
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
        </StrictMode>
      </body>
    </html>
  );
}
