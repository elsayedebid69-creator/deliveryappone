# Mobile app completion
- [ ] Enforce single break, no manual offline/finish, automatic completion/offline, and one rejection per shift; test authenticated controls and limits.
- [x] Simplify courier app; admin assigns three areas and start time. Authenticated UI verified: create courier/shift, start, request+approve break, early finish unpaid. Database clock boundaries verified: 35999/32400/36000 seconds. Nine tests passed.
- [ ] Verify dispatch, pickup and delivery with real restaurant/customer orders; blocked: no live orders or configured pickup/delivery-area data yet. Publish courier/admin screen changes before phone use.
- [x] Correct role-specific Android and iOS packaging; identity tests, Android sync, and iOS plist validation passed. iOS device and simulator bundles compiled successfully in GitHub.
- [x] Fix existing preview compilation error.
- [x] Verify GitHub build results; run 1 succeeded, all three Android APKs downloaded and each carries its own identity.
- [x] Add fourth admin app identity (delivery.foodhub.admin) to build matrix.
- [ ] Produce signed iPhone store distributions; blocked: Apple signing credentials.
- [x] Admin Android signed APK delivered previously; Android signing is configured.
