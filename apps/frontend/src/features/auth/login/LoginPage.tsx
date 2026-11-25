import { Navigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../../components/ui/Card/Card';
import { Heading } from '../../../components/ui/Heading/Heading';
import { TextLink } from '../../../components/ui/TextLink/TextLink';
import { safeNext } from '../../../utils/safeNext';
import { useAuth } from '../shared/useAuth';
import { LoginForm } from './LoginForm';

/** /login — once the shopper is logged in (here or from the header), goes to a safe ?next= or home. */
export function LoginPage() {
  const { user } = useAuth();
  const [params] = useSearchParams();

  if (user) return <Navigate to={safeNext(params.get('next'))} replace />;

  return (
    <main className="flex justify-center px-4 py-12 sm:py-20">
      <Card className="w-full max-w-md">
        <Heading>Welcome back</Heading>
        <p className="mt-2 mb-6 text-sm leading-relaxed text-muted">Log in to check out and see your details.</p>

        <LoginForm idPrefix="login" />

        <p className="mt-5 mb-0 flex justify-center gap-1.5 border-t border-line-soft pt-4 text-sm text-muted">
          New here?
          <TextLink to="/signup" emphasis>
            Create an account
          </TextLink>
        </p>
      </Card>
    </main>
  );
}
