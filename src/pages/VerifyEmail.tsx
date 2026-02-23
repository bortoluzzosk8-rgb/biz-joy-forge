import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import logoPlayGestor from '@/assets/logo-playgestor-novo.png';

export default function VerifyEmail() {
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const email = location.state?.email || '';

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "E-mail não encontrado",
        description: "Por favor, faça o cadastro novamente.",
        variant: "destructive",
      });
      navigate('/cadastro');
      return;
    }

    setResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });

      if (error) {
        toast({
          title: "Erro ao reenviar",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setCooldown(60);
        toast({
          title: "E-mail reenviado!",
          description: "Verifique sua caixa de entrada e spam.",
        });
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível reenviar o e-mail. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

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
            <CardTitle className="text-2xl font-bold">Verifique seu E-mail</CardTitle>
            <CardDescription className="text-base">
              Enviamos um link de confirmação para:
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            {email && (
              <p className="font-medium text-lg text-foreground bg-muted px-4 py-2 rounded-lg">
                {email}
              </p>
            )}
            
            <div className="space-y-3 text-muted-foreground">
              <p>
                Por favor, acesse seu e-mail e clique no link de confirmação para ativar sua conta.
              </p>
              <p className="text-sm">
                O link expira em 24 horas.
              </p>
            </div>

            <div className="bg-muted border border-border rounded-lg p-4 text-sm text-muted-foreground">
              <strong>Não recebeu o e-mail?</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Verifique sua caixa de <strong>spam</strong> ou <strong>lixo eletrônico</strong></li>
                <li>Verifique a aba <strong>Promoções</strong> (Gmail)</li>
                <li>Aguarde até 2 minutos para o e-mail chegar</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button 
              onClick={handleResendEmail} 
              variant="outline" 
              className="w-full"
              disabled={resending || !email || cooldown > 0}
            >
              {resending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Reenviando...
                </>
              ) : cooldown > 0 ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Aguarde {cooldown}s
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reenviar e-mail
                </>
              )}
            </Button>

            <Link to="/cadastro" className="w-full">
              <Button variant="ghost" className="w-full">
                Usar outro e-mail
              </Button>
            </Link>

            <div className="text-center text-sm text-muted-foreground">
              Já confirmou?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Fazer login
              </Link>
            </div>
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
