# Design System: The Organic Sanctuary

**Creative North Star:** Transform a clinical health topic into a warm, approachable, premium wellness experience. Every interaction should feel like a deep breath — intentional, soft, and supportive.

---

## 1. Color System

Tokens live in `theme/colors.ts` as the `DS` object. Import with:

```ts
import { DS } from '@/theme/colors';
```

### Surface Hierarchy (use for background layering, never borders)

| Token | Hex | Role |
|---|---|---|
| `DS.surfaceContainerLow` | `#f3f4f0` | App/screen background |
| `DS.surface` | `#f9faf6` | Elevated page areas |
| `DS.surfaceContainerLowest` | `#ffffff` | Cards, inputs (highest priority) |
| `DS.surfaceContainer` | `#eceeed` | Secondary areas |
| `DS.surfaceContainerHigh` | `#e6e8e4` | Hover/press states |
| `DS.surfaceContainerHighest` | `#e2e3df` | Subtle dividers / secondary info |

### Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `DS.primary` | `#633a7f` | Headlines, CTAs, active states |
| `DS.onPrimary` | `#ffffff` | Text/icons on primary |
| `DS.primaryContainer` | `#ecddf5` | Insight cards, status pills |
| `DS.onPrimaryContainer` | `#1e0035` | Text on primaryContainer |
| `DS.secondary` | `#4f644b` | Positive health actions, success indicators |
| `DS.onSecondary` | `#ffffff` | Text on secondary |
| `DS.secondaryContainer` | `#cfe6c7` | Trust/info cards, secondary buttons |
| `DS.onSecondaryContainer` | `#53684f` | Text on secondaryContainer |

### Tertiary (Health Log Chip / Alerts)

| Token | Hex | Usage |
|---|---|---|
| `DS.tertiaryFixed` | `#ffdbd1` | Error/alert card backgrounds |
| `DS.onTertiaryFixed` | `#390c02` | Text on tertiaryFixed |

### Text

| Token | Hex | Usage |
|---|---|---|
| `DS.onSurface` | `#1a1c1a` | Primary body text (never pure black) |
| `DS.onSurfaceVariant` | `#4c444f` | Secondary/helper text |
| `DS.outline` | `#7d7679` | Placeholder text |
| `DS.outlineVariant` | `#cec3d0` | Ghost borders (15% opacity max) |

### Tracking Category Colors

| Token | Hex | Usage |
|---|---|---|
| `DS.tracking.bowel` | `#a8d5ba` | Bowel movement dot/accent |
| `DS.tracking.urination` | `#81d4fa` | Urination dot/accent |
| `DS.tracking.meal` | `#f9c7bc` | Meal dot/accent |
| `DS.tracking.insight` | `#cfe6c7` | AI insight accent |

---

## 2. Typography Scale

No custom fonts are loaded — system font stack. Type rules:

| Style | Size | Weight | Color | Usage |
|---|---|---|---|---|
| Display | 30–34px | 800 | `DS.primary` | Screen titles (Insights, Settings) |
| Headline | 26px | 800 | `DS.primary` | Hero greeting |
| Title | 18–19px | 700 | `DS.onSurface` | Section headers |
| Body Large | 15–16px | 400 | `DS.onSurface` | Primary content |
| Body | 13–14px | 400 | `DS.onSurfaceVariant` | Descriptions, captions |
| Label | 12px | 600 | `DS.primary` | Input labels (sits above field) |
| Caption | 11–12px | 400 | `DS.onSurfaceVariant` | Timestamps, hints |

**Rules:**
- Never use pure black `#000000` — always `DS.onSurface` (`#1a1c1a`)
- Headlines use `DS.primary` for brand voice
- Body uses `DS.onSurfaceVariant` for low-fatigue reading
- Line height: 150% for body (e.g. `lineHeight: 24` for `fontSize: 16`)

---

## 3. Spacing System (8px base)

Defined in `theme/styles.ts` as `SPACING`:

```ts
xs: 4    // Tight internal gaps
sm: 8    // Icon-to-label, chip padding
md: 16   // Standard card padding, input padding
lg: 24   // Section gaps, card padding
xl: 32   // Between major sections
xxl: 48  // Bottom scroll padding, hero spacing
```

**Rule:** When elements feel crowded, step up to the next spacing value rather than adding dividers.

---

## 4. Border Radius Scale

Defined in `theme/styles.ts` as `BORDER_RADIUS`:

```ts
sm: 8     // Chips, small tags
md: 16    // Inline elements
lg: 24    // Input fields
xl: 48    // Top-level cards (primary rule)
full: 999 // Pills, FABs, avatars
```

**Rule:** Never use 0-radius (sharp corners) anywhere. Minimum `sm` (8) on all interactive elements.

---

## 5. Elevation & Shadows

Defined in `theme/styles.ts` as `SHADOWS`. Uses `DS.onSurfaceVariant` tint (never black):

| Level | Usage |
|---|---|
| `SHADOWS.sm` | Stat tiles, score cards, passive containers |
| `SHADOWS.md` | Interactive cards, hero card, breakdowns |
| `SHADOWS.lg` | FABs, floating buttons, modals |

**Rule:** Depth is created by background color contrast (`surfaceContainerLowest` on `surfaceContainerLow`), not heavy drop shadows. Shadows are extra-diffused with low opacity (5–7%).

---

## 6. Components

### Cards

```tsx
import { baseStyles } from '@/theme/styles';

<View style={baseStyles.card}>
  {/* baseStyles.card = white, xl radius, md shadow, md padding */}
</View>
```

Custom card variants (no borders):
- **Insight card:** `backgroundColor: DS.primaryContainer`
- **Trust/info card:** `backgroundColor: DS.secondaryContainer`
- **Warning/error card:** `backgroundColor: DS.tertiaryFixed`
- **Score card:** `backgroundColor: DS.primaryContainer` with centered large number

### Buttons

```tsx
import { buttonStyles, baseStyles } from '@/theme/styles';
import { DS } from '@/theme/colors';

// Primary — pill shape, brand purple
const btnStyles = buttonStyles(DS.primary);
<TouchableOpacity style={btnStyles.primary}>
  <Text style={baseStyles.buttonText}>Sign In</Text>
</TouchableOpacity>

// Secondary — positive/green action
<TouchableOpacity style={btnStyles.secondary}>
  <Text>Log Entry</Text>
</TouchableOpacity>
```

Button rules:
- Always `borderRadius: full` (pill-shaped)
- Primary: `DS.primary` bg, `DS.onPrimary` text
- Secondary: `DS.secondaryContainer` bg, `DS.onSecondaryContainer` text
- Tertiary/ghost: transparent bg, `DS.primary` text

### Input Fields

```tsx
import { baseStyles } from '@/theme/styles';
import { DS } from '@/theme/colors';

<View>
  <Text style={baseStyles.label}>Email</Text>
  <TextInput
    style={baseStyles.input}
    placeholderTextColor={DS.outline}
  />
</View>
```

Input rules:
- `baseStyles.input` = white bg, `lg` radius (24), inner ambient shadow
- Label uses `baseStyles.label` = 12px, `DS.primary`, 600 weight
- No visible border — depth from shadow only

### Health Log Chips

```tsx
<View style={{ backgroundColor: DS.tertiaryFixed, borderRadius: BORDER_RADIUS.sm, paddingHorizontal: 10, paddingVertical: 4 }}>
  <Text style={{ color: DS.onTertiaryFixed, fontSize: 13 }}>Bloating</Text>
</View>
```

### FAB (Floating Action Button)

```tsx
<TouchableOpacity style={{
  position: 'absolute',
  right: 20,
  bottom: 76,
  width: 62,
  height: 62,
  borderRadius: 31,
  backgroundColor: DS.primary,
  ...SHADOWS.lg,
}}>
  <MessageCircle size={26} color={DS.onPrimary} />
</TouchableOpacity>
```

---

## 7. The "No-Line" Rule

**Never** use `borderWidth: 1` for sectioning or container definition.

Visual separation must come from:
1. Background color shifts (e.g. white card on `#f3f4f0` base)
2. Spacing (`SPACING.xl` between sections)
3. Shadow elevation (`SHADOWS.md`)

The only acceptable border usage is the "Ghost Border" fallback for accessibility: `outlineVariant` at **15% opacity max**.

```ts
// Acceptable ghost border for accessibility only:
borderWidth: 1,
borderColor: 'rgba(206, 195, 208, 0.15)',
```

---

## 8. Stat & Metric Tiles

For overview stats (like Total Logs, Avg/Day), use tinted background tiles instead of cards:

```tsx
<View style={{
  flex: 1,
  borderRadius: BORDER_RADIUS.lg,
  paddingVertical: SPACING.xl,
  alignItems: 'center',
  backgroundColor: DS.tracking.bowel + '55', // 33% opacity tint
}}>
  <Text style={{ fontSize: 34, fontWeight: '800', color: DS.onSurface }}>42</Text>
  <Text style={{ fontSize: 13, color: DS.onSurfaceVariant }}>Total Logs</Text>
</View>
```

---

## 9. Do's and Don'ts

### Do
- Use `DS.primary` for all major headings and brand moments
- Use `DS.surfaceContainerLowest` cards on `DS.surfaceContainerLow` backgrounds
- Prefer `xl` (48) border radius for top-level cards
- Use `SPACING.xl` or `SPACING.xxl` between sections — more is better
- Use color-tinted tiles for metric stats
- Use `DS.secondaryContainer` for positive/supportive messaging
- Use `DS.tertiaryFixed` for error/warning/disclaimer content

### Don't
- Don't use `#000000` anywhere — use `DS.onSurface` (`#1a1c1a`)
- Don't use `borderWidth: 1` for card or section separation
- Don't use sharp corners — minimum `BORDER_RADIUS.sm` (8) on everything
- Don't use heavy drop shadows — keep `shadowOpacity` below 0.08
- Don't use standard divider lines between list items — use spacing and background contrast

---

## 10. File Reference

| File | Purpose |
|---|---|
| `theme/colors.ts` | All color tokens (`DS` object + `MEDITATIVE_COLORS` legacy) |
| `theme/styles.ts` | Spacing, border radius, shadows, base component styles |
| `components/ChatbotButton.tsx` | FAB positioned `bottom: 76` above tab bar |
| `app/(tabs)/_layout.tsx` | Tab bar height: 60px |
