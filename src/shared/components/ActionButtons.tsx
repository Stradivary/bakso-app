import { Badge, Button, Flex, Group, Stack } from "@mantine/core";
import { LocateFixed, X } from "lucide-react";
import { PropsWithChildren } from "react";
import { Notification } from "../hooks/useNotification";
import { NotificationCenter } from "./NotificationCenter";

export type ActionButtonProps = PropsWithChildren<{
  onRecenter: () => void;
  onExit: () => void;
  role: string;
  notifications?: Notification[];
}>;

export const ActionButtons = ({
  onExit,
  onRecenter,
  role,
  children,
  notifications,
}: ActionButtonProps) => (
  <div
    style={{
      zIndex: 50,
      position: "absolute",
      top: 0,
      right: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      padding: 8,
    }}
  >
    <Flex direction="column" >
      <Stack m={16} style={{ flexGrow: 1 }} align="end">

        <Button onClick={onRecenter} variant="white" size="compact-lg" w={50}>
          <LocateFixed size={20} />
        </Button>
        <Button
          color="red"
          onClick={onExit}
          variant="white"
          size="compact-lg"
          w={50}
        >
          <X size={20} />
        </Button>
        {role === "seller" && <NotificationCenter notifications={notifications} />}

      </Stack>
      <Group justify="end" align="end" m={16}>

        <Badge color={role === "seller" ? "green" : "blue"}>
          {role === "seller" ? "Tukang Bakso" : "Customer"}
        </Badge>
        {children}
      </Group>
    </Flex>
  </div>
);
