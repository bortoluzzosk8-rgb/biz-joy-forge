import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type Franchise = {
  id: string;
  name: string;
  city: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isFranqueadora: boolean;
  isFranqueado: boolean;
  isVendedor: boolean;
  isMotorista: boolean;
  userFranchise: Franchise | null;
  checkingAdmin: boolean;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFranqueadora, setIsFranqueadora] = useState(false);
  const [isFranqueado, setIsFranqueado] = useState(false);
  const [isVendedor, setIsVendedor] = useState(false);
  const [isMotorista, setIsMotorista] = useState(false);
  const [userFranchise, setUserFranchise] = useState<Franchise | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  const checkAdminStatus = async (userId: string) => {
    setCheckingAdmin(true);
    try {
      // Verificar roles
      const [franqueadoraCheck, franqueadoCheck, adminCheck, vendedorCheck, motoristaCheck] = await Promise.all([
        supabase.rpc('has_role', { _user_id: userId, _role: 'franqueadora' }),
        supabase.rpc('has_role', { _user_id: userId, _role: 'franqueado' }),
        supabase.rpc('has_role', { _user_id: userId, _role: 'admin' }),
        supabase.rpc('has_role', { _user_id: userId, _role: 'vendedor' }),
        supabase.rpc('has_role', { _user_id: userId, _role: 'motorista' })
      ]);
      
      const isFranqueadoraRole = franqueadoraCheck.data || false;
      const isFranqueadoRole = franqueadoCheck.data || false;
      const isAdminRole = adminCheck.data || false;
      const isVendedorRole = vendedorCheck.data || false;
      const isMotoristaRole = motoristaCheck.data || false;
      
      setIsFranqueadora(isFranqueadoraRole);
      setIsFranqueado(isFranqueadoRole);
      setIsVendedor(isVendedorRole);
      setIsMotorista(isMotoristaRole);
      setIsAdmin(isAdminRole || isFranqueadoraRole || isFranqueadoRole || isVendedorRole || isMotoristaRole);
      
      // Buscar franchise do usuário (se franqueado ou motorista)
      if (isFranqueadoRole || isFranqueadoraRole) {
        const { data: franchiseData } = await supabase
          .from('user_franchises')
          .select('franchise_id, franchises(id, name, city)')
          .eq('user_id', userId)
          .single();
        
        if (franchiseData?.franchises) {
          setUserFranchise(franchiseData.franchises as any);
        }
      } else if (isMotoristaRole) {
        // Para motoristas, buscar a franchise da tabela drivers
        const { data: driverData } = await supabase
          .from('drivers')
          .select('franchise_id, franchise:franchises(id, name, city)')
          .eq('user_id', userId)
          .single();
        
        if (driverData?.franchise) {
          setUserFranchise(driverData.franchise as any);
        }
      } else {
        setUserFranchise(null);
      }
    } catch (err) {
      console.error('Erro ao verificar roles:', err);
      setIsAdmin(false);
      setIsFranqueadora(false);
      setIsFranqueado(false);
      setIsVendedor(false);
      setIsMotorista(false);
      setUserFranchise(null);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const refreshRoles = async () => {
    if (user) {
      await checkAdminStatus(user.id);
    }
  };

  useEffect(() => {

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer the admin check to avoid blocking
          setTimeout(() => {
            checkAdminStatus(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsVendedor(false);
          setIsMotorista(false);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
        setIsVendedor(false);
        setIsMotorista(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setIsFranqueadora(false);
    setIsFranqueado(false);
    setIsVendedor(false);
    setIsMotorista(false);
    setUserFranchise(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      isAdmin, 
      isFranqueadora, 
      isFranqueado, 
      isVendedor,
      isMotorista,
      userFranchise,
      checkingAdmin, 
      signOut,
      refreshRoles
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
