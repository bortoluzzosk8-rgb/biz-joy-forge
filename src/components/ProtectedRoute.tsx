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

  // Se exige apenas autenticação (não admin)
  if (requireAuth && !user) {
    return <Navigate to="/admin-login" replace />;
  }

  // Se requer admin e não é admin (e já terminou de verificar)
  if (requireAdmin && !isAdmin && !checkingAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  // Mantém children montados mesmo durante checkingAdmin
  // Isso preserva o estado dos formulários quando a sessão é revalidada
  return (
    <>
      {checkingAdmin && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      {children}
    </>
  );
};

export default ProtectedRoute;