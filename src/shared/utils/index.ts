export const generatePassword = (name: string, role: string): string => {
  const combined = `${name.toLowerCase()}_${role}`;
  return Buffer.from(combined).toString("base64");
};

export const generateEmail = (
  name: string,
  role: string,
  latitude: number,
  longitude: number,
): string => {
  const sanitizedName = name.replace(/\s/g, "_");
  return `${sanitizedName.toLowerCase()}_${latitude.toFixed(4)}_${longitude.toFixed(4)}_${role}@bakso.local`;
};
