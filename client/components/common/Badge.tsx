import { cn } from "@/utils/formatting";

interface BadgeProps {
  label: string;
  status?:
    | "pending"
    | "completed"
    | "in-progress"
    | "paid"
    | "unpaid"
    | "occupied"
    | "empty"
    | "maintenance"
    | "urgent"
    | "high"
    | "medium"
    | "low"
    | "default";
  color?: string;
  className?: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
  completed: { bg: "bg-green-100", text: "text-green-800" },
  "in-progress": { bg: "bg-blue-100", text: "text-blue-800" },
  paid: { bg: "bg-green-100", text: "text-green-800" },
  unpaid: { bg: "bg-red-100", text: "text-red-800" },
  occupied: { bg: "bg-purple-100", text: "text-purple-800" },
  empty: { bg: "bg-gray-100", text: "text-gray-800" },
  maintenance: { bg: "bg-orange-100", text: "text-orange-800" },
  urgent: { bg: "bg-red-100", text: "text-red-800" },
  high: { bg: "bg-red-100", text: "text-red-800" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-800" },
  low: { bg: "bg-blue-100", text: "text-blue-800" },
  default: { bg: "bg-gray-100", text: "text-gray-800" },
};

export const Badge = ({
  label,
  status = "default",
  color,
  className,
}: BadgeProps) => {
  const colors = color ? { bg: "", text: color } : statusColors[status];

  return (
    <span
      className={cn(
        "inline-block px-3 py-1 rounded-full text-xs font-semibold",
        colors.bg,
        colors.text,
        className,
      )}
    >
      {label}
    </span>
  );
};
