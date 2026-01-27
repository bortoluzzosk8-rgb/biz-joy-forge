import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireAuth?: boolean;
};

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requireAuth = false 
}: ProtectedRouteProps) => {
  const { user, loading, isAdmin, checkingAdmin } = useAuth();

  // Loading inicial - ainda não tem sessão confirmada
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se exige admin
  if (requireAdmin) {
    // Se não tem usuário, vai para login
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    // Se ainda está verificando roles, mostra loading
    if (checkingAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    // Se verificou e não é admin, redireciona para home
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  // Se exige apenas autenticação (não admin)
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;