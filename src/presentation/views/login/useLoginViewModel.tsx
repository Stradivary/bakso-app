import { useRequestLocation } from "@/domain/use-cases/useRequestLocation";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/presentation/components/providers/authProvider";
import { FormData, loginSchema } from "@/data/models/LoginModel";

export const useLoginViewModel = () => {
  const navigate = useNavigate();
  const {
    latitude,
    longitude,
    error: locationError,
    isLoading: locationLoading,
    requestLocation,
  } = useRequestLocation();
  const { login } = useAuth();
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      role: "",
      name: "",
      agreed: false,
      verified: false,
    },
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const handleAuth = async (data: FormData) => {
    if (!data.verified) {
      setError("agreed", {
        message: "Tolong verifikasi bahwa Anda bukan robot",
      });
      return;
    }
    if (!data.agreed) {
      setError("agreed", {
        message: "Anda harus menyetujui pernyataan di atas",
      });
      return;
    }

    if (!latitude || !longitude) {
      requestLocation();
      return;
    }

    await login(data.name, data.role, latitude, longitude);

    // Redirect to home page
    navigate("/");
  };

  const handleOnChange = (
    onChange: (...event: unknown[]) => void,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onChange(e);
    if (e.target.checked) {
      requestLocation();
    }
  };

  const parsedError = {
    name: errors.name?.message ?? "",
    agreed: errors.agreed?.message ?? "",
    role: errors.role?.message ?? "",
    verified: errors.verified?.message ?? "",
  };

  const canJoin = !isValid || locationLoading;

  return {
    control,
    setValue,
    handleSubmit,
    handleAuth,
    errors: parsedError,
    isValid,
    isSubmitting,
    locationError,
    locationLoading,
    requestLocation,
    handleOnChange,
    canJoin,
  };
};
