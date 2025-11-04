import { Modal } from "./Modal";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/utils/formatting";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: "danger" | "success" | "warning";
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "warning",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}: ConfirmDialogProps) => {
  const iconMap = {
    danger: { icon: AlertTriangle, color: "text-red-600" },
    success: { icon: CheckCircle, color: "text-green-600" },
    warning: { icon: AlertCircle, color: "text-yellow-600" },
  };

  const buttonMap = {
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    warning: "bg-yellow-600 hover:bg-yellow-700 text-white",
  };

  const { icon: Icon, color } = iconMap[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex gap-4">
        <Icon className={cn("w-6 h-6 flex-shrink-0", color)} />
        <div className="flex-1">
          <p className="text-gray-700">{message}</p>
        </div>
      </div>

      <div className="flex gap-3 mt-8 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition-colors"
          disabled={isLoading}
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50",
            buttonMap[type],
          )}
          disabled={isLoading}
        >
          {isLoading ? "Please wait..." : confirmText}
        </button>
      </div>
    </Modal>
  );
};
