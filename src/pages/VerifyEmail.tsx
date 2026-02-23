import { useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft } from 'lucide-react';
import logoPlayGestor from '@/assets/logo-playgestor-novo.png';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = location.state?.email || searchParams.get('email') || '';

  // Se o usuário já tem sessão, redirecionar direto
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/admin/rentals', { replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img src={logoPlayGestor} alt="PlayGestor" className="h-16" />
          </Link>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Conta criada!</CardTitle>
            <CardDescription className="text-base">
              Sua conta foi criada com sucesso.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            {email && (
              <p className="font-medium text-lg text-foreground bg-muted px-4 py-2 rounded-lg">
                {email}
              </p>
            )}
            
            <p className="text-muted-foreground">
              Você já pode acessar o sistema com suas credenciais.
            </p>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Link to="/login" state={{ email }} className="w-full">
              <Button className="w-full">
                Fazer login
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  );
}
