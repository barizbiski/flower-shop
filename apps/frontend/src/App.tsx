import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Header } from './components/layout/Header';
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
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
