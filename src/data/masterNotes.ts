export type MasterNote = {
  title: string;
  date: string;
  body: string;
};

export const masterNotes: MasterNote[] = [
  {
    title: "Sobre o ritmo da campanha",
    date: "Antes da Sessão 04",
    body: "A travessia ainda é a espinha dorsal da crônica. Não corram para Thistle Hold. Cada noite no acampamento é uma cena que pode mudar tudo.",
  },
  {
    title: "Aviso aos jogadores",
    date: "Notas públicas",
    body: "A corrupção em Tenebre não é apenas mecânica. É política, é fé, é memória. Se o personagem sente o peso, conte-me — eu encontro espaço na cena.",
  },
  {
    title: "Sobre o uso de cartas",
    date: "Lysandra",
    body: "Lysandra pode tirar uma leitura curta por sessão sem rolagem. Mais do que isso exige tempo, foco e — às vezes — algo em troca.",
  },
  {
    title: "Próximos passos",
    date: "Em aberto",
    body: "A Capela do Sol Quebrado deixou marcas. Quem quiser investigar a marca espiralada, fale comigo entre sessões.",
  },
];
