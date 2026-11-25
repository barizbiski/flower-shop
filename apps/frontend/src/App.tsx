import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { APP_ROUTES } from './constants/routes';
import { AuthProvider } from './features/auth/shared/AuthProvider';
import { LoginPage } from './features/auth/login/LoginPage';
import { SignupPage } from './features/auth/signup/SignupPage';
import { HomePage } from './pages/HomePage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path={APP_ROUTES.home} element={<HomePage />} />
          <Route path={APP_ROUTES.signup} element={<SignupPage />} />
          <Route path={APP_ROUTES.login} element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
