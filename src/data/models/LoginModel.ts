import { z } from "zod";

export interface FormData {
  role: string;
  name: string;
  agreed: boolean;
  verified: boolean;
}

export const loginSchema = z.object({
  role: z.string({
    required_error: "Anda harus memilih diantara customer atau Tukang Bakso",
  }),
  name: z
    .string({
      required_error: "nama harus di isi",
    })
    .min(3, "Nama harus lebih dari 3 karakter")
    .max(60, "Nama harus kurang dari 60 karakter"),
  agreed: z.boolean({
    required_error: "Anda harus menyetujui pernyataan di atas",
  }).refine((x) => x, 'Anda harus menyetujui pernyataan di atas'),
  verified: z.boolean()
});
