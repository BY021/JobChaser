'use client'

import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeToggleButton } from "@/komponenter/ThemeToggleButton";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <html lang="sv">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>JobChaser</title>
      </head>
      <ThemeProvider>
        <body>
          <header>
            <nav>
              <Link href="/" className="logo">JobChaser</Link>
              <ul>
                <li><Link href="/">Hem</Link></li>
                <li><Link href="/jobb">Jobb</Link></li>
                {!isLoggedIn && (
                  <>
                    <li><Link href="/registrera">Registrera dig</Link></li>
                    <li><Link href="/logga-in">Logga in</Link></li>
                  </>
                )}
                {isLoggedIn && (
                  <li>
                    <button onClick={handleLogout} className="logout-button">
                      Logga ut
                    </button>
                  </li>
                )}
                <li><ThemeToggleButton /></li>
              </ul>
            </nav>
          </header>
          <main>{children}</main>
          <footer>
            <p>© 2025 JobChaser</p>
          </footer>
        </body>
      </ThemeProvider>
    </html>
  );
}