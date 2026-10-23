# FoodHub mobile build status

The workflow builds customer, captain, and kitchen independently. Each uses a distinct `delivery.foodhub.<role>` identity and opens the matching `https://foodhub.delivery/?app=<role>` interface. These are native shells around the published website and require connectivity. Unpublished website changes are not included automatically.

## GitHub prerequisite

The supplied repository `elsayedebid69-creator/future` was empty and had zero Actions runs when reviewed. Use Lovable Project settings → Git to connect this project. Git sync creates a new repository; it cannot attach the existing `future` repository. If already connected, inspect the actual synced repository rather than reconnecting. The agent cannot see or change Git sync status.

Once files reach the synced repository, open Actions → Build FoodHub mobile apps → Run workflow. The current automatic trigger is `main`; if the synced branch differs, update that trigger. Download artifacts from the successful run.

## Outputs and limits

- Three Android debug-signed test APKs; installable for testing, not store release builds.
- Three iOS unsigned device compilation bundles; not installable device IPAs.
- Three iOS simulator bundles, for testing with a compatible Mac/Xcode simulator.

Native Gradle/Xcode compilation has not been executed by this review. Local validation covered four app identity tests, Capacitor Android sync, and iOS display-name/location declarations.

## Production requirements

- Android: secure upload keystore and passwords, release signing configuration, and signed AAB builds.
- iOS: Apple Developer team, three registered bundle identifiers, matching certificates/profiles, archive and export configuration. Never rename an unsigned bundle to an IPA and claim it is installable.
- Native push: matching Android Firebase configuration per identity and iOS push capabilities/provisioning must be configured and tested; not verified here.
- Verify real customer checkout, kitchen acceptance, captain delivery, and customer tracking end to end on devices before store submission.