import { Notification } from "../hooks/useNotification";

export type ActionButtonProps = {
  onRecenter: () => void;
  onExit: () => void;
  role: string;
  name: string;
  notifications?: Notification[];
};