import { TextLink } from '../../../components/ui/TextLink/TextLink';
import { AUTH_SWITCH_PROMPTS } from './auth.constants';
import type { AuthSwitchPromptProps } from './auth.types';

/** "New here? Create an account" / "Already have an account? Log in". */
export function AuthSwitchPrompt({ target, divided = false }: AuthSwitchPromptProps) {
  const { question, label, to } = AUTH_SWITCH_PROMPTS[target];
  return (
    <p
      className={`mb-0 flex justify-center gap-1.5 text-sm text-muted ${
        divided ? 'mt-5 border-t border-line-soft pt-4' : 'mt-4'
      }`}
    >
      {question}
      <TextLink to={to} emphasis>
        {label}
      </TextLink>
    </p>
  );
}
