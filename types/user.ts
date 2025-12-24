import { UserRole } from "./auth";

export type PublicUser = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
};

export type AuthUser = PublicUser & {
  password: string; // 🔐 AUTH ONLY
};
