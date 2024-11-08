import { Modal, Title } from "@mantine/core";
import { useNetwork } from "@mantine/hooks";

export function OfflineHandler() {
  const { online } = useNetwork();
  return (
    <Modal
      title={
        <Title order={5} style={{ margin: 0 }}>
          Duh, Koneksi Internet Terputus!
        </Title>
      }
      opened={!online}
      onClose={() => {}}
      withCloseButton={false}
    >
      Sepertinya koneksi internet Anda terputus. Mohon periksa kembali koneksi
      internet Anda.
    </Modal>
  );
}
