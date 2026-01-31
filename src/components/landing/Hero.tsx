import { useNavigate } from 'react-router-dom';
import { Check, MessageCircle, ArrowRight } from 'lucide-react';
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
    <section id="hero" className="pt-24 md:pt-32 pb-16 md:pb-24 bg-background pattern-dots relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Title */}
          <h1 className="font-inter text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in">
            <span className="text-foreground">Gestão completa para sua empresa de locação —</span>
            <span className="text-gradient-brand"> sem planilhas e sem bagunça.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            Controle itens, agenda, contratos e pagamentos em um só lugar.
            Simples de usar, rápido de implantar.
          </p>

          {/* Benefits List */}
          <ul className="mt-10 flex flex-wrap justify-center gap-4 md:gap-6">
            {benefits.map((benefit, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm md:text-base text-foreground bg-muted/50 px-4 py-2 rounded-full"
              >
                <Check className="w-5 h-5 text-secondary flex-shrink-0" />
                <span className="font-medium">{benefit}</span>
              </li>
            ))}
          </ul>

          {/* Reinforcement */}
          <p className="mt-10 text-lg font-semibold text-foreground font-inter">
            "Você tem a operação. Nós organizamos o controle."
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold hover-lift-strong group"
              onClick={() => navigate('/cadastro')}
            >
              Criar conta e testar grátis
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto px-8 py-6 text-lg border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground transition-all"
              onClick={() => navigate('/login')}
            >
              Entrar no sistema
            </Button>
          </div>

          {/* WhatsApp Link */}
          <button
            onClick={handleWhatsApp}
            className="mt-6 inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            <MessageCircle className="w-5 h-5" />
            Falar com suporte no WhatsApp
          </button>

          {/* Hero Image/Mockup */}
          <div className="mt-12 md:mt-16 relative">
            <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 rounded-3xl p-6 md:p-10 glow-secondary">
              <div className="bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
                <div className="bg-muted/30 px-4 py-3 border-b border-border/50 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary/80"></div>
                  <div className="w-3 h-3 rounded-full bg-secondary/80"></div>
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/40"></div>
                  <span className="ml-4 text-xs text-muted-foreground font-medium">PlayGestor - Sistema de Gestão</span>
                </div>
                <div className="p-6 md:p-8 space-y-4">
                  <div className="flex gap-4 items-center">
                    <div className="h-4 bg-gradient-to-r from-primary/20 to-transparent rounded w-1/2"></div>
                    <div className="h-8 w-24 bg-primary/10 rounded-lg"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">42</div>
                        <div className="text-xs text-muted-foreground">Itens</div>
                      </div>
                    </div>
                    <div className="h-24 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-secondary">18</div>
                        <div className="text-xs text-muted-foreground">Reservas</div>
                      </div>
                    </div>
                    <div className="h-24 bg-gradient-to-br from-muted to-muted/50 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">R$ 8.5k</div>
                        <div className="text-xs text-muted-foreground">Faturado</div>
                      </div>
                    </div>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-muted/80 via-muted/40 to-muted/80 rounded-xl mt-4 flex items-end p-4 gap-2">
                    {[40, 65, 45, 80, 60, 90, 70].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-primary to-secondary"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
