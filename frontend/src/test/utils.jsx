import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from '../context/UserContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { ThemeProvider } from '../contexts/ThemeContext';

export function renderWithProviders(ui, options = {}) {
  const {
    initialUserState = null,
    initialTheme = 'light',
    ...renderOptions
  } = options;

  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <ThemeProvider>
          <UserProvider>
            <CurrencyProvider>
              {children}
            </CurrencyProvider>
          </UserProvider>
        </ThemeProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
