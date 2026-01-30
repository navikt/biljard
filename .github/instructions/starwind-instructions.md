# Starwind UI Instructions

This project uses [Starwind UI](https://starwind.dev/) for its design system.

## Key Principles

- **Tailwind CSS**: Starwind is built on top of Tailwind CSS. Use Tailwind utility classes for layout and spacing.
- **Components**: Pre-built components are located in `src/components/ui`.
- **Icons**: Use `@tabler/icons-react` or similar icon libraries compatible with React.

## Usage

Import components from `@/components/ui/...`:

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MyComponent() {
  return (
    <div className="p-4">
      <Input placeholder="Type here..." className="mb-4" />
      <Button>Click me</Button>
    </div>
  );
}
```

## Adding New Components

Use the Starwind CLI to add new components:

```bash
npx starwind@latest add [component-name]
```

Example: `npx starwind@latest add avatar`

## Customization

- **Theme**: Customize colors and fonts in `src/styles/starwind.css` (Tailwind theme configuration).
- **Components**: Components are installed directly into your project. You can modify them freely in `src/components/ui`.
