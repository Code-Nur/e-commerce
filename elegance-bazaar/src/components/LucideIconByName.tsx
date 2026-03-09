import type { ComponentType } from "react";
import * as LucideIcons from "lucide-react";
import { Shapes } from "lucide-react";

interface LucideIconByNameProps {
  name: string;
  size?: number;
  className?: string;
}

type LucideIconComponent = ComponentType<{ size?: number; className?: string }>;

const iconMap = LucideIcons as unknown as Record<string, LucideIconComponent>;

const LucideIconByName = ({ name, size = 20, className }: LucideIconByNameProps) => {
  const Icon = iconMap[name] ?? Shapes;
  return <Icon size={size} className={className} />;
};

export default LucideIconByName;
