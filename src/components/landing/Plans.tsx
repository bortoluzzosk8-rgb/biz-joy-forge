import { useNavigate } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const plans = [
  {
    name: 'Básico',
    price: 'Consulte',
    description: 'Para quem está começando',
    features: [
      'Cadastro de itens',
      'Agenda de locações',
      'Cadastro de clientes',
      'Contratos básicos',
      'Suporte por email',
    ],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 'Consulte',
    description: 'Para empresas em crescimento',
    features: [
      'Tudo do Básico',
      'Controle financeiro completo',
      'Relatórios avançados',
      'Contratos personalizados',
      'Suporte prioritário',
      'Integrações',
    ],
    highlighted: true,
  },
  {
    name: 'Multiusuário',
    price: 'Consulte',
    description: 'Para equipes maiores',
    features: [
      'Tudo do Pro',
      'Múltiplos usuários',
      'Controle de permissões',
      'Dashboard gerencial',
      'Suporte dedicado',
      'Onboarding personalizado',
    ],
    highlighted: false,
  },
];

export function Plans() {
  const navigate = useNavigate();

  return (
    <section id="plans" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="font-inter text-2xl md:text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">
          Escolha o <span className="text-gradient-brand">plano ideal</span> para você
        </h2>
        <p className="text-center text-muted-foreground mb-4 max-w-2xl mx-auto">
          Comece a organizar sua empresa de locação hoje mesmo.
        </p>
        <p className="text-center text-lg font-semibold text-secondary mb-12 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5" />
          Teste grátis por 10 dias. Sem complicação.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative rounded-3xl transition-all duration-300 hover-lift-strong ${
                plan.highlighted
                  ? 'border-secondary shadow-2xl scale-105 glow-secondary'
                  : 'border-border/50 hover:border-secondary/30'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold rounded-full shadow-lg">
                  Mais popular
                </div>
              )}
              <CardHeader className="text-center pb-4 pt-8">
                <CardTitle className="text-2xl font-inter">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-6">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground font-inter">{plan.price}</span>
                </div>
                <ul className="space-y-3 text-left">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-secondary" />
                      </div>
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pb-8">
                <Button
                  className={`w-full py-6 text-base font-semibold rounded-xl transition-all ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white'
                      : 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'
                  }`}
                  onClick={() => navigate('/cadastro')}
                >
                  Criar conta
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
