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
  const { latitude, longitude, error: locationError, isLoading: locationLoading, requestLocation } = useRequestLocation();
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

    await login(data.name, data.role, latitude, longitude);

    // Redirect to home page
    navigate('/');
  };

  return {
    control,
    handleSubmit,
    handleAuth,
    errors,
    isValid,
    isSubmitting,
    locationError,
    locationLoading,
    requestLocation,
  };
};
