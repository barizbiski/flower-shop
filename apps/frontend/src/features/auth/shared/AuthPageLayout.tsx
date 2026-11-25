import { Card } from '../../../components/ui/Card/Card';
import { Heading } from '../../../components/ui/Heading/Heading';
import type { AuthPageLayoutProps } from './auth.types';
import { AuthSwitchPrompt } from './AuthSwitchPrompt';

/** Centered card shared by the /login and /signup pages: title, intro, the form, and a link to the other page. */
export function AuthPageLayout({ title, intro, children, switchTo }: AuthPageLayoutProps) {
  return (
    <main className="flex justify-center px-4 py-12 sm:py-20">
      <Card className="w-full max-w-md">
        <Heading>{title}</Heading>
        <p className="mt-2 mb-6 text-sm leading-relaxed text-muted">{intro}</p>
        {children}
        <AuthSwitchPrompt target={switchTo} divided />
      </Card>
    </main>
  );
}
