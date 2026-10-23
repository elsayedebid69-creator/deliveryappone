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
- Courier shifts and order actions are persisted through authenticated database RPCs using server time; couriers cannot directly edit attendance or claim arbitrary orders, preventing salary-day and coverage tampering.
- Derive courier availability from server timestamps rather than scheduled polling; RPC synchronization materializes completed shifts and never dispatches after work completion.
- Coverage uses an exact delivery-neighborhood label and an admin-confirmed adjacency set; only orders with a real pickup address are dispatched to avoid invented locations.
