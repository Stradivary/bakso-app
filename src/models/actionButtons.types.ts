import { Notification } from "./Notification.types";

export type ActionButtonProps = {
  onRecenter: () => void;
  onExit: () => void;
  role: string;
  name: string;
  notifications?: Notification[];
};
