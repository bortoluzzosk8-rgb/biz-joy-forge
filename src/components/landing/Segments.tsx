import { PartyPopper, Sofa, Wrench, Monitor, Dumbbell, HardHat } from 'lucide-react';

const segments = [
  { icon: PartyPopper, label: 'Festas e eventos' },
  { icon: Sofa, label: 'Móveis e utilidades' },
  { icon: Wrench, label: 'Equipamentos e ferramentas' },
  { icon: Monitor, label: 'Tecnologia e audiovisual' },
  { icon: Dumbbell, label: 'Esporte e lazer' },
  { icon: HardHat, label: 'Construção e manutenção' },
];

export function Segments() {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-foreground mb-12">
          Funciona para empresas de locação de{' '}
          <span className="text-primary">diversos segmentos</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {segments.map((segment, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <segment.icon className="w-7 h-7 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{segment.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
