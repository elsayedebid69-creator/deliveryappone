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

- Build native apps through a customer/captain/kitchen/admin CI matrix using scripts/mobile-apps.ts and FOODHUB_APP before Capacitor sync; each binary must have a matching identity and initial hosted URL.
- Native shells use a generated dist/mobile fallback and load the published TanStack site; SSR build output is not an offline native app.
- Label unsigned iOS outputs as compilation bundles, never installable IPAs; device distribution requires archive/export with valid Apple signing.
