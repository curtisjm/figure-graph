# Clerk Auth Styling Design

## Goal

Make Clerk's sign-in and sign-up screens feel native to Figure Graph by aligning the auth card, inputs, buttons, dividers, footer actions, and provider icons with the project's existing dark theme and shadcn-style component tokens.

## Problem Summary

The current Clerk setup uses the `shadcn` base theme globally in `src/app/layout.tsx`, which partially maps Clerk UI to the app's CSS variables. That gets the auth surfaces close to the site theme, but it leaves important areas under-specified:

- Social provider buttons do not consistently match the app's dark card styling.
- Some provider icons are too dark against the current button surfaces, especially on Apple and GitHub buttons.
- Clerk's footer/action strip and divider treatment still feel like a third-party widget instead of part of Figure Graph.
- The current setup depends too heavily on implicit theme token inheritance, which makes the auth UI fragile when Clerk's defaults differ from the app's intent.

## External References

- Clerk appearance overview: use the `appearance` prop on `ClerkProvider` to set shared `theme`, `variables`, `elements`, and `cssLayerName` values.
- Clerk themes docs: `@clerk/ui/themes/shadcn` is the correct base theme for Tailwind v4 + shadcn token integration.
- Clerk variables docs: key overrides include `colorPrimary`, `colorPrimaryForeground`, `colorBackground`, `colorInput`, `colorInputForeground`, `colorBorder`, `colorRing`, `colorForeground`, `colorMuted`, and `colorMutedForeground`.
- Clerk bring-your-own-CSS docs: use `appearance.elements` for targeted overrides such as `formButtonPrimary`, `formFieldInput`, `socialButtonsBlockButton`, `socialButtonsProviderIcon`, `dividerLine`, and footer-related elements.

## Chosen Approach

Keep Clerk's `shadcn` base theme, then layer explicit shared overrides on top of it.

This keeps the auth UI close to the existing design system while avoiding a full restyle from the `simple` theme. It also centralizes the styling so `SignIn`, `SignUp`, and any future Clerk auth surfaces inherit the same appearance config.

## Files and Responsibilities

- `src/lib/clerk-appearance.ts`
  - New shared Clerk appearance object.
  - Holds all explicit `variables` and `elements` overrides.
  - Becomes the single place to adjust auth theming in the future.
- `src/app/layout.tsx`
  - Uses the shared Clerk appearance config in `ClerkProvider`.
  - Keeps global Clerk styling consistent across auth routes.
- `src/app/sign-in/[[...sign-in]]/page.tsx`
  - May receive only minimal layout polish if needed for spacing or width framing.
- `src/app/sign-up/[[...sign-up]]/page.tsx`
  - Matches sign-in page framing if any page-level wrapper changes are needed.

## Visual Design

### Auth Card

- Keep the card dark and quiet, matching the app's existing `--card`, `--border`, `--foreground`, and `--muted-foreground` palette.
- Preserve the site's radius and spacing rhythm instead of creating a special auth-specific shell.
- Reduce the visual separation of Clerk-owned footer regions so the full auth box reads as one intentional surface.

### Primary Actions

- Match the site's existing primary button treatment: light button surface, dark text, and modest hover adjustment.
- Keep focus states tied to the same ring color family already used by shadcn inputs and buttons.
- Ensure text remains readable across normal, hover, focus, and disabled states.

### Inputs

- Match the app's dark inputs with clear borders, readable placeholder text, and stronger focus contrast.
- Avoid transparent or under-specified input styling that can blend into the card background.

### Social Provider Buttons and Icons

- Style social buttons as secondary dark actions that visually belong on the same auth card.
- Keep Google's multicolor mark intact.
- Force high-contrast readable icon treatment for Apple and GitHub where the inherited icon color currently disappears into the button surface.
- Ensure the provider button text, icon, border, and hover state remain legible against the dark background.

### Secondary Chrome

- Tone down divider lines and footer/action areas so they align with the app's dark neutral palette.
- Keep support text and sign-up/sign-in links visible but secondary.

## Implementation Details

### Global Appearance Config

Create a shared appearance object that:

- Keeps `theme: shadcn`.
- Sets `cssLayerName` if needed so Tailwind utility overrides consistently win over Clerk defaults.
- Uses explicit `variables` values tied to the site's existing CSS variables or equivalent direct values.

The initial variable set should include:

- `colorBackground`
- `colorForeground`
- `colorMuted`
- `colorMutedForeground`
- `colorPrimary`
- `colorPrimaryForeground`
- `colorInput`
- `colorInputForeground`
- `colorBorder`
- `colorRing`
- `borderRadius`
- `fontFamily`

### Targeted Element Overrides

Use `appearance.elements` to address the places where token-level theming is not enough.

Priority targets:

- `cardBox`
- `footer`
- `footerAction`
- `footerActionLink`
- `dividerLine`
- `dividerText`
- `formFieldInput`
- `formFieldLabel`
- `formButtonPrimary`
- `socialButtonsBlockButton`
- `socialButtonsBlockButtonText`
- `socialButtonsProviderIcon`

Optional targets if inspection shows they are needed:

- `headerTitle`
- `headerSubtitle`
- `identityPreviewEditButton`
- `formFieldErrorText`

### Provider-Specific Readability

Use Clerk's element selector variants for provider-specific overrides if the generic social button icon styling is still insufficient. The likely cases are GitHub and Apple because their icons are single-color and can inherit low-contrast fills or opacity.

## Data Flow and Ownership

- The app theme remains defined by `src/app/globals.css` CSS variables.
- The shared Clerk appearance config maps those theme values into Clerk's `variables` and `elements` APIs.
- `ClerkProvider` applies the config globally.
- `SignIn` and `SignUp` remain mostly declarative consumers and should not duplicate styling logic.

## Error Handling and Safety

- Prefer targeted overrides over a broad `simple` theme rewrite to reduce the risk of breaking Clerk states that are not visible in the initial sign-in screen.
- Keep the config centralized so future auth changes do not drift between pages.
- Avoid styling against Clerk internal generated classes; only use documented `appearance.elements` keys.
- If a social provider icon still looks unreadable after the shared override, add a provider-specific override rather than compensating with a global button color that harms other providers.

## Verification Plan

### Automated

- Run lint or type-checking on files touched by the Clerk appearance extraction.
- Verify the shared appearance object is imported cleanly and does not introduce type regressions.

### Human Visual Check

Because browser access is not currently available in-session, final validation requires a human pass on the rendered auth pages.

Check:

- Apple, GitHub, and Google buttons are all readable.
- Primary button matches the app's button styling.
- Input field borders, placeholder text, and focus state are readable.
- Footer and divider colors feel native to Figure Graph.
- Sign-in and sign-up pages remain centered and usable on desktop and mobile.

## Out of Scope

- Rebuilding Clerk auth as a custom flow.
- Broad redesign of the site's overall visual system.
- Changing auth behavior, routes, providers, or Clerk dashboard settings.

## Future Tooling Note

If future sessions need faster visual verification, add a browser-access MCP such as Playwright or Chrome DevTools. That would allow direct inspection of the rendered Clerk DOM, computed styles, and screenshots during iteration.

