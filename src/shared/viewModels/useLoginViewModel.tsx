import { useAuth } from "@/shared/hooks/useAuth";
import { useRequestLocation } from "@/shared/hooks/useRequestLocation";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
interface FormData {
  role: string;
  name: string;
  agreed: boolean;
}

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
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      role: "",
      name: "",
      agreed: false,
    },
    mode: "onSubmit",
  });

  const handleAuth = async (data: FormData) => {
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
    onChange: (...event: any[]) => void,
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
  };
  const canJoin = !isValid || locationLoading;
  return {
    control,
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
