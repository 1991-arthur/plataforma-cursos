// src/components/ui/button.tsx
import * as React from "react";

// Definindo os tipos para as props do componente
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode; // O conteúdo do botão (texto, ícone, etc.)
  // Você pode adicionar mais props personalizadas aqui no futuro, como 'variant' ou 'size'
}

// O componente Button em si
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      // O elemento HTML base é um <button>
      <button
        // Mescla a className passada como prop com as classes padrão do Tailwind
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 ${className}`}
        // Repassa todas as outras props (onClick, type, etc.) para o <button>
        ref={ref}
        {...props}
      >
        {/* Renderiza o conteúdo filho do botão */}
        {children}
      </button>
    );
  }
);
// Define um displayName para o componente, útil para depuração no React DevTools
Button.displayName = "Button";

export { Button, type ButtonProps };