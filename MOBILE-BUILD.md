# FoodHub mobile build status

The workflow builds customer, captain, kitchen, and admin independently. Each uses a distinct `delivery.foodhub.<role>` identity and opens the matching `https://foodhub.delivery/?app=<role>` interface. These are native shells around the published website and require connectivity. Unpublished website changes are not included automatically.

## GitHub prerequisite

The project is synced to `elsayedebid69-creator/deliveryappone` on branch `main`, and the GitHub API connector is linked to this project (`GITHUB_API_KEY`, gateway-backed) for server-side calls. The older `future` repository is empty and unused.

The workflow runs automatically on every push to `main`. It can also be started manually from Actions → Build FoodHub mobile apps → Run workflow. Download artifacts from the successful run.

## Outputs and limits

- Four Android debug-signed test APKs; installable for testing, not store release builds.
- Four iOS unsigned device compilation bundles; not installable device IPAs.
- Four iOS simulator bundles, for testing with a compatible Mac/Xcode simulator.

Native Gradle/Xcode compilation has not been executed by this review. Local validation covered four app identity tests, Capacitor Android sync, and iOS display-name/location declarations.

## Production requirements

- Android: secure upload keystore and passwords, release signing configuration, and signed AAB builds.
- iOS: Apple Developer team, three registered bundle identifiers, matching certificates/profiles, archive and export configuration. Never rename an unsigned bundle to an IPA and claim it is installable.
- Native push: matching Android Firebase configuration per identity and iOS push capabilities/provisioning must be configured and tested; not verified here.
- Verify real customer checkout, kitchen acceptance, captain delivery, and customer tracking end to end on devices before store submission.