import { Notification } from "@/domain/use-cases/useNotification";

export type ActionButtonProps = {
  onRecenter: () => void;
  onExit: () => void;
  role: string;
  name: string;
  notifications?: Notification[];
};
