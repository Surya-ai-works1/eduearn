export type PasswordStrength = {
  score: number;
  label: "Weak" | "Fair" | "Good" | "Strong";
  description: string;
};

const strengthChecks = [
  (password: string) => password.length >= 8,
  (password: string) => /[A-Z]/.test(password),
  (password: string) => /[a-z]/.test(password),
  (password: string) => /\d/.test(password),
  (password: string) => /[^A-Za-z0-9]/.test(password),
];

export function getPasswordStrength(password: string): PasswordStrength {
  const passedChecks = strengthChecks.filter((check) => check(password)).length;
  const score = password.length === 0 ? 0 : Math.min(100, passedChecks * 20);

  if (score >= 80) {
    return {
      score,
      label: "Strong",
      description: "Excellent protection for your EduEarn account.",
    };
  }

  if (score >= 60) {
    return {
      score,
      label: "Good",
      description: "Add a symbol or more length to make it stronger.",
    };
  }

  if (score >= 40) {
    return {
      score,
      label: "Fair",
      description: "Use mixed case, numbers, and symbols.",
    };
  }

  return {
    score,
    label: "Weak",
    description: "Use at least 8 characters with variety.",
  };
}
