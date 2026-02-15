import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";

type AppRole = Database["public"]["Enums"]["app_role"];

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, roles, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.some((r) => roles.includes(r));
    if (!hasAccess) {
      // Redirect to the appropriate dashboard based on role
      if (roles.includes("super_admin")) return <Navigate to="/admin/dashboard" replace />;
      if (roles.includes("hospital_admin") || roles.includes("doctor") || roles.includes("staff"))
        return <Navigate to="/hospital/dashboard" replace />;
      return <Navigate to="/family/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
