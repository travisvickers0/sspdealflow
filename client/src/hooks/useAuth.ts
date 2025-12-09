import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

const ADMIN_EMAILS = ["travisvickers0@gmail.com", "dustin@sspiproperties.com"];

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.email ? ADMIN_EMAILS.includes(user.email) : false,
    error,
  };
}
