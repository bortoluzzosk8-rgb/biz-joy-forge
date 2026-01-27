import { X, Check } from 'lucide-react';

const beforeItems = [
  'Confusão nas reservas',
  'Retrabalho constante',
  'Erros frequentes',
  'Perda de dinheiro',
];

const afterItems = [
  'Visão clara do negócio',
  'Organização total',
  'Previsibilidade',
  'Escala sustentável',
];

export function BeforeAfter() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-foreground mb-12">
          A transformação que você precisa
        </h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Before */}
          <div className="p-8 rounded-2xl bg-accent/5 border border-accent/20">
            <h3 className="text-2xl font-bold text-accent mb-6 flex items-center gap-2">
              <X className="w-8 h-8" />
              ANTES
            </h3>
            <ul className="space-y-4">
              {beforeItems.map((item, index) => (
                <li key={index} className="flex items-center gap-3 text-foreground">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <X className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* After */}
          <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20">
            <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
              <Check className="w-8 h-8" />
              DEPOIS
            </h3>
            <ul className="space-y-4">
              {afterItems.map((item, index) => (
                <li key={index} className="flex items-center gap-3 text-foreground">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
