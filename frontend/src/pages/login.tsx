import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { AlertCircle } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';
import { useLocation } from '../shared/hooks/useLocation';

interface FormData {
  role: string;
  name: string;
  agreed: boolean;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { latitude, longitude, error: locationError, isLoading: locationLoading, requestLocation } = useLocation();
  const { login } = useAuth();
  const {
    control, handleSubmit, setError, formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      role: '',
      name: '',
      agreed: false,
    },
    mode: 'onSubmit',
  });


  const handleAuth = async (data: FormData) => {
    if (!data.agreed) {
      setError('agreed', {
        message: 'Anda harus menyetujui pernyataan di atas',
      });
      return;
    }

    if (!latitude || !longitude) {
      requestLocation();
      return;
    }


    await login(
      data.name,
      data.role,
      latitude,
      longitude
    );


    // Redirect to home page
    navigate('/');

  };


  return (
    <Flex style={{ height: '100dvh', alignItems: 'center', bg: "#EFF1F4" }}>
      <Container size="xs" style={{ marginBlock: 'auto', textAlign: 'center' }}>
        <Box mb="md">
          <img
            src="/video.png"
            alt="Illustration"
            style={{ width: 150, margin: '0 auto' }} />
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

        <form onSubmit={handleSubmit(handleAuth)} style={{ textAlign: 'start' }}>
          <Stack gap={16}>
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

export default LoginPage;