import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Building2, ArrowLeft, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { toast } from "sonner";

const ChoosePlan = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { subscriptionStatus } = useSubscriptionStatus(user?.id);

  const handleSelectPlan = (planName: string) => {
    // Por enquanto, apenas mostra uma mensagem
    // Futuramente integrar com Stripe ou outro gateway
    toast.info(`Entre em contato para contratar o plano ${planName}`, {
      description: "Nossa equipe entrará em contato para finalizar sua assinatura.",
      duration: 5000
    });
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const plans = [
    {
      name: "Básico",
      price: "R$ 197",
      period: "/mês",
      description: "Para quem está começando",
      icon: Zap,
      features: [
        "1 unidade",
        "Até 3 usuários",
        "Gestão de locações",
        "Controle de estoque",
        "Relatórios básicos",
        "Suporte por email"
      ],
      highlighted: false,
      color: "border-border"
    },
    {
      name: "Profissional",
      price: "R$ 297",
      period: "/mês",
      description: "Mais popular",
      icon: Crown,
      features: [
        "3 unidades",
        "Até 10 usuários",
        "Tudo do Básico",
        "Gestão financeira completa",
        "Logística integrada",
        "Relatórios avançados",
        "Suporte prioritário"
      ],
      highlighted: true,
      color: "border-primary"
    },
    {
      name: "Multi-Unidades",
      price: "R$ 497",
      period: "/mês",
      description: "Para redes maiores",
      icon: Building2,
      features: [
        "Unidades ilimitadas",
        "Usuários ilimitados",
        "Tudo do Profissional",
        "Dashboard consolidado",
        "API de integração",
        "Gerente de conta dedicado",
        "Onboarding personalizado"
      ],
      highlighted: false,
      color: "border-border"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Escolher Plano</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Status Banner */}
        {subscriptionStatus?.status === 'expired' && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 text-destructive">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Seu período de teste expirou</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Escolha um plano abaixo para continuar usando o sistema.
            </p>
          </div>
        )}

        {subscriptionStatus?.status === 'trial' && subscriptionStatus.trialDaysLeft !== null && (
          <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
              <span className="font-medium">
                {subscriptionStatus.trialDaysLeft > 0 
                  ? `Você tem ${subscriptionStatus.trialDaysLeft} dias restantes no período de teste`
                  : 'Seu período de teste expira hoje'}
              </span>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Escolha o plano ideal para você</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Todos os planos incluem atualizações gratuitas e suporte técnico.
            Você pode mudar de plano a qualquer momento.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.name} 
                className={`relative flex flex-col ${plan.highlighted ? 'border-2 border-primary shadow-lg scale-105' : ''}`}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                    Mais Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto mb-4 p-3 rounded-full ${plan.highlighted ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon className={`h-8 w-8 ${plan.highlighted ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className={`h-4 w-4 ${plan.highlighted ? 'text-primary' : 'text-green-500'}`} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={plan.highlighted ? "default" : "outline"}
                    onClick={() => handleSelectPlan(plan.name)}
                  >
                    Escolher {plan.name}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Contact Info */}
        <div className="text-center mt-12 text-muted-foreground">
          <p>Precisa de ajuda para escolher? Entre em contato conosco.</p>
          <p className="mt-2">
            <a href="mailto:contato@playgestor.com" className="text-primary hover:underline">
              contato@playgestor.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default ChoosePlan;
