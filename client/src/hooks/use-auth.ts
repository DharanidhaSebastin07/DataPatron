import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface LocalUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

// ─── Guest mode (localStorage) ───────────────────────────────────────────────

export function getIsGuest(): boolean {
  try {
    return localStorage.getItem("dp_guest_mode") === "true";
  } catch {
    return false;
  }
}

export function setGuestMode(value: boolean) {
  try {
    if (value) {
      localStorage.setItem("dp_guest_mode", "true");
    } else {
      localStorage.removeItem("dp_guest_mode");
    }
  } catch { }
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function fetchUser(): Promise<LocalUser | null> {
  // If guest mode, don't even try to fetch the user
  if (getIsGuest()) return null;

  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });

  if (response.status === 401) return null;
  if (!response.ok) return null;
  return response.json();
}

async function apiLogin(email: string, password: string): Promise<LocalUser> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Login failed");
  }
  return res.json();
}

async function apiRegister(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<LocalUser> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ firstName, lastName, email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Registration failed");
  }
  return res.json();
}

async function apiLogout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<LocalUser | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiLogin(email, password),
    onSuccess: (user) => {
      setGuestMode(false);
      queryClient.setQueryData(["/api/auth/user"], user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({
      firstName,
      lastName,
      email,
      password,
    }: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }) => apiRegister(firstName, lastName, email, password),
    onSuccess: (user) => {
      setGuestMode(false);
      queryClient.setQueryData(["/api/auth/user"], user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: apiLogout,
    onSuccess: () => {
      setGuestMode(false);
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  const isGuest = getIsGuest();

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isGuest,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error?.message,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error?.message,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    // Helpers
    firstName: user?.firstName,
    lastName: user?.lastName,
    initials: user
      ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
      : isGuest
        ? "G"
        : "?",
  };
}
