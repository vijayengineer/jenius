<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Jenius engineering rules

- `origin` is the canonical application repository. Treat `design` as read-only and never push
  application work to it.
- Preserve the existing Lovable visual identity, typography, responsive layout, navigation,
  accessibility, design tokens, and polished components. Extend the existing presenters instead
  of replacing them with generic UI.
- Keep bundled learning content deterministic, age-accessible, and validated locally before it is
  exposed to the application.
- Maintain offline-first behaviour. Core lessons and previously persisted progress must remain
  usable without a network connection.
- Do not access Firestore or another remote datastore directly from client components. Keep future
  backend integration behind the small repository/API abstractions described in
  `docs/architecture.md`.
- Do not add external image or video URLs. Media is optional and learning flows must work without
  it.
- Use strict TypeScript and avoid unnecessary dependencies.
- Before completing application changes, run content validation, tests, typecheck, lint, and the
  production build.
- Do not rewrite published Lovable history: no force pushes, rebases, amended published commits, or
  squashes.
