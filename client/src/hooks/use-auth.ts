import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data, isLoading } = useQuery<{ authenticated: boolean } | null>({
    queryKey: ["/api/auth/check"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  return {
    authenticated: data?.authenticated ?? false,
    isLoading,
  };
}

export function useClientAuth() {
  const { data, isLoading } = useQuery<{ authenticated: boolean; weddingId: string | null } | null>({
    queryKey: ["/api/auth/client-check"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  return {
    authenticated: data?.authenticated ?? false,
    weddingId: data?.weddingId ?? null,
    isLoading,
  };
}
