---
applyTo: "src/**/*.{tsx,ts,astro}"
---

# Astro/React with Aksel Design System v8

> **IMPORTANT**: This project uses Aksel v8 (January 2026). Key changes from previous versions:
>
> - All CSS classes use `.aksel` prefix (not `.navds`)
> - Design tokens use `--ax` prefix
> - Native dark mode support (toggle via `light`/`dark` class on root)
> - CSS bundle ~20% smaller with CSS layers

## Aksel v8 Quick Reference

### Package Imports

```tsx
// Components
import { Button, TextField, Table, Modal, Select } from "@navikt/ds-react";

// Icons
import { PlusIcon, TrashIcon } from "@navikt/aksel-icons";

// CSS (import once in Layout)
import "@navikt/ds-css";

// Tokens (if needed separately)
import "@navikt/ds-tokens/css";  // CSS custom properties
```

### Version Requirements

- `@navikt/ds-react`: ^8.x
- `@navikt/ds-css`: ^8.x
- `@navikt/aksel-icons`: ^8.x

## Spacing Rules

**CRITICAL**: Always use Nav DS spacing tokens, never Tailwind padding/margin utilities.

### ✅ Correct Patterns

```tsx
import { Box, VStack, HGrid } from "@navikt/ds-react";

// Page container
<main className="max-w-7xl mx-auto">
  <Box
    paddingBlock={{ xs: "space-16", md: "space-24" }}
    paddingInline={{ xs: "space-16", md: "space-40" }}
  >
    {children}
  </Box>
</main>

// Component with responsive padding
<Box
  background="surface-subtle"
  padding={{ xs: "space-12", sm: "space-16", md: "space-24" }}
  borderRadius="large"
>
  <Heading size="large" level="2">Title</Heading>
  <BodyShort>Content</BodyShort>
</Box>

// Directional padding
<Box
  paddingBlock="space-16"    // Top and bottom
  paddingInline="space-24"   // Left and right
>
```

### CSS Custom Properties (v8 tokens)

```css
/* Use --ax prefixed tokens in custom CSS */
.custom-element {
  padding: var(--ax-spacing-4);
  color: var(--ax-text-default);
  background: var(--ax-surface-subtle);
  border-radius: var(--ax-border-radius-medium);
}
```

### ❌ Incorrect Patterns

```tsx
// Never use Tailwind padding/margin
<div className="p-4 md:p-6">  // ❌ Wrong
<div className="mx-4 my-2">   // ❌ Wrong
<Box padding="4">             // ❌ Wrong - no space- prefix

// Old v7 token syntax
var(--a-spacing-4)            // ❌ v7 syntax, use --ax in v8
var(--navds-*)                // ❌ Deprecated
```

## Spacing Tokens

Available spacing tokens (always with `space-` prefix in Box props):

- `space-4` (4px)
- `space-8` (8px)
- `space-12` (12px)
- `space-16` (16px)
- `space-20` (20px)
- `space-24` (24px)
- `space-32` (32px)
- `space-40` (40px)

## Dark Mode (v8)

Aksel v8 has native dark mode support:

```tsx
// Toggle theme by adding class to root element
<html className="dark">  // Dark mode
<html className="light"> // Light mode (default)

// All components automatically adapt - no Theme wrapper needed
```

## Responsive Design

Mobile-first approach with breakpoints:

- `xs`: 0px (mobile)
- `sm`: 480px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

```tsx
<HGrid columns={{ xs: 1, md: 2, lg: 3 }} gap="4">
  {items.map(item => <Card key={item.id} {...item} />)}
</HGrid>

<Box
  padding={{ xs: "space-16", sm: "space-20", md: "space-24" }}
>
```

## Component Patterns

### Layout Components

```tsx
import { Box, VStack, HStack, HGrid } from "@navikt/ds-react";

// Vertical stack with spacing
<VStack gap="4">
  <Component1 />
  <Component2 />
  <Component3 />
</VStack>

// Horizontal stack
<HStack gap="4" align="center">
  <Icon />
  <Text />
</HStack>

// Responsive grid
<HGrid columns={{ xs: 1, md: 2, lg: 3 }} gap="4">
  {/* Grid items */}
</HGrid>
```

### Typography

```tsx
import { Heading, BodyShort, BodyLong, Label } from "@navikt/ds-react";

<Heading size="large|medium|small" level="1-6">
  Title
</Heading>

<BodyShort size="large|medium|small">
  Regular text content
</BodyShort>

<BodyShort weight="semibold">
  Bold text
</BodyShort>

<Label size="large|medium|small">
  Input label
</Label>
```

### Form Components (v8)

```tsx
import { TextField, Select, Button, ConfirmationPanel } from "@navikt/ds-react";

// TextField
<TextField
  label="Navn"
  description="Valgfri hjelpetekst"
  error={errors.name}
  value={value}
  onChange={handleChange}
/>

// Select
<Select
  label="Velg type"
  description="Beskrivelse vises her"
  value={selected}
  onChange={handleSelect}
>
  <option value="a">Alternativ A</option>
  <option value="b">Alternativ B</option>
</Select>

// Button variants
<Button variant="primary">Primær</Button>
<Button variant="secondary">Sekundær</Button>
<Button variant="tertiary">Tertiær</Button>
<Button variant="danger">Fare</Button>
```

### Table Component

```tsx
import { Table } from "@navikt/ds-react";

<Table>
  <Table.Header>
    <Table.Row>
      <Table.HeaderCell scope="col">Kolonne 1</Table.HeaderCell>
      <Table.HeaderCell scope="col">Kolonne 2</Table.HeaderCell>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {data.map(row => (
      <Table.Row key={row.id}>
        <Table.DataCell>{row.col1}</Table.DataCell>
        <Table.DataCell>{row.col2}</Table.DataCell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>
```

### Modal (v8)

```tsx
import { Modal, Button, Heading } from "@navikt/ds-react";

<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  aria-labelledby="modal-heading"
>
  <Modal.Header closeButton>
    <Heading level="2" size="medium" id="modal-heading">
      Modal tittel
    </Heading>
  </Modal.Header>
  <Modal.Body>
    <p>Modal innhold her</p>
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={handleConfirm}>Bekreft</Button>
    <Button variant="tertiary" onClick={() => setIsOpen(false)}>
      Avbryt
    </Button>
  </Modal.Footer>
</Modal>
```

### Alert and Feedback

```tsx
import { Alert, Tag } from "@navikt/ds-react";

// Alert variants
<Alert variant="success">Suksess melding</Alert>
<Alert variant="warning">Advarsel melding</Alert>
<Alert variant="error">Feil melding</Alert>
<Alert variant="info">Informasjon</Alert>

// Alert with close button
<Alert variant="success" closeButton onClose={handleClose}>
  Kan lukkes
</Alert>

// Tags
<Tag variant="success" size="small">Aktiv</Tag>
<Tag variant="warning" size="small">Venter</Tag>
<Tag variant="neutral" size="small">Inaktiv</Tag>
```

### Background Colors

```tsx
<Box background="surface-default">     {/* White */}
<Box background="surface-subtle">      {/* Light gray */}
<Box background="surface-action-subtle">  {/* Light blue */}
<Box background="surface-success-subtle"> {/* Light green */}
<Box background="surface-warning-subtle"> {/* Light orange */}
<Box background="surface-danger-subtle">  {/* Light red */}
```

## Accessibility

```tsx
// Always include proper ARIA attributes
<button aria-label="Lukk modal">
<nav aria-label="Hovednavigasjon">
<main id="main-content" tabindex="-1">

// Use semantic HTML
<Heading level="1" size="xlarge">  // Not <div className="title">
<Table>                            // Not <div className="table">
<button>                           // Not <div onClick={...}>

// Focus management
button:focus-visible {
  outline: 2px solid var(--ax-border-focus);
  outline-offset: 2px;
}
```

## Number Formatting

Always use Norwegian locale for number formatting:

```typescript
const formatNumber = (num: number): string => {
  return num.toLocaleString('nb-NO');
};

// ✅ Correct
formatNumber(151354);  // "151 354"
formatNumber(1234.56); // "1 234,56"
```

## Boundaries

### ✅ Always

- Use Aksel Design System v8 components
- Use spacing tokens with `space-` prefix
- Mobile-first responsive design
- Norwegian number formatting
- Explicit error handling in API routes
- Use `--ax` prefixed tokens in custom CSS

### ⚠️ Ask First

- Adding custom Tailwind utilities
- Deviating from Aksel patterns
- Using v7 token syntax
- Custom theming beyond light/dark

### 🚫 Never

- Use Tailwind padding/margin utilities (`p-*`, `m-*`)
- Use numeric spacing without `space-` prefix
- Use old `.navds-*` class names (use `.aksel-*` in v8)
- Use old `--a-*` tokens (use `--ax-*` in v8)
- Ignore accessibility requirements
- Skip responsive props

## Documentation References

- Aksel v8 Changelog: <https://aksel.nav.no/grunnleggende/endringslogg/versjon-8>
- Aksel Components: <https://aksel.nav.no/komponenter>
- Aksel Icons: <https://aksel.nav.no/ikoner>
- Aksel Tokens: <https://aksel.nav.no/grunnleggende/styling/design-tokens>
