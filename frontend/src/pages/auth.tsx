import {
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  Select,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "../shared/hooks/useLocation";
import { authService } from "../shared/services/authService";

import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@/shared/contexts/useAuth";

export const AuthPage: React.FC = () => {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      role: "",
      agreed: false,
    },
    mode: "onSubmit",
  });

  const navigate = useNavigate();
  const { location } = useLocation();
  const { login } = useAuth();

  const handleAuth = async (data: {
    name: string;
    role: string;
    agreed: boolean;
  }) => {
    if (!data.agreed) {
      setError("agreed", {
        message: "Anda harus menyetujui pernyataan di atas",
      });
      return;
    }

    if (data.name && data.role && location) {
      const userData = await authService.registerOrLogin(
        data.name,
        data.role,
        location,
      );
      login(userData);

      sessionStorage.setItem("role", data.role);
      navigate("/");
    }
  };

  return (
    <Flex style={{ height: "100dvh", alignItems: "center" }}>
      <Container size="xs" style={{ marginBlock: "auto", textAlign: "center" }}>
        <Box mb="md">
          <img
            src="/video.png"
            alt="Illustration"
            style={{ width: 150, margin: "0 auto" }}
          />
        </Box>
        <Title order={2}>Verifikasi</Title>
        <Text mt="sm" mb="lg">
          Masukkan nama dan role Anda di bawah ini:
        </Text>

        <form
          onSubmit={handleSubmit(handleAuth)}
          style={{ textAlign: "start" }}
        >
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
                mb="sm"
                {...field}
                error={errors.name?.message}
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
                mb="md"
                data={[
                  { value: "customer", label: "Customer" },
                  { value: "seller", label: "Tukang Bakso" },
                ]}
                {...field}
                error={errors.role?.message}
              />
            )}
          />

          <Button
            fullWidth
            disabled={!isValid}
            color="red"
            size="md"
            radius={56}
            type="submit"
            loading={isSubmitting}
          >
            Join
          </Button>
          <Controller
            name="agreed"
            control={control}
            rules={{ required: "Anda harus menyetujui pernyataan di atas" }}
            render={({ field: { value, onChange, ...fld } }) => (
              <Checkbox
                mt="lg"
                label="Dengan menggunakan aplikasi ini Anda telah setuju untuk membagikan lokasi Anda kepada para tukang Bakso Keliling."
                checked={value}
                onChange={onChange}
                {...fld}
                error={errors.agreed?.message}
              />
            )}
          />
        </form>
      </Container>
    </Flex>
  );
};

export default AuthPage;
