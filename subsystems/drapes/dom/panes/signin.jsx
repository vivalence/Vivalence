import { Show } from "solid-js";
import { Button } from "../Button.jsx";
import { Field } from "../Field.jsx";
import { Logo } from "../Logo.jsx";
import { watch } from "../watch.js";

export const Signin = (props) => {
  const lighthouse = props.client.runtime.lighthouse;
  const status = watch(lighthouse.$status);
  const joinable = () => lighthouse.implements("JOINABLE");
  let username = null;
  let password = null;

  const submit = (event) => {
    event.preventDefault();
    lighthouse.login(username.value, password.value);
  };

  return (
    <form class="signin-pane" onSubmit={submit}>
      <Logo size={40} />
      <div class="signin-title">{props.client.mask.manifest.slug}</div>
      <Field label="user" width={36}>
        <input
          class="kit-field-input"
          ref={(element) => (username = element)}
          name="username"
          autocomplete="username"
          autocapitalize="off"
          spellcheck={false}
        />
      </Field>
      <Field label="pass" width={36}>
        <input
          class="kit-field-input"
          ref={(element) => (password = element)}
          name="password"
          type="password"
          autocomplete="current-password"
        />
      </Field>
      <Show when={status().message}>
        <div class="signin-message" data-code={status().code}>
          {status().message}
        </div>
      </Show>
      <div class="signin-actions">
        <Button tone="primary" type="submit" label="sign in" />
        <Show when={joinable()}>
          <Button tone="ghost" label="sign up" onClick={() => lighthouse.signup(username.value, password.value)} />
        </Show>
      </div>
    </form>
  );
};

export const style = `
.signin-pane {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--size-space-md);
  width: min(340px, calc(100vw - 32px));
  box-sizing: border-box;
  padding: var(--size-space-xl);
  border-radius: var(--shape-radius-card);
  background: var(--surface);
  color: var(--text-ink);
  box-shadow: var(--shape-lift), 0 0 0 var(--size-ring) var(--boundary);
}
.signin-pane .kit-logo {
  align-self: center;
}
.signin-title {
  align-self: center;
  margin-bottom: var(--size-space-sm);
  font-family: var(--font-family-brand);
  font-size: var(--size-type-md);
  color: var(--text-light);
}
.signin-message {
  font-family: var(--font-family-code);
  font-size: var(--size-type-2xs);
  color: var(--signal-negative-ink);
}
.signin-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: var(--size-space-sm);
}
`;
