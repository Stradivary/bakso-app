import { Box, Button, Checkbox, Container, Flex, Select, Text, TextInput, Title } from '@mantine/core';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../shared/hooks/useLocation';
import { authService, useAuth } from '../shared/services/authService';

import { Controller, useForm } from 'react-hook-form';

export const AuthPage: React.FC = () => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      role: '',
    }
  });
  const navigate = useNavigate();
  const { location } = useLocation();
  const { login } = useAuth();

  const handleAuth = async (data: { name: string; role: string; }) => {
    if (data.name && data.role && location) {
      const userData = await authService.registerOrLogin(data.name, data.role, location);
      login(userData);

      localStorage.setItem('role', data.role);
      navigate('/');
    }
  };

  return (
    <Flex style={{ height: "100dvh", alignItems: "center" }}>
      <Container size="xs" style={{ marginBlock: 'auto', textAlign: 'center' }}>
        <Box mb="md">
          <img src="/video.png" alt="Illustration" style={{ width: 150, margin: '0 auto' }} />
        </Box>
        <Title order={2}>Verifikasi</Title>
        <Text mt="sm" mb="lg">
          Masukkan nama dan role Anda di bawah ini:
        </Text>

        <form onSubmit={handleSubmit(handleAuth)}>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Nama is required' }}
            render={({ field }) => (
              <TextInput
                label="Nama"
                placeholder="Masukkan nama"
                mb="sm"
                required
                {...field}
                error={errors.name?.message}
              />
            )}
          />
          <Controller
            name="role"
            control={control}
            rules={{ required: 'Role is required' }}
            render={({ field }) => (
              <Select
                label="Role"
                placeholder="Masukkan role"
                mb="md"
                required
                data={[
                  { value: 'customer', label: 'Customer' },
                  { value: 'seller', label: 'Seller' },
                ]}
                {...field}
                error={errors.role?.message}
              />
            )}
          />

          <Button fullWidth color="red" size="md" radius={56} type="submit">
            Join
          </Button>
        </form>

        <Checkbox
          mt="lg"
          label="Dengan menggunakan aplikasi ini Anda telah setuju untuk membagikan lokasi Anda kepada para tukang Bakso Keliling."
          defaultChecked
        />
      </Container>
    </Flex>
  );
};

export default AuthPage;
