export type Session = {
  slug: string;
  number: number;
  title: string;
  date: string;
  present: string[];
  summary: string;
  events: string[];
  npcs: string[];
  locations: string[];
  consequences: string[];
  hooks: string[];
  masterNotes: string;
};

export const sessions: Session[] = [
  {
    slug: "sessao-01-a-estrada-sob-a-neve",
    number: 1,
    title: "A Estrada Sob a Neve",
    date: "Inverno, primeiro mês da travessia",
    present: ["Sebastian Valerius", "Lysandra Verdan"],
    summary:
      "A caravana de refugiados deixa para trás as cinzas de Alberetor e enfrenta a primeira noite de inverno aberto. Lobos rondam a estrada, e um velho carroceiro morre antes do amanhecer.",
    events: [
      "A caravana parte ao entardecer e perde uma carroça num desbarrancado.",
      "Sebastian conduz uma oração coletiva ao redor da fogueira.",
      "Lysandra abate dois lobos antes que alcancem as crianças.",
      "Um carroceiro idoso morre de frio durante a madrugada.",
    ],
    npcs: ["Irmã Maelia", "Orik Mão-Partida"],
    locations: ["Estrada Velha de Alberetor", "Acampamento das Pedras Tortas"],
    consequences: [
      "A caravana perdeu provisões para três dias.",
      "Sebastian ganhou a confiança silenciosa de Orik.",
    ],
    hooks: [
      "Quem era o carroceiro morto, e por que carregava um lacre da Igreja?",
      "Há rastros que não pertencem a lobo algum ao redor do acampamento.",
    ],
    masterNotes:
      "A travessia ainda mal começou. Lembre os jogadores do frio, da fome e do silêncio. Não há heróis aqui — apenas sobreviventes.",
  },
  {
    slug: "sessao-02-vozes-no-acampamento",
    number: 2,
    title: "Vozes no Acampamento",
    date: "Inverno, segunda semana",
    present: ["Sebastian Valerius", "Lysandra Verdan"],
    summary:
      "Uma criança da caravana começa a falar com algo que ninguém mais vê. Lysandra lê as cartas pela primeira vez diante de outros — e o que aparece não agrada ninguém.",
    events: [
      "A pequena Inya passa a noite murmurando em uma língua morta.",
      "Lysandra realiza uma leitura sob pressão da Irmã Maelia.",
      "Sebastian discute com um peregrino que quer expulsar a criança.",
    ],
    npcs: ["Irmã Maelia", "Inya, a criança"],
    locations: ["Acampamento da Clareira Branca"],
    consequences: [
      "A caravana se divide em dois grupos de opinião.",
      "Lysandra é olhada com mais suspeita pelos devotos.",
    ],
    hooks: ["O que sussurra para Inya?", "Por que as cartas pararam de mentir?"],
    masterNotes:
      "Deixe a tensão crescer sem violência. Esta sessão é sobre fé, medo e o que se faz com uma criança estranha.",
  },
  {
    slug: "sessao-03-o-primeiro-sinal-de-corrupcao",
    number: 3,
    title: "O Primeiro Sinal de Corrupção",
    date: "Inverno, terceira semana",
    present: ["Sebastian Valerius", "Lysandra Verdan"],
    summary:
      "Nos limites de uma floresta sem nome, a caravana encontra uma capela abandonada. Dentro dela, algo apodreceu de uma maneira que não é natural.",
    events: [
      "A capela é descoberta ao amanhecer, com a porta arrombada por dentro.",
      "Sebastian sente a Luz vacilar ao cruzar a soleira.",
      "Lysandra encontra uma marca espiralada queimada no altar.",
    ],
    npcs: ["Padre Halbrecht (em sonho)"],
    locations: ["Capela do Sol Quebrado", "Bordas da Floresta Sem Nome"],
    consequences: [
      "Sebastian carrega, sem saber, um traço de corrupção.",
      "A marca espiralada começa a aparecer em outros lugares.",
    ],
    hooks: [
      "Quem rompeu a capela — de dentro para fora?",
      "O sonho de Padre Halbrecht era aviso ou convocação?",
    ],
    masterNotes:
      "A corrupção entrou na crônica. A partir daqui, nada que pareça simples é simples.",
  },
];
