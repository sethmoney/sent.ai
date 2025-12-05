import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

// --- Card Components ---
export const Card = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => (
  <div className={`p-4 pb-2 space-y-1.5 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => (
  <h3 className={`font-semibold leading-none tracking-tight text-slate-100 ${className}`}>{children}</h3>
);

export const CardContent = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => (
  <div className={`p-4 pt-0 ${className}`}>{children}</div>
);

// --- Button Component ---
interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-cyan-600 text-slate-50 hover:bg-cyan-700 shadow",
    destructive: "bg-red-500 text-slate-50 hover:bg-red-600 shadow-sm",
    outline: "border border-slate-700 bg-transparent shadow-sm hover:bg-slate-800 hover:text-slate-100",
    secondary: "bg-slate-800 text-slate-100 shadow-sm hover:bg-slate-700",
    ghost: "hover:bg-slate-800 hover:text-slate-100",
  };

  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8",
    icon: "h-9 w-9",
  };

  return (
    <button className={`${baseStyles} ${variants[variant || 'default']} ${sizes[size || 'default']} ${className}`} {...props}>
      {children}
    </button>
  );
};

// --- Input Component ---
export const Input = ({ className = '', ...props }: React.ComponentProps<'input'>) => (
  <input
    className={`flex h-9 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

// --- Badge Component ---
export const Badge = ({ children, className = '', variant = 'default' }: { children?: React.ReactNode; className?: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline' }) => {
  const variants = {
    default: "border-transparent bg-cyan-900 text-cyan-100 hover:bg-cyan-900/80",
    secondary: "border-transparent bg-slate-800 text-slate-100 hover:bg-slate-800/80",
    destructive: "border-transparent bg-red-900 text-red-100 hover:bg-red-900/80",
    outline: "text-slate-100",
  };
  
  return (
    <div className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${variants[variant || 'default']} ${className}`}>
      {children}
    </div>
  );
};

// --- Alert Components ---
export const Alert = ({ children, className = '', variant = 'default' }: { children?: React.ReactNode; className?: string; variant?: 'default' | 'destructive' }) => {
  const variants = {
    default: "bg-slate-900 text-slate-100 border-slate-800",
    destructive: "bg-red-900/20 text-red-300 border-red-900/50 dark:border-red-900",
  };
  return (
    <div className={`relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:translate-y-[-3px] [&>svg~*]:pl-7 ${variants[variant || 'default']} ${className}`}>
      {children}
    </div>
  );
};

export const AlertTitle = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => (
  <h5 className={`mb-1 font-medium leading-none tracking-tight ${className}`}>{children}</h5>
);

export const AlertDescription = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => (
  <div className={`text-sm [&_p]:leading-relaxed ${className}`}>{children}</div>
);

// --- Separator ---
export const Separator = ({ className = '' }: { className?: string }) => (
  <div className={`shrink-0 bg-slate-700 h-[1px] w-full ${className}`} />
);

// --- Switch ---
export const Switch = ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={`peer inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 ${
      checked ? 'bg-cyan-600' : 'bg-slate-700'
    }`}
  >
    <span
      className={`pointer-events-none block h-4 w-4 rounded-full bg-slate-100 shadow-lg ring-0 transition-transform ${
        checked ? 'translate-x-4' : 'translate-x-0'
      }`}
    />
  </button>
);

// --- Select Components (Compound) ---
const SelectContext = createContext<{
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

export const Select = ({ children, value, onValueChange }: { children?: React.ReactNode; value: string; onValueChange: (value: string) => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error("SelectTrigger must be used within Select");
  
  return (
    <button
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      className={`flex h-9 w-full items-center justify-between rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

export const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error("SelectValue must be used within Select");
  return <span>{ctx.value || placeholder}</span>;
};

export const SelectContent = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error("SelectContent must be used within Select");
  
  if (!ctx.open) return null;

  return (
    <div className={`absolute top-[calc(100%+4px)] z-50 w-full min-w-[8rem] overflow-hidden rounded-md border border-slate-700 bg-slate-900 text-slate-100 shadow-md animate-in fade-in-80 ${className}`}>
      <div className="p-1">{children}</div>
    </div>
  );
};

export const SelectItem = ({ children, value, className = '' }: { children?: React.ReactNode; value: string; className?: string }) => {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error("SelectItem must be used within Select");

  return (
    <div
      onClick={() => {
        ctx.onValueChange(value);
        ctx.setOpen(false);
      }}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-slate-800 focus:bg-slate-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        {ctx.value === value && <Check className="h-4 w-4" />}
      </span>
      <span className="truncate">{children}</span>
    </div>
  );
};