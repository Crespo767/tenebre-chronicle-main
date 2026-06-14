create extension if not exists pgcrypto with schema extensions;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'archive_item_type') then
    create type public.archive_item_type as enum ('Carta', 'Mapa', 'Imagem', 'Documento', 'Handout');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public;

create table if not exists public.campaign_sessions (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  number integer not null unique check (number > 0),
  title text not null,
  session_date text not null default '',
  present text[] not null default '{}',
  summary text not null default '',
  events text[] not null default '{}',
  npcs text[] not null default '{}',
  locations text[] not null default '{}',
  consequences text[] not null default '{}',
  hooks text[] not null default '{}',
  master_notes text not null default '',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_characters (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subtitle text,
  role text not null default '',
  people text not null default '',
  quote text not null default '',
  image text not null default '',
  player text,
  status text not null default '',
  appearance text not null default '',
  goal text not null default '',
  history text not null default '',
  bonds text,
  items text[] not null default '{}',
  evolution text,
  relations text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_npcs (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  name text not null,
  role text not null default '',
  location text not null default '',
  relation text not null default '',
  status text not null default '',
  summary text not null default '',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_archive_items (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  title text not null,
  type public.archive_item_type not null default 'Documento',
  discovered text not null default '',
  description text not null default '',
  link text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_master_notes (
  id uuid primary key default extensions.gen_random_uuid(),
  title text not null,
  note_date text not null default '',
  body text not null default '',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (title, note_date)
);

create table if not exists public.admin_users (
  username text primary key,
  username_normalized text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_sessions (
  token_hash text primary key,
  username text not null references public.admin_users (username) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists campaign_sessions_order_idx on public.campaign_sessions (number, order_index);
create index if not exists campaign_characters_order_idx on public.campaign_characters (order_index, name);
create index if not exists campaign_npcs_order_idx on public.campaign_npcs (order_index, name);
create index if not exists campaign_archive_items_order_idx on public.campaign_archive_items (order_index, title);
create index if not exists campaign_master_notes_order_idx on public.campaign_master_notes (order_index, title);
create index if not exists admin_sessions_username_idx on public.admin_sessions (username);
create index if not exists admin_sessions_expires_at_idx on public.admin_sessions (expires_at);

drop trigger if exists set_campaign_sessions_updated_at on public.campaign_sessions;
create trigger set_campaign_sessions_updated_at
before update on public.campaign_sessions
for each row execute function public.set_updated_at();

drop trigger if exists set_campaign_characters_updated_at on public.campaign_characters;
create trigger set_campaign_characters_updated_at
before update on public.campaign_characters
for each row execute function public.set_updated_at();

drop trigger if exists set_campaign_npcs_updated_at on public.campaign_npcs;
create trigger set_campaign_npcs_updated_at
before update on public.campaign_npcs
for each row execute function public.set_updated_at();

drop trigger if exists set_campaign_archive_items_updated_at on public.campaign_archive_items;
create trigger set_campaign_archive_items_updated_at
before update on public.campaign_archive_items
for each row execute function public.set_updated_at();

drop trigger if exists set_campaign_master_notes_updated_at on public.campaign_master_notes;
create trigger set_campaign_master_notes_updated_at
before update on public.campaign_master_notes
for each row execute function public.set_updated_at();

alter table public.campaign_sessions enable row level security;
alter table public.campaign_characters enable row level security;
alter table public.campaign_npcs enable row level security;
alter table public.campaign_archive_items enable row level security;
alter table public.campaign_master_notes enable row level security;
alter table public.admin_users enable row level security;
alter table public.admin_sessions enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant usage on type public.archive_item_type to anon, authenticated, service_role;
revoke all on table public.campaign_sessions from anon, authenticated;
revoke all on table public.campaign_characters from anon, authenticated;
revoke all on table public.campaign_npcs from anon, authenticated;
revoke all on table public.campaign_archive_items from anon, authenticated;
revoke all on table public.campaign_master_notes from anon, authenticated;
grant select on table public.campaign_sessions to anon, authenticated;
grant select on table public.campaign_characters to anon, authenticated;
grant select on table public.campaign_npcs to anon, authenticated;
grant select on table public.campaign_archive_items to anon, authenticated;
grant select on table public.campaign_master_notes to anon, authenticated;
grant all on table public.campaign_sessions to service_role;
grant all on table public.campaign_characters to service_role;
grant all on table public.campaign_npcs to service_role;
grant all on table public.campaign_archive_items to service_role;
grant all on table public.campaign_master_notes to service_role;
revoke all on table public.admin_users from anon, authenticated;
revoke all on table public.admin_sessions from anon, authenticated;
grant all on table public.admin_users to service_role;
grant all on table public.admin_sessions to service_role;

drop policy if exists "Public read campaign sessions" on public.campaign_sessions;
create policy "Public read campaign sessions"
on public.campaign_sessions for select
to anon, authenticated
using (true);

drop policy if exists "Service role manages campaign sessions" on public.campaign_sessions;
create policy "Service role manages campaign sessions"
on public.campaign_sessions for all
to service_role
using (true)
with check (true);

drop policy if exists "Public read campaign characters" on public.campaign_characters;
create policy "Public read campaign characters"
on public.campaign_characters for select
to anon, authenticated
using (true);

drop policy if exists "Service role manages campaign characters" on public.campaign_characters;
create policy "Service role manages campaign characters"
on public.campaign_characters for all
to service_role
using (true)
with check (true);

drop policy if exists "Public read campaign npcs" on public.campaign_npcs;
create policy "Public read campaign npcs"
on public.campaign_npcs for select
to anon, authenticated
using (true);

drop policy if exists "Service role manages campaign npcs" on public.campaign_npcs;
create policy "Service role manages campaign npcs"
on public.campaign_npcs for all
to service_role
using (true)
with check (true);

drop policy if exists "Public read campaign archive items" on public.campaign_archive_items;
create policy "Public read campaign archive items"
on public.campaign_archive_items for select
to anon, authenticated
using (true);

drop policy if exists "Service role manages campaign archive items" on public.campaign_archive_items;
create policy "Service role manages campaign archive items"
on public.campaign_archive_items for all
to service_role
using (true)
with check (true);

drop policy if exists "Public read campaign master notes" on public.campaign_master_notes;
create policy "Public read campaign master notes"
on public.campaign_master_notes for select
to anon, authenticated
using (true);

drop policy if exists "Service role manages campaign master notes" on public.campaign_master_notes;
create policy "Service role manages campaign master notes"
on public.campaign_master_notes for all
to service_role
using (true)
with check (true);

drop policy if exists "Service role manages admin users" on public.admin_users;
create policy "Service role manages admin users"
on public.admin_users for all
to service_role
using (true)
with check (true);

drop policy if exists "Service role manages admin sessions" on public.admin_sessions;
create policy "Service role manages admin sessions"
on public.admin_sessions for all
to service_role
using (true)
with check (true);

insert into public.campaign_sessions (
  slug,
  number,
  title,
  session_date,
  present,
  summary,
  events,
  npcs,
  locations,
  consequences,
  hooks,
  master_notes,
  order_index
) values
(
  'sessao-01-a-estrada-sob-a-neve',
  1,
  'A Estrada Sob a Neve',
  'Inverno, primeiro mês da travessia',
  array['Sebastian Valerius', 'Lysandra Verdan'],
  'A caravana de refugiados deixa para trás as cinzas de Alberetor e enfrenta a primeira noite de inverno aberto. Lobos rondam a estrada, e um velho carroceiro morre antes do amanhecer.',
  array[
    'A caravana parte ao entardecer e perde uma carroça num desbarrancado.',
    'Sebastian conduz uma oração coletiva ao redor da fogueira.',
    'Lysandra abate dois lobos antes que alcancem as crianças.',
    'Um carroceiro idoso morre de frio durante a madrugada.'
  ],
  array['Irmã Maelia', 'Orik Mão-Partida'],
  array['Estrada Velha de Alberetor', 'Acampamento das Pedras Tortas'],
  array[
    'A caravana perdeu provisões para três dias.',
    'Sebastian ganhou a confiança silenciosa de Orik.'
  ],
  array[
    'Quem era o carroceiro morto, e por que carregava um lacre da Igreja?',
    'Há rastros que não pertencem a lobo algum ao redor do acampamento.'
  ],
  'A travessia ainda mal começou. Lembre os jogadores do frio, da fome e do silêncio. Não há heróis aqui — apenas sobreviventes.',
  1
),
(
  'sessao-02-vozes-no-acampamento',
  2,
  'Vozes no Acampamento',
  'Inverno, segunda semana',
  array['Sebastian Valerius', 'Lysandra Verdan'],
  'Uma criança da caravana começa a falar com algo que ninguém mais vê. Lysandra lê as cartas pela primeira vez diante de outros — e o que aparece não agrada ninguém.',
  array[
    'A pequena Inya passa a noite murmurando em uma língua morta.',
    'Lysandra realiza uma leitura sob pressão da Irmã Maelia.',
    'Sebastian discute com um peregrino que quer expulsar a criança.'
  ],
  array['Irmã Maelia', 'Inya, a criança'],
  array['Acampamento da Clareira Branca'],
  array[
    'A caravana se divide em dois grupos de opinião.',
    'Lysandra é olhada com mais suspeita pelos devotos.'
  ],
  array['O que sussurra para Inya?', 'Por que as cartas pararam de mentir?'],
  'Deixe a tensão crescer sem violência. Esta sessão é sobre fé, medo e o que se faz com uma criança estranha.',
  2
),
(
  'sessao-03-o-primeiro-sinal-de-corrupcao',
  3,
  'O Primeiro Sinal de Corrupção',
  'Inverno, terceira semana',
  array['Sebastian Valerius', 'Lysandra Verdan'],
  'Nos limites de uma floresta sem nome, a caravana encontra uma capela abandonada. Dentro dela, algo apodreceu de uma maneira que não é natural.',
  array[
    'A capela é descoberta ao amanhecer, com a porta arrombada por dentro.',
    'Sebastian sente a Luz vacilar ao cruzar a soleira.',
    'Lysandra encontra uma marca espiralada queimada no altar.'
  ],
  array['Padre Halbrecht (em sonho)'],
  array['Capela do Sol Quebrado', 'Bordas da Floresta Sem Nome'],
  array[
    'Sebastian carrega, sem saber, um traço de corrupção.',
    'A marca espiralada começa a aparecer em outros lugares.'
  ],
  array[
    'Quem rompeu a capela — de dentro para fora?',
    'O sonho de Padre Halbrecht era aviso ou convocação?'
  ],
  'A corrupção entrou na crônica. A partir daqui, nada que pareça simples é simples.',
  3
)
on conflict (slug) do update set
  number = excluded.number,
  title = excluded.title,
  session_date = excluded.session_date,
  present = excluded.present,
  summary = excluded.summary,
  events = excluded.events,
  npcs = excluded.npcs,
  locations = excluded.locations,
  consequences = excluded.consequences,
  hooks = excluded.hooks,
  master_notes = excluded.master_notes,
  order_index = excluded.order_index;

insert into public.campaign_characters (
  slug,
  name,
  subtitle,
  role,
  people,
  quote,
  image,
  player,
  status,
  appearance,
  goal,
  history,
  bonds,
  items,
  evolution,
  relations,
  order_index
) values
(
  'sebastian-valerius',
  'Sebastian Valerius',
  'Filho da Casa Valerius, servo do Sol',
  'Teurgo / Protetor',
  'Ambriano',
  'Às vezes, a misericórdia precisa sobreviver primeiro.',
  '/images/characters/sebastian-valerius.webp',
  'Jogador',
  'Vivo',
  'Sebastian Valerius é um homem de aparência marcada e cansada, com cabelos escuros desalinhados, barba cheia e uma cicatriz visível no rosto. Veste roupas escuras de viagem, couraça sob o manto negro, espada longa à cintura e escudo nas costas. No peito carrega um pequeno colar com o brasão da Casa Valerius, um sol em forma de roda. Seu olhar costuma ser sério e atento, mas não frio.',
  'Proteger os sobreviventes que confiaram nele e conduzi-los até Ambria em segurança. Sebastian deseja manter viva sua fé em Prios sem fechar os olhos para os erros da Igreja. Mais do que buscar glória ou influência para sua família, ele quer provar que a misericórdia ainda pode existir.',
  'Sebastian nasceu na Casa Valerius, uma antiga família nobre de Alberetor ligada à Igreja de Prios. Desde pequeno foi preparado para servir ao Deus Sol, mas sua família nunca lhe ensinou obediência cega. Ele aprendeu que a fé podia iluminar, curar e proteger, mas também podia ser usada por homens cruéis como desculpa para injustiça. Sua formação uniu preces, estudos, escudo e espada. Nos campos de refugiados de Alberetor, viu fome, morte, corrupção e abandono. Quando Alberetor já não podia mais ser salvo, reuniu sobreviventes que confiavam nele e partiu rumo a Ambria.',
  'Os refugiados da caravana. Sua irmã, deixada em um convento em chamas. Padre Halbrecht, mentor de juventude.',
  array[
    'Espada longa da Casa Valerius',
    'Escudo com o sol em roda',
    'Colar com brasão familiar',
    'Pequeno livro de preces gasto'
  ],
  'Aprendeu o milagre menor ''Luz Curativa''. Recusou-se a executar um ladrão faminto em Thistle Hold.',
  'Padre Halbrecht (mentor), Irmã Maelia (aliada), Capitão Draven (desconfiança mútua).',
  1
),
(
  'lysandra-verdan',
  'Lysandra Verdan',
  'Arqueira silenciosa, leitora de presságios',
  'Arqueira / Mística',
  'Ambriana',
  'Suas flechas nem sempre são a coisa mais perigosa que carrega.',
  '/images/characters/lysandra-verdan.webp',
  'Jogadora',
  'Viva',
  'Lysandra Verdan tem 25 anos, presença calma e enigmática, corpo esguio e movimentos precisos. Seus longos cabelos castanho-escuros caem em ondas até as costas, contrastando com seus olhos escuros e atentos. Veste roupas práticas de viagem, calças de couro, botas resistentes e um pesado manto negro para enfrentar o inverno.',
  'Sobreviver à travessia, proteger aqueles que ainda importam e descobrir se os presságios que carrega são aviso, maldição ou destino.',
  'Durante a travessia de Alberetor, Lysandra aprendeu a caçar pequenas presas para ajudar sua família a suportar a fome. Desde então, aperfeiçoou sua pontaria e passou a carregar um arco longo de madeira escura, entalhado com símbolos protetores. Ao lado da aljava, leva uma bolsa de couro com cartas, ervas secas, velas e pequenos objetos usados em rituais. Muitos a veem apenas como uma arqueira da caravana, mas há mais nela do que aparenta.',
  'Sua mãe, ainda viva. Sebastian, em quem confia mais do que admite.',
  array[
    'Arco longo de madeira escura entalhado',
    'Aljava com flechas marcadas',
    'Bolsa ritual com cartas e ervas',
    'Pequena adaga curva'
  ],
  'Leu cartas para a caravana em três ocasiões. Uma delas se cumpriu.',
  'Sebastian Valerius (parceiro de caravana), Elira dos Vales (parente distante).',
  2
)
on conflict (slug) do update set
  name = excluded.name,
  subtitle = excluded.subtitle,
  role = excluded.role,
  people = excluded.people,
  quote = excluded.quote,
  image = excluded.image,
  player = excluded.player,
  status = excluded.status,
  appearance = excluded.appearance,
  goal = excluded.goal,
  history = excluded.history,
  bonds = excluded.bonds,
  items = excluded.items,
  evolution = excluded.evolution,
  relations = excluded.relations,
  order_index = excluded.order_index;

insert into public.campaign_npcs (
  slug,
  name,
  role,
  location,
  relation,
  status,
  summary,
  order_index
) values
(
  'irma-maelia',
  'Irmã Maelia',
  'Sacerdotisa errante de Prios',
  'Caravana dos refugiados',
  'Aliada da caravana, observadora atenta de Sebastian',
  'Viva',
  'Sacerdotisa de meia-idade, calma, de mãos calejadas. Acredita que a Igreja perdeu o caminho, mas não a fé. Cuida dos doentes e mantém o coro nas noites mais frias.',
  1
),
(
  'capitao-draven',
  'Capitão Draven',
  'Capitão da Guarda Ambriana',
  'Posto de fronteira de Kasta',
  'Desconfiança mútua com Sebastian',
  'Vivo',
  'Oficial endurecido, rosto marcado por uma queimadura antiga. Cumpre ordens sem perguntar e despreza nobres que ainda usam o nome de Alberetor.',
  2
),
(
  'orik-mao-partida',
  'Orik Mão-Partida',
  'Carroceiro e ferreiro improvisado',
  'Caravana dos refugiados',
  'Devoto silencioso de Sebastian',
  'Vivo',
  'Homem largo, mão direita torta de uma fratura mal curada. Fala pouco, ri menos, e bate o martelo como se cada golpe pagasse uma dívida antiga.',
  3
),
(
  'elira-dos-vales',
  'Elira dos Vales',
  'Mística itinerante',
  'Cruzou a caravana uma vez',
  'Parente distante de Lysandra',
  'Paradeiro desconhecido',
  'Mulher magra de olhos demasiado claros. Trocou cartas com Lysandra à beira de uma fogueira e desapareceu antes da manhã.',
  4
),
(
  'padre-halbrecht',
  'Padre Halbrecht',
  'Sacerdote idoso da Igreja do Sol',
  'Última vez visto em Alberetor',
  'Mentor de Sebastian',
  'Desaparecido',
  'Mestre de Sebastian em fé e em dúvida. Ensinou que o Sol não pertence aos homens que o invocam. Visto pela última vez carregando crianças para fora de um convento em chamas.',
  5
)
on conflict (slug) do update set
  name = excluded.name,
  role = excluded.role,
  location = excluded.location,
  relation = excluded.relation,
  status = excluded.status,
  summary = excluded.summary,
  order_index = excluded.order_index;

insert into public.campaign_archive_items (
  slug,
  title,
  type,
  discovered,
  description,
  link,
  order_index
) values
(
  'carta-do-padre-halbrecht',
  'Carta do Padre Halbrecht',
  'Carta',
  'Antes da partida de Alberetor',
  'Uma carta breve, escrita às pressas, recomendando que Sebastian busque a Irmã Maelia ao norte e desconfie de qualquer voz que prometa segurança rápida.',
  null,
  1
),
(
  'mapa-da-estrada-velha',
  'Mapa da Estrada Velha',
  'Mapa',
  'Sessão 01',
  'Mapa rasgado de pontos de água e abrigos ao longo da Estrada Velha de Alberetor. Algumas marcações foram riscadas em vermelho.',
  null,
  2
),
(
  'marca-espiralada-esboco',
  'Esboço da marca espiralada',
  'Imagem',
  'Sessão 03',
  'Desenho feito por Lysandra do símbolo em espiral encontrado no altar da Capela do Sol Quebrado.',
  null,
  3
),
(
  'lacre-do-carroceiro',
  'Lacre do carroceiro morto',
  'Documento',
  'Sessão 01',
  'Um lacre de cera com o símbolo de um ramo da Igreja do Sol, encontrado entre os pertences do carroceiro idoso falecido na primeira noite.',
  null,
  4
)
on conflict (slug) do update set
  title = excluded.title,
  type = excluded.type,
  discovered = excluded.discovered,
  description = excluded.description,
  link = excluded.link,
  order_index = excluded.order_index;

insert into public.campaign_master_notes (
  title,
  note_date,
  body,
  order_index
) values
(
  'Sobre o ritmo da campanha',
  'Antes da Sessão 04',
  'A travessia ainda é a espinha dorsal da crônica. Não corram para Thistle Hold. Cada noite no acampamento é uma cena que pode mudar tudo.',
  1
),
(
  'Aviso aos jogadores',
  'Notas públicas',
  'A corrupção em Tenebre não é apenas mecânica. É política, é fé, é memória. Se o personagem sente o peso, conte-me — eu encontro espaço na cena.',
  2
),
(
  'Sobre o uso de cartas',
  'Lysandra',
  'Lysandra pode tirar uma leitura curta por sessão sem rolagem. Mais do que isso exige tempo, foco e — às vezes — algo em troca.',
  3
),
(
  'Próximos passos',
  'Em aberto',
  'A Capela do Sol Quebrado deixou marcas. Quem quiser investigar a marca espiralada, fale comigo entre sessões.',
  4
)
on conflict (title, note_date) do update set
  body = excluded.body,
  order_index = excluded.order_index;

update storage.buckets
set id = 'character-images',
    name = 'character-images'
where id = 'character-image'
  and not exists (
    select 1 from storage.buckets existing where existing.id = 'character-images'
  );

update storage.objects
set bucket_id = 'character-images'
where bucket_id = 'character-image'
  and exists (
    select 1 from storage.buckets existing where existing.id = 'character-images'
  );

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) values (
  'character-images',
  'character-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read character images" on storage.objects;

drop policy if exists "Service role manages character images" on storage.objects;
create policy "Service role manages character images"
on storage.objects for all
to service_role
using (bucket_id = 'character-images')
with check (bucket_id = 'character-images');

do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'rls_auto_enable'
      and pg_get_function_identity_arguments(p.oid) = ''
  ) then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end
$$;
