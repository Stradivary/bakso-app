import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, useAuth } from '../services/authService';
import { useLocation } from '../hooks/useLocation';
import { Button, TextInput, Select, Box, Checkbox, Container, Title, Text, Flex } from '@mantine/core';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'seller' | ''>('');
  const navigate = useNavigate();
  const { location } = useLocation();
  const { login } = useAuth();

  const handleAuth = async () => {
    if (name && role && location) {
      const userData = await authService.registerOrLogin(name, role, location);
      login(userData);
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

        <TextInput label="Nama" placeholder="Masukkan nama" mb="sm" required value={name} onChange={(e) => setName(e.currentTarget.value)} />
        <Select label="Role" placeholder="Masukkan role" mb="md" required
          onChange={(value) => setRole(value as 'customer' | 'seller')}
          data={[
            { value: 'customer', label: 'Customer' },
            { value: 'seller', label: 'Seller' },
          ]} />

        <Button fullWidth color="red" size="md" radius={56} onClick={handleAuth}>
          Join
        </Button>

        <Checkbox
          mt="lg"
          label="Dengan menggunakan aplikasi ini Anda telah setuju untuk membagikan lokasi Anda kepada para tukang Bakso Keliling."
          defaultChecked
        />
      </Container>
    </Flex>
  );
};

export default Register;
