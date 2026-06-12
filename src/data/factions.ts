export type Faction = {
  slug: string;
  name: string;
  image?: string;
  summary: string;
  highlight?: boolean;
  details?: string;
};

export const factions: Faction[] = [
  {
    slug: "casa-valerius",
    name: "Casa Valerius",
    image: "/images/factions/casa-valerius.webp",
    highlight: true,
    summary:
      "Antiga linhagem nobre de Alberetor, ligada à Igreja do Sol. Carrega respeito, disciplina e tradição, ainda que não esteja entre as casas mais poderosas. Seu brasão é um sol em forma de roda.",
    details:
      "A Casa Valerius nunca buscou o trono, mas formou cavaleiros, sacerdotes e curandeiros por gerações. Com a queda de Alberetor, restam poucos de sua linhagem direta — Sebastian é um deles. Seu nome ainda abre algumas portas em Ambria, e fecha outras.",
  },
  {
    slug: "igreja-do-sol",
    name: "Igreja do Sol",
    summary:
      "Instituição religiosa dedicada a Prios, o Deus Sol. Outrora farol de Alberetor, hoje dividida entre reformistas, fanáticos e os que apenas querem sobreviver à nova era.",
  },
  {
    slug: "ordo-magica",
    name: "Ordo Magica",
    summary:
      "Ordem de magos e estudiosos que catalogam o saber arcano de Ambria. Tolera a magia que controla, suspeita da magia que não entende, e teme a magia de Davokar.",
  },
  {
    slug: "clas-barbaros",
    name: "Clãs Bárbaros",
    summary:
      "Povos antigos das bordas e do interior de Davokar. Cada clã carrega seus próprios pactos, suas próprias dívidas e seu próprio entendimento do que a floresta exige.",
  },
  {
    slug: "pacto-de-ferro",
    name: "Pacto de Ferro",
    summary:
      "Aliança difícil entre certos nobres ambrianos e chefes bárbaros, costurada para conter o que sobe de Davokar. Ninguém confia plenamente em ninguém.",
  },
  {
    slug: "nobres-ambrianos",
    name: "Nobres Ambrianos",
    summary:
      "As Casas que erguem Ambria como promessa de futuro. Algumas honram suas raízes em Alberetor; outras preferem esquecer.",
  },
  {
    slug: "cacadores-de-tesouros",
    name: "Caçadores de Tesouros",
    summary:
      "Aventureiros, mercenários e desesperados que entram em Davokar atrás de relíquias. Poucos voltam inteiros. Menos ainda voltam os mesmos.",
  },
];
