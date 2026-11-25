import { Navigate } from 'react-router-dom';
import { AuthPageLayout } from '../shared/AuthPageLayout';
import { useAuth } from '../shared/useAuth';
import { useSafeNext } from '../shared/useSafeNext';
import { LoginForm } from './LoginForm';

/** /login — once the shopper is logged in (here or from the header), goes to a safe ?next= or home. */
export function LoginPage() {
  const { user } = useAuth();
  const next = useSafeNext();

  if (user) return <Navigate to={next} replace />;

  return (
    <AuthPageLayout title="Welcome back" intro="Log in to check out and see your details." switchTo="signup">
      <LoginForm idPrefix="login" />
    </AuthPageLayout>
  );
}
