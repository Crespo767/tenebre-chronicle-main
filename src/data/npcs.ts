import type { Companion, ImageFraming } from "./characters";

export type Npc = {
  slug: string;
  name: string;
  image?: string;
  role: string;
  location: string;
  relation: string;
  status: string;
  summary: string;
  companions?: Companion[];
} & ImageFraming;

export const npcs: Npc[] = [
  {
    slug: "irma-maelia",
    name: "Irmã Maelia",
    image: "",
    role: "Sacerdotisa errante de Prios",
    location: "Caravana dos refugiados",
    relation: "Aliada da caravana, observadora atenta de Sebastian",
    status: "Viva",
    summary:
      "Sacerdotisa de meia-idade, calma, de mãos calejadas. Acredita que a Igreja perdeu o caminho, mas não a fé. Cuida dos doentes e mantém o coro nas noites mais frias.",
    companions: [],
  },
  {
    slug: "capitao-draven",
    name: "Capitão Draven",
    image: "",
    role: "Capitão da Guarda Ambriana",
    location: "Posto de fronteira de Kasta",
    relation: "Desconfiança mútua com Sebastian",
    status: "Vivo",
    summary:
      "Oficial endurecido, rosto marcado por uma queimadura antiga. Cumpre ordens sem perguntar e despreza nobres que ainda usam o nome de Alberetor.",
    companions: [],
  },
  {
    slug: "orik-mao-partida",
    name: "Orik Mão-Partida",
    image: "",
    role: "Carroceiro e ferreiro improvisado",
    location: "Caravana dos refugiados",
    relation: "Devoto silencioso de Sebastian",
    status: "Vivo",
    summary:
      "Homem largo, mão direita torta de uma fratura mal curada. Fala pouco, ri menos, e bate o martelo como se cada golpe pagasse uma dívida antiga.",
    companions: [],
  },
  {
    slug: "elira-dos-vales",
    name: "Elira dos Vales",
    image: "",
    role: "Mística itinerante",
    location: "Cruzou a caravana uma vez",
    relation: "Parente distante de Lysandra",
    status: "Paradeiro desconhecido",
    summary:
      "Mulher magra de olhos demasiado claros. Trocou cartas com Lysandra à beira de uma fogueira e desapareceu antes da manhã.",
    companions: [],
  },
  {
    slug: "padre-halbrecht",
    name: "Padre Halbrecht",
    image: "",
    role: "Sacerdote idoso da Igreja do Sol",
    location: "Última vez visto em Alberetor",
    relation: "Mentor de Sebastian",
    status: "Desaparecido",
    summary:
      "Mestre de Sebastian em fé e em dúvida. Ensinou que o Sol não pertence aos homens que o invocam. Visto pela última vez carregando crianças para fora de um convento em chamas.",
    companions: [],
  },
];
