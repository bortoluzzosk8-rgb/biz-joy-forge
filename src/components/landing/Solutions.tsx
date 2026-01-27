import { Package, Calendar, FileText, DollarSign, UserCheck, Settings } from 'lucide-react';

const solutions = [
  {
    icon: Package,
    title: 'Estoque e disponibilidade',
    description: 'Saiba exatamente o que está disponível, reservado ou em manutenção.',
  },
  {
    icon: Calendar,
    title: 'Agenda e reservas',
    description: 'Visualize todas as locações em um calendário simples e intuitivo.',
  },
  {
    icon: FileText,
    title: 'Contratos digitais',
    description: 'Gere contratos e comprovantes com um clique. Sem papel, sem bagunça.',
  },
  {
    icon: DollarSign,
    title: 'Financeiro e pendências',
    description: 'Controle entradas, saídas e pagamentos pendentes em tempo real.',
  },
  {
    icon: UserCheck,
    title: 'Cadastro de clientes',
    description: 'Histórico completo de cada cliente: locações, pagamentos e preferências.',
  },
  {
    icon: Settings,
    title: 'Manutenção e checagem',
    description: 'Registre o estado dos itens na entrada e saída de cada locação.',
  },
];

export function Solutions() {
  return (
    <section id="features" className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">
          Como o <span className="text-primary">sistema</span> resolve
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Todas as ferramentas que você precisa para organizar sua operação.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="p-6 bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-primary/10 transition-colors">
                <solution.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{solution.title}</h3>
              <p className="text-muted-foreground">{solution.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
