import { cn } from "@/lib/utils";

interface CharacterCountProps {
  value: string;
  max: number;
  className?: string;
}

export function CharacterCount({ value, max, className }: CharacterCountProps) {
  const remaining = max - value.length;

  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        remaining < 0 ? "text-destructive" : "text-muted-foreground",
        className
      )}
    >
      {value.length}/{max}
    </span>
  );
}
