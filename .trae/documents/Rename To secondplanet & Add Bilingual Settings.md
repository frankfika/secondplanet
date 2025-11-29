## Scope
- Rename project identity from “Global Village/地球村” to “secondplanet/第二星球”.
- Update monorepo package scope from `@gv/*` to `@secondplanet/*`.
- Add bilingual (English/中文) support with a Settings toggle.

## Code Changes
- Root `package.json`:
  - Change `name` to `secondplanet`.
  - Update scripts filters from `@gv/web` and `@gv/server` to `@secondplanet/web` and `@secondplanet/server`.
- Workspace packages:
  - `packages/core/package.json`: rename to `@secondplanet/core`.
  - `packages/web/package.json`: rename to `@secondplanet/web`, update dependency from `@gv/core` → `@secondplanet/core`.
  - `apps/server/package.json`: rename to `@secondplanet/server`, update dependency from `@gv/core` → `@secondplanet/core`.
- TypeScript config:
  - Root `tsconfig.json`: update `paths` from `"@gv/core"` → `"@secondplanet/core"`.
- Turborepo:
  - Root scripts already use Turbo filters; align any references in `turbo.json` (if present) and scripts to new scope.
- Vercel config (`vercel.json`):
  - Update `buildCommand` filter `pnpm --filter @gv/web build` → `pnpm --filter @secondplanet/web build`.
  - Keep `includeFiles` paths (still point to folders, independent of package name).

## Text & Branding Updates
- `packages/web/index.html`: change `<title>` from `Global Village - 地球村` → `secondplanet - 第二星球`.
- `README.md`, `PRD.md`: replace occurrences of “Global Village/地球村” with “secondplanet/第二星球”, adjust feature descriptions where needed.
- `packages/core/src/index.ts` and other banner/comments or exported constants (if any) mentioning Global Village → secondplanet.

## Bilingual Support (Web)
- Create lightweight i18n:
  - `packages/web/src/i18n.ts`: context + hook (`I18nProvider`, `useI18n`) with `lang: 'en' | 'zh'`, dictionaries for common UI strings.
  - Persist language in `localStorage` and detect default from `navigator.language` (use `zh` if startsWith('zh'), else `en`).
- Integrate i18n:
  - Wrap app root with `I18nProvider` in `src/index.tsx`.
  - Replace hard-coded UI labels for key areas with `t('key')`:
    - Navigation labels, headers (e.g., Data Center, Constitution, Invite Code, Transfer Ownership, Privacy Settings, Like/Comment/Share buttons, Admin Settings).
    - Auth view labels if present.
- Settings UI:
  - Add a Settings panel/section in the existing UI (reuse the Settings icon) to switch language between English/中文.
  - Apply change immediately and persist.

## Verification
- Run `pnpm install` to refresh workspace links after renames.
- Start dev servers: `pnpm dev:server`, `pnpm dev:web`, verify both run.
- Build `@secondplanet/web` and verify Vercel `buildCommand` uses updated filter.
- Validate i18n toggle in Settings; ensure language persists across reloads.

## Notes
- No new documentation files created; only update existing ones.
- Keep API paths and back-end modules unchanged; only rename package scope and user-facing texts.
- If the repository name on GitHub also needs changing to `secondplanet`, we can do it after code updates (outside codebase).