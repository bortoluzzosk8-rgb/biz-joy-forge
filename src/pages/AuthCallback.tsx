import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[AuthCallback] Processing auth callback...');

        // Supabase client auto-detects code/tokens in URL hash/params
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[AuthCallback] Session error:', sessionError);
          setError(sessionError.message);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!session) {
          console.log('[AuthCallback] No session found, redirecting to login');
          navigate('/login');
          return;
        }

        console.log('[AuthCallback] Session found, assigning role...');

        // Assign franqueadora role if needed
        try {
          await supabase.functions.invoke('assign-franqueadora-role', {
            body: {
              user_id: session.user.id,
              name: session.user.user_metadata?.name || '',
              email: session.user.email || '',
            }
          });
          console.log('[AuthCallback] Role assigned successfully');
        } catch (roleError) {
          console.error('[AuthCallback] Role assignment error (non-blocking):', roleError);
        }

        // Small delay to let role propagate
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('[AuthCallback] Redirecting to admin...');
        navigate('/admin/rentals', { replace: true });
      } catch (err) {
        console.error('[AuthCallback] Unexpected error:', err);
        setError('Erro inesperado. Redirecionando...');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">
          {error || 'Confirmando sua conta...'}
        </p>
      </div>
    </div>
  );
}
