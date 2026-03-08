# Avatar Porting Mapping

## A. Public API Mapping

- React source path:
  - `../base-ui/packages/react/src/avatar/*`
- Solid target path:
  - `packages/solid/src/avatar/*`
- Export names:
  - `Avatar` namespace (`Avatar.Root`, `Avatar.Image`, `Avatar.Fallback`)
  - `AvatarImageDataAttributes`
- Prop highlights:
  - `Avatar.Image`: `src`, `onLoadingStatusChange`, `referrerPolicy`, `crossOrigin`

## B. Behavior Mapping

- `Avatar.Root` owns `imageLoadingStatus` and shares it to parts through context.
- `Avatar.Image`:
  - tracks image loading via `useImageLoadingStatus`
  - renders only when status is `loaded`
  - reports status via `onLoadingStatusChange`
- `Avatar.Fallback`:
  - renders while image is not loaded

## C. Solid Adaptation Notes

- Transition animation state utilities from React source are intentionally deferred.
- `Avatar.Fallback delay` is deferred until a stable timer lifecycle pattern for Solid 2 beta is validated.
- Core loading/fallback behavior is preserved with signal-based state and deterministic tests.
