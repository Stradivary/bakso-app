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
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { useLoginViewModel } from "./useLoginViewModel";

export function LoginView() {
  const {
    control,
    isValid,
    handleSubmit,
    handleAuth,
    errors,
    isSubmitting,
    canJoin,
    setValue,
    handleOnChange,
  } = useLoginViewModel();

  const turnstileRef = useRef<TurnstileInstance>(null);

  const [token, setToken] = useState<string>();

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
            <input type="hidden" name="token" value={token} />
            <Controller
              name="name"
              control={control}
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
            <Turnstile
              ref={turnstileRef}
              siteKey="0x4AAAAAAA0a2jjKL7pnbfjV"
              options={{
                action: "submit-form",
                theme: "light",
                size: "flexible",

                language: "id",
              }}
              scriptOptions={{
                appendTo: "body",
                defer: true,
              }}
              onSuccess={(token) => {
                setToken(token);
                setValue("verified", true);
              }}
            />

            <Button
              fullWidth
              disabled={canJoin && isValid}
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
