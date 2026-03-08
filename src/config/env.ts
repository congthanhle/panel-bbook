const getRequiredEnv = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(
      `[Env Config] Missing required environment variable: ${key}`,
    );
  }
  return value;
};

export const ENV = {
  API_BASE_URL: getRequiredEnv("VITE_API_BASE_URL"),
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT ?? 30000),
  APP_NAME: import.meta.env.VITE_APP_NAME ?? "CourtOS",
  // Optional variables based on environment
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as
    | string
    | undefined,
} as const;
