import {
  Alert,
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
} from '@mantine/core';
import { AlertCircle } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { useLoginViewModel } from '../viewModels/useLoginViewModel';


export function LoginView() {
  const {
    control,
    handleSubmit,
    handleAuth,
    errors,
    isValid,
    isSubmitting,
    locationError,
    locationLoading,
    requestLocation,
  } = useLoginViewModel();

  return (
    <Flex h="100dvh" align="center" bg="#EFF1F4"  >
      <Container size="xs" mx="auto" ta="center">
        <Box mb="md">
          <Image w={150} mx="auto"
            src="/video.png"
            alt="Illustration" />
        </Box>
        <Title order={2}>Verifikasi</Title>
        <Text mt="sm" mb="lg">
          Masukkan nama dan role Anda di bawah ini:
        </Text>

        {locationError && (
          <Alert icon={<AlertCircle size={16} />} color="red" mb="md">
            Error: {locationError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleAuth)}  >
          <Stack gap={16} ta="start">
            <Controller
              name="name"
              control={control}
              rules={{
                required: 'Nama anda dibutuhkan',
                maxLength: { value: 60, message: 'Nama anda terlalu panjang' },
              }}
              render={({ field }) => (
                <TextInput
                  label="Nama"
                  placeholder="Masukkan nama"
                  {...field}
                  error={errors.name?.message} />
              )} />

            <Controller
              name="role"
              control={control}
              rules={{
                required: 'Anda harus memilih diantara customer atau Tukang Bakso',
              }}
              render={({ field }) => (
                <Select
                  label="Role"
                  placeholder="Masukkan role"
                  rightSection={<></>}
                  data={[
                    { value: 'buyer', label: 'Pelanggan' },
                    { value: 'seller', label: 'Tukang Bakso' },
                  ]}
                  {...field}
                  error={errors.role?.message} />
              )} />

            <Controller
              name="agreed"
              control={control}
              rules={{ required: 'Anda harus menyetujui pernyataan di atas' }}
              render={({ field: { value, onChange, ...fld } }) => (
                <Checkbox
                  label="Dengan menggunakan aplikasi ini Anda telah setuju untuk membagikan lokasi Anda kepada para tukang Bakso Keliling."
                  checked={value}
                  color='secondary.9'
                  onChange={(e) => {
                    onChange(e);
                    if (e.target.checked) {
                      requestLocation();
                    }
                  }}
                  {...fld}
                  error={errors.agreed?.message} />
              )} />

            <Button
              fullWidth
              disabled={!isValid || locationLoading}
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