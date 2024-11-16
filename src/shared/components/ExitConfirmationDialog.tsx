import { Stack, Center, Button, Text, Image } from "@mantine/core";

export function ExitConfirmationDialog({ role, handleExit, exitModalClose }: { role: string, handleExit: () => void; exitModalClose: () => void; }) {
  return <Stack>
    <Center>
      <Image src="/confirmation.png" alt="confirmation" w={100} h={100} />
    </Center>
    <Text ta="center">
      Dengan menutup halaman ini,
      {
        role === "seller"
          ? "Customer tidak akan bisa melihat lokasi Anda"
          : "anda akan keluar dari pantauan Tukang Bakso"
      }
    </Text>
    <Button onClick={handleExit} radius="lg" size="md">
      OK
    </Button>
    <Button onClick={exitModalClose} radius="lg" variant="outline">
      Batal
    </Button>
  </Stack>;
}
