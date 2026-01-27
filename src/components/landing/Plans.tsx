import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
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
    <section id="plans" className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">
          Escolha o plano ideal para você
        </h2>
        <p className="text-center text-muted-foreground mb-4 max-w-2xl mx-auto">
          Comece a organizar sua empresa de locação hoje mesmo.
        </p>
        <p className="text-center text-lg font-semibold text-primary mb-12">
          ✨ Teste grátis por 10 dias. Sem complicação.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${
                plan.highlighted
                  ? 'border-primary shadow-xl scale-105'
                  : 'border-border'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full">
                  Mais popular
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-6">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                </div>
                <ul className="space-y-3 text-left">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-primary hover:bg-primary/90'
                      : 'bg-accent hover:bg-accent/90'
                  }`}
                  onClick={() => navigate('/admin-login')}
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
