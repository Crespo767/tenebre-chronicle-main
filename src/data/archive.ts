export type ArchiveItem = {
  slug: string;
  title: string;
  type: string;
  discovered: string;
  description: string;
  link?: string;
};

export const archive: ArchiveItem[] = [
  {
    slug: "carta-do-padre-halbrecht",
    title: "Carta do Padre Halbrecht",
    type: "Carta",
    discovered: "Antes da partida de Alberetor",
    description:
      "Uma carta breve, escrita às pressas, recomendando que Sebastian busque a Irmã Maelia ao norte e desconfie de qualquer voz que prometa segurança rápida.",
  },
  {
    slug: "mapa-da-estrada-velha",
    title: "Mapa da Estrada Velha",
    type: "Mapa",
    discovered: "Sessão 01",
    description:
      "Mapa rasgado de pontos de água e abrigos ao longo da Estrada Velha de Alberetor. Algumas marcações foram riscadas em vermelho.",
  },
  {
    slug: "marca-espiralada-esboco",
    title: "Esboço da marca espiralada",
    type: "Imagem",
    discovered: "Sessão 03",
    description:
      "Desenho feito por Lysandra do símbolo em espiral encontrado no altar da Capela do Sol Quebrado.",
  },
  {
    slug: "lacre-do-carroceiro",
    title: "Lacre do carroceiro morto",
    type: "Documento",
    discovered: "Sessão 01",
    description:
      "Um lacre de cera com o símbolo de um ramo da Igreja do Sol, encontrado entre os pertences do carroceiro idoso falecido na primeira noite.",
  },
];
