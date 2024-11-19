import { Badge, Box, Button, Flex, Group, Stack } from "@mantine/core";
import { LocateFixed, X } from "lucide-react";
import { NotificationCenter } from "./NotificationCenter";
import { ActionButtonProps } from "../models/actionButtons.types";

export const ActionButtons = ({
  onExit,
  onRecenter,
  role,
  name,
  notifications,
}: ActionButtonProps) => (
  <Box
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
    <Flex direction="row">
      <Group justify="end" align="start" m={8} gap={6} style={{
        userSelect: 'none',
        pointerEvents: 'painted'
      }}>
        <Badge color={role === "seller" ? "green" : "blue"}>
          {role === "seller" ? "Tukang Bakso" : "Customer"}
        </Badge>
        <Badge variant="filled" color="teal">
          {name}
        </Badge>
      </Group>
      <Stack m={8} style={{ flexGrow: 1 }} align="end">
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
        {role === "seller" && (
          <NotificationCenter notifications={notifications} />
        )}
      </Stack>

    </Flex>
  </Box>
);
