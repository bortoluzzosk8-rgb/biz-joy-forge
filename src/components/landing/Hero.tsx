import { useNavigate } from 'react-router-dom';
import { Check, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const benefits = [
  'Controle de itens e disponibilidade',
  'Agenda de locações e entregas',
  'Contratos e comprovantes em 1 clique',
  'Financeiro: entradas, pendências e lucro',
];

interface HeroProps {
  whatsappNumber?: string;
}

export function Hero({ whatsappNumber = '5511999999999' }: HeroProps) {
  const navigate = useNavigate();

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Olá! Gostaria de saber mais sobre o sistema.');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <section id="hero" className="pt-24 md:pt-32 pb-16 md:pb-24 bg-gradient-to-b from-secondary/50 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight animate-fade-in">
            Gestão completa para sua empresa de locação —
            <span className="text-primary"> sem planilhas e sem bagunça.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Controle itens, agenda, contratos e pagamentos em um só lugar.
            Simples de usar, rápido de implantar.
          </p>

          {/* Benefits List */}
          <ul className="mt-8 flex flex-wrap justify-center gap-4 md:gap-6">
            {benefits.map((benefit, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm md:text-base text-foreground"
              >
                <Check className="w-5 h-5 text-accent flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          {/* Reinforcement */}
          <p className="mt-8 text-lg font-semibold text-foreground">
            "Você tem a operação. Nós organizamos o controle."
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-lg font-semibold"
              onClick={() => navigate('/admin-login')}
            >
              Criar conta e testar grátis
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto px-8 py-6 text-lg"
              onClick={() => navigate('/admin-login')}
            >
              Entrar no sistema (Login)
            </Button>
          </div>

          {/* WhatsApp Link */}
          <button
            onClick={handleWhatsApp}
            className="mt-6 inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
          >
            <MessageCircle className="w-5 h-5" />
            Falar com suporte no WhatsApp
          </button>

          {/* Hero Image/Mockup */}
          <div className="mt-12 md:mt-16 relative">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 md:p-8">
              <div className="bg-card rounded-xl shadow-2xl border border-border overflow-hidden">
                <div className="bg-secondary/50 px-4 py-3 border-b border-border flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent/60"></div>
                  <div className="w-3 h-3 rounded-full bg-primary/60"></div>
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/40"></div>
                </div>
                <div className="p-6 md:p-8 space-y-4">
                  <div className="h-4 bg-secondary rounded w-3/4"></div>
                  <div className="h-4 bg-secondary rounded w-1/2"></div>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg"></div>
                    <div className="h-20 bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg"></div>
                    <div className="h-20 bg-gradient-to-br from-secondary to-secondary/50 rounded-lg"></div>
                  </div>
                  <div className="h-32 bg-secondary/50 rounded-lg mt-4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
