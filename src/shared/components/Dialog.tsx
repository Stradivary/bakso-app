import { Box, Drawer, Modal } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { PropsWithChildren } from "react";

export function Dialog({ opened, close, children }: PropsWithChildren<{ opened: boolean; close: () => void; }>) {

  const isMobile = useMediaQuery("(max-width: 768px)");

  if (!isMobile) {
    return <Modal opened={opened} onClose={close} size="sm" withCloseButton={false}>
      {children}
    </Modal>;
  }

  return <Drawer
    position="bottom"
    opened={opened}
    onClose={close}
    withCloseButton={false}
    withinPortal
    offset={8}
    styles={{
      content: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      },
    }}
  >
    <Box
      style={{
        width: 42,
        height: 4,
        background: "#DFE2E7",
        borderRadius: 8,
        flex: "none",
        order: 1,
        flexGrow: 0,
        margin: "16px auto 24px auto",
      }}>
    </Box>
    {children}

  </Drawer>;
}
