export type Rumor = {
  slug: string;
  title: string;
  origin: string;
  confidence: "Baixa" | "Média" | "Alta";
  status: "Não investigado" | "Investigado" | "Falso" | "Confirmado";
  text: string;
};

export const rumors: Rumor[] = [
  {
    slug: "a-capela-que-sangra",
    title: "A capela que sangra",
    origin: "Peregrino na estrada de Thistle Hold",
    confidence: "Média",
    status: "Não investigado",
    text: "Dizem que numa capela abandonada ao norte, as paredes choram um líquido escuro nas noites de lua nova.",
  },
  {
    slug: "o-cavaleiro-sem-rosto",
    title: "O cavaleiro sem rosto",
    origin: "Soldado embriagado em Kasta",
    confidence: "Baixa",
    status: "Não investigado",
    text: "Um cavaleiro de armadura enegrecida foi visto rondando os limites de Davokar, sempre ao crepúsculo, sem nunca dizer palavra.",
  },
  {
    slug: "marca-espiralada",
    title: "A marca espiralada",
    origin: "Observação direta da caravana",
    confidence: "Alta",
    status: "Investigado",
    text: "Um símbolo em espiral queimado em madeira e pedra começa a aparecer ao longo da estrada. Ninguém admite tê-lo desenhado.",
  },
  {
    slug: "a-promessa-do-padre-halbrecht",
    title: "A promessa do Padre Halbrecht",
    origin: "Sonho de Sebastian",
    confidence: "Média",
    status: "Não investigado",
    text: "Dizem que o velho padre ainda caminha — e que prometeu encontrar Sebastian antes do primeiro degelo.",
  },
];
