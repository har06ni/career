import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { ReactNode, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

export function ProtectedRoute({ children, allowedRoles }: { children: ReactNode, allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    } else if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      setLocation(`/${user.role}/dashboard`);
    }
  }, [user, isLoading, allowedRoles, setLocation]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
