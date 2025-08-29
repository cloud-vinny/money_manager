import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header>
            <h1>💸 Money Manager</h1>
            <nav>
              <a href="/">Dashboard</a>
              <a href="/spend">Spend</a>
              <a href="/savings">Savings</a>
              <a href="/investments">Investments</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
