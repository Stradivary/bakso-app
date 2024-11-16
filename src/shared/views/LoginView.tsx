import {
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  Image,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Controller } from "react-hook-form";
import { useLoginViewModel } from "../viewModels/useLoginViewModel";

export function LoginView() {
  const {
    control,
    handleSubmit,
    handleAuth,
    errors,
    isSubmitting,
    canJoin,
    handleOnChange,
  } = useLoginViewModel();

  return (
    <Flex h="100dvh" align="center" bg="#EFF1F4">
      <Container size="xs" mx="auto" ta="center">
        <Box mb="md">
          <Image w={150} mx="auto" src="/video.png" alt="Illustration" />
        </Box>
        <Title order={2}>Verifikasi</Title>
        <Text mt="sm" mb="lg">
          Masukkan nama dan role Anda di bawah ini:
        </Text>

        <form onSubmit={handleSubmit(handleAuth)}>
          <Stack gap={16} ta="start">
            <Controller
              name="name"
              control={control}
              rules={{
                required: "Nama anda dibutuhkan",
                maxLength: { value: 60, message: "Nama anda terlalu panjang" },
              }}
              render={({ field }) => (
                <TextInput
                  label="Nama"
                  placeholder="Masukkan nama"
                  {...field}
                  error={errors.name}
                />
              )}
            />

            <Controller
              name="role"
              control={control}
              rules={{
                required:
                  "Anda harus memilih diantara customer atau Tukang Bakso",
              }}
              render={({ field }) => (
                <Select
                  label="Role"
                  placeholder="Masukkan role"
                  rightSection={<></>}
                  data={[
                    { value: "buyer", label: "Pelanggan" },
                    { value: "seller", label: "Tukang Bakso" },
                  ]}
                  {...field}
                  error={errors.role}
                />
              )}
            />

            <Controller
              name="agreed"
              control={control}
              rules={{ required: "Anda harus menyetujui pernyataan di atas" }}
              render={({ field: { value, onChange, ...fld } }) => (
                <Checkbox
                  label="Dengan menggunakan aplikasi ini Anda telah setuju untuk membagikan lokasi Anda kepada para tukang Bakso Keliling."
                  checked={value}
                  color="secondary.9"
                  onChange={(e) => handleOnChange(onChange, e)}
                  {...fld}
                  error={errors.agreed}
                />
              )}
            />

            <Button
              fullWidth
              disabled={canJoin}
              color="red"
              size="md"
              radius={56}
              type="submit"
              loading={isSubmitting}
            >
              Join
            </Button>
          </Stack>
        </form>
      </Container>
    </Flex>
  );
}

export default LoginView;
