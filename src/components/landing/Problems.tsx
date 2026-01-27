import { CalendarX, Package, Wallet, Users, MessageSquare } from 'lucide-react';

const problems = [
  {
    icon: CalendarX,
    title: 'Reservas conflitantes',
    description: 'Dois clientes agendados para o mesmo item no mesmo dia.',
  },
  {
    icon: Package,
    title: 'Item some / ninguém sabe onde está',
    description: 'Estoque desorganizado gera perda de tempo e prejuízo.',
  },
  {
    icon: Wallet,
    title: 'Pagamentos pendentes esquecidos',
    description: 'Dinheiro que deveria entrar fica perdido em anotações.',
  },
  {
    icon: Users,
    title: 'Falta de histórico do cliente',
    description: 'Sem registro do que já foi alugado e quando.',
  },
  {
    icon: MessageSquare,
    title: 'Agenda espalhada em WhatsApp e planilha',
    description: 'Informações duplicadas e desatualizadas.',
  },
];

export function Problems() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">
          O caos do dia a dia <span className="text-accent">sem sistema</span>
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Reconhece algum desses problemas? Você não está sozinho.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="p-6 bg-card rounded-xl border border-border hover:border-accent/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <problem.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{problem.title}</h3>
              <p className="text-muted-foreground text-sm">{problem.description}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-xl md:text-2xl font-semibold text-foreground">
          "Sem um sistema, o <span className="text-accent">prejuízo cresce no silêncio.</span>"
        </p>
      </div>
    </section>
  );
}
