import './globals.css';
import { ThemeToggle } from './components/ThemeToggle';
import { getTheme, setTheme } from '@/lib/theme';
import { AppProvider } from './context/AppContext';

// Theme will be initialized on the client side in ThemeToggle component

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1>💸 Money Manager</h1>
              <ThemeToggle />
            </div>
            <nav>
              <a href="/">Dashboard</a>
              <a href="/spend">Spend</a>
              <a href="/savings">Savings</a>
              <a href="/investments">Investments</a>
            </nav>
          </header>
          <AppProvider>
            {children}
          </AppProvider>
        </div>
      </body>
    </html>
  );
}
