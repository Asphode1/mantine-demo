export type OnboardingValues = {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role: string | null;
  teamSize: string | null;
  interests: string[];
  plan: string;
};

export const initialValues: OnboardingValues = {
  email: "",
  password: "",
  confirmPassword: "",
  fullName: "",
  role: null,
  teamSize: null,
  interests: [],
  plan: "team",
};

export const roleOptions = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Operations",
  "Founder",
];

export const teamSizeOptions = [
  { value: "1", label: "Just me" },
  { value: "2-10", label: "2–10 people" },
  { value: "11-50", label: "11–50 people" },
  { value: "51+", label: "51+ people" },
];

export const interestOptions = [
  "Dashboards",
  "Forms",
  "Data tables",
  "Charts",
  "Notifications",
  "Theming",
  "Accessibility",
  "Animations",
];

export const MAX_INTERESTS = 4;

export const planOptions = [
  { value: "free", label: "Free", description: "For personal projects" },
  { value: "team", label: "Team", description: "$12 per seat / month" },
  { value: "enterprise", label: "Enterprise", description: "SSO, audit logs, SLA" },
];

export const passwordRequirements = [
  { re: /[0-9]/, label: "Includes a number" },
  { re: /[a-z]/, label: "Includes a lowercase letter" },
  { re: /[A-Z]/, label: "Includes an uppercase letter" },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "Includes a special symbol" },
];

export const MIN_PASSWORD_LENGTH = 8;

/** 0–100 score: length counts as one requirement alongside the regex checks. */
export function passwordStrength(password: string): number {
  const checks = [
    password.length >= MIN_PASSWORD_LENGTH,
    ...passwordRequirements.map((r) => r.re.test(password)),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
