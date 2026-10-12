export type DigestFrequency = "daily" | "weekly" | "never";

export type Preferences = {
  // Appearance
  accentColor: string;
  radius: number;
  fontSize: number;
  compact: boolean;
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  mentionsOnly: boolean;
  digest: DigestFrequency;
  /** Hours of the day (0–24) during which notifications are delivered. */
  deliveryHours: [number, number];
  // Accessibility
  reduceMotion: boolean;
  underlineLinks: boolean;
  highContrast: boolean;
};

export const defaultPreferences: Preferences = {
  accentColor: "#4c6ef5",
  radius: 8,
  fontSize: 14,
  compact: false,
  emailNotifications: true,
  pushNotifications: false,
  mentionsOnly: false,
  digest: "weekly",
  deliveryHours: [8, 20],
  reduceMotion: false,
  underlineLinks: false,
  highContrast: false,
};

export const accentSwatches = [
  "#4c6ef5",
  "#228be6",
  "#15aabf",
  "#12b886",
  "#40c057",
  "#fab005",
  "#fd7e14",
  "#fa5252",
  "#e64980",
  "#7950f2",
];

export const PREFERENCES_KEY = "settings:preferences";

/** Merges stored JSON over defaults so new fields survive older saved data. */
export function deserializePreferences(raw: string | undefined): Preferences {
  if (!raw) return defaultPreferences;
  try {
    return { ...defaultPreferences, ...JSON.parse(raw) };
  } catch {
    return defaultPreferences;
  }
}

export const formatHour = (hour: number) => `${hour.toString().padStart(2, "0")}:00`;
