export type Companion = {
  name: string;
  image: string;
};

export type ImageFraming = {
  imagePositionX?: number;
  imagePositionY?: number;
  imageScale?: number;
};

export type Character = {
  slug: string;
  name: string;
  role: string;
  people: string;
  shadow?: string;
  quote: string;
  image: string;
  player?: string;
  status: string;
  appearance: string;
  goal: string;
  history: string;
  companions?: Companion[];
} & ImageFraming;

export const characters: Character[] = [
  {
    slug: "sebastian-valerius",
    name: "Sebastian Valerius",
    role: "Teurgo / Protetor",
    people: "Ambriano",
    shadow: "",
    quote: "Às vezes, a misericórdia precisa sobreviver primeiro.",
    image: "/images/characters/sebastian-valerius.webp",
    player: "Jogador",
    status: "Vivo",
    appearance:
      "Sebastian Valerius é um homem de aparência marcada e cansada, com cabelos escuros desalinhados, barba cheia e uma cicatriz visível no rosto. Veste roupas escuras de viagem, couraça sob o manto negro, espada longa à cintura e escudo nas costas. No peito carrega um pequeno colar com o brasão da Casa Valerius, um sol em forma de roda. Seu olhar costuma ser sério e atento, mas não frio.",
    goal: "Proteger os sobreviventes que confiaram nele e conduzi-los até Ambria em segurança. Sebastian deseja manter viva sua fé em Prios sem fechar os olhos para os erros da Igreja. Mais do que buscar glória ou influência para sua família, ele quer provar que a misericórdia ainda pode existir.",
    history:
      "Sebastian nasceu na Casa Valerius, uma antiga família nobre de Alberetor ligada à Igreja de Prios. Desde pequeno foi preparado para servir ao Deus Sol, mas sua família nunca lhe ensinou obediência cega. Ele aprendeu que a fé podia iluminar, curar e proteger, mas também podia ser usada por homens cruéis como desculpa para injustiça. Sua formação uniu preces, estudos, escudo e espada. Nos campos de refugiados de Alberetor, viu fome, morte, corrupção e abandono. Quando Alberetor já não podia mais ser salvo, reuniu sobreviventes que confiavam nele e partiu rumo a Ambria.",
    companions: [],
  },
  {
    slug: "lysandra-verdan",
    name: "Lysandra Verdan",
    role: "Arqueira / Mística",
    people: "Ambriana",
    shadow: "",
    quote: "Suas flechas nem sempre são a coisa mais perigosa que carrega.",
    image: "/images/characters/lysandra-verdan.webp",
    player: "Jogadora",
    status: "Viva",
    appearance:
      "Lysandra Verdan tem 25 anos, presença calma e enigmática, corpo esguio e movimentos precisos. Seus longos cabelos castanho-escuros caem em ondas até as costas, contrastando com seus olhos escuros e atentos. Veste roupas práticas de viagem, calças de couro, botas resistentes e um pesado manto negro para enfrentar o inverno.",
    goal: "Sobreviver à travessia, proteger aqueles que ainda importam e descobrir se os presságios que carrega são aviso, maldição ou destino.",
    history:
      "Durante a travessia de Alberetor, Lysandra aprendeu a caçar pequenas presas para ajudar sua família a suportar a fome. Desde então, aperfeiçoou sua pontaria e passou a carregar um arco longo de madeira escura, entalhado com símbolos protetores. Ao lado da aljava, leva uma bolsa de couro com cartas, ervas secas, velas e pequenos objetos usados em rituais. Muitos a veem apenas como uma arqueira da caravana, mas há mais nela do que aparenta.",
    companions: [],
  },
];
