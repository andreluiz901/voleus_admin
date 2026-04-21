export const genderOptions = ["MALE", "FEMALE", "OTHER"] as const;

export type Gender = (typeof genderOptions)[number];

export function isGender(value: unknown): value is Gender {
  return typeof value === "string" && genderOptions.includes(value as Gender);
}

export function getGenderLabel(gender: Gender): string {
  switch (gender) {
    case "MALE":
      return "Masculino";
    case "FEMALE":
      return "Feminino";
    case "OTHER":
      return "Outro";
    default:
      return "Outro";
  }
}
