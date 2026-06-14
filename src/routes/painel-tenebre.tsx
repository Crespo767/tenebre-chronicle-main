import { createFileRoute } from "@tanstack/react-router";
import { LogOut, Plus, Save, Trash2, Upload, RotateCcw, Download } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { PageContainer, SectionTitle, ChronicleCard, StatusBadge } from "../components/ui-chrome";
import {
  cloneContent,
  defaultCampaignContent,
  readCampaignContent,
  resetCampaignContent,
  uniqueSlug,
  useCampaignContent,
  writeCampaignContent,
  type CampaignContent,
} from "../lib/campaign-content";
import {
  MAX_ADMIN_USERS,
  loginAdminUser,
  logoutAdminUser,
  registerAdminUser,
  useAdminSession,
} from "../lib/admin-auth";

type SectionKey = keyof CampaignContent;
type DraftItem = Record<string, unknown>;

const sections: {
  key: SectionKey;
  label: string;
  description: string;
}[] = [
  { key: "sessions", label: "Sessões", description: "Registros completos das noites de jogo." },
  { key: "characters", label: "Personagens", description: "Fichas narrativas dos personagens." },
  { key: "npcs", label: "NPCs", description: "Coadjuvantes, relações e situação atual." },
  { key: "archive", label: "Arquivo", description: "Cartas, mapas, documentos e handouts." },
  { key: "masterNotes", label: "Notas", description: "Avisos públicos do mestre para a mesa." },
];

export const Route = createFileRoute("/painel-tenebre")({
  head: () => ({
    meta: [
      { title: "Painel Tenebre" },
      { name: "description", content: "Área privada de edição da campanha Tenebre." },
    ],
  }),
  component: AdminPage,
});

function getCollection(content: CampaignContent, section: SectionKey) {
  return content[section] as unknown as DraftItem[];
}

function getItemLabel(section: SectionKey, item: DraftItem, index: number) {
  if (section === "sessions")
    return `${String(item.number ?? index + 1).padStart(2, "0")} · ${item.title}`;
  if (section === "characters" || section === "npcs") return String(item.name ?? "Sem nome");
  if (section === "archive" || section === "masterNotes") return String(item.title ?? "Sem título");
  return `Registro ${index + 1}`;
}

function createItem(section: SectionKey, content: CampaignContent): DraftItem {
  if (section === "sessions") {
    const nextNumber = Math.max(0, ...content.sessions.map((session) => session.number)) + 1;
    return {
      slug: uniqueSlug(
        `sessao-${nextNumber}`,
        content.sessions.map((session) => session.slug),
      ),
      number: nextNumber,
      title: `Sessão ${String(nextNumber).padStart(2, "0")}`,
      date: "Data a definir",
      present: [],
      summary: "",
      events: [],
      npcs: [],
      locations: [],
      consequences: [],
      hooks: [],
      masterNotes: "",
    };
  }

  if (section === "characters") {
    return {
      slug: uniqueSlug(
        "novo-personagem",
        content.characters.map((character) => character.slug),
      ),
      name: "Novo personagem",
      role: "",
      people: "",
      quote: "",
      image: "",
      subtitle: "",
      player: "",
      status: "Vivo",
      appearance: "",
      goal: "",
      history: "",
      bonds: "",
      items: [],
      evolution: "",
      relations: "",
    };
  }

  if (section === "npcs") {
    return {
      slug: uniqueSlug(
        "novo-npc",
        content.npcs.map((npc) => npc.slug),
      ),
      name: "Novo NPC",
      role: "",
      location: "",
      relation: "",
      status: "Vivo",
      summary: "",
    };
  }

  if (section === "archive") {
    return {
      slug: uniqueSlug(
        "novo-documento",
        content.archive.map((item) => item.slug),
      ),
      title: "Novo documento",
      type: "Documento",
      discovered: "",
      description: "",
      link: "",
    };
  }

  return {
    title: "Nova nota",
    date: "Em aberto",
    body: "",
  };
}

function toLines(value: unknown) {
  return Array.isArray(value) ? value.join("\n") : "";
}

function fromLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function Field({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: unknown;
  onChange: (value: string) => void;
  help?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.22em] text-[var(--gold)]/80">{label}</span>
      <input
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded border border-border bg-background/70 px-3 text-sm text-foreground outline-none transition-colors focus:border-[var(--gold)]/70"
      />
      {help && <span className="mt-1 block text-xs text-muted-foreground">{help}</span>}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: unknown;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.22em] text-[var(--gold)]/80">{label}</span>
      <input
        type="number"
        value={Number(value ?? 0)}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-11 w-full rounded border border-border bg-background/70 px-3 text-sm text-foreground outline-none transition-colors focus:border-[var(--gold)]/70"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 5,
  help,
}: {
  label: string;
  value: unknown;
  onChange: (value: string) => void;
  rows?: number;
  help?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.22em] text-[var(--gold)]/80">{label}</span>
      <textarea
        rows={rows}
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full resize-y rounded border border-border bg-background/70 px-3 py-3 text-sm leading-relaxed text-foreground outline-none transition-colors focus:border-[var(--gold)]/70"
      />
      {help && <span className="mt-1 block text-xs text-muted-foreground">{help}</span>}
    </label>
  );
}

function LinesField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: unknown;
  onChange: (value: string[]) => void;
}) {
  return (
    <TextAreaField
      label={label}
      value={toLines(value)}
      onChange={(nextValue) => onChange(fromLines(nextValue))}
      rows={4}
      help="Um item por linha."
    />
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: unknown;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.22em] text-[var(--gold)]/80">{label}</span>
      <select
        value={String(value ?? options[0])}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded border border-border bg-background/70 px-3 text-sm text-foreground outline-none transition-colors focus:border-[var(--gold)]/70"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function IconButton({
  children,
  onClick,
  variant = "default",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "danger" | "quiet";
  type?: "button" | "submit";
}) {
  const styles = {
    default: "border-[var(--gold)]/50 text-[var(--gold)] hover:bg-[var(--gold)]/10",
    danger: "border-[var(--blood)]/50 text-[oklch(0.75_0.12_25)] hover:bg-[var(--blood)]/10",
    quiet: "border-border text-foreground hover:border-[var(--gold)]/40",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded border px-3 text-sm transition-colors ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

function AuthPanel({ onAuthenticated }: { onAuthenticated: () => void }) {
  const { users, canRegister, refresh } = useAdminSession();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!canRegister && mode === "register") setMode("login");
  }, [canRegister, mode]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const result =
      mode === "register"
        ? await registerAdminUser(username, password)
        : await loginAdminUser(username, password);

    setBusy(false);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    refresh();
    onAuthenticated();
  }

  return (
    <PageContainer className="max-w-3xl">
      <SectionTitle
        eyebrow="Acesso privado"
        title="Painel Tenebre"
        subtitle="Entre com login e senha para editar sessões, personagens, NPCs, arquivo e notas."
        align="center"
      />
      <ChronicleCard>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <StatusBadge tone={canRegister ? "warn" : "ok"}>
            {users.length}/{MAX_ADMIN_USERS} usuários registrados
          </StatusBadge>
          {canRegister && (
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-sm text-[var(--gold)] hover:underline"
            >
              {mode === "login" ? "Registrar novo usuário" : "Voltar ao login"}
            </button>
          )}
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Login" value={username} onChange={setUsername} />
          <label className="block">
            <span className="text-xs uppercase tracking-[0.22em] text-[var(--gold)]/80">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-11 w-full rounded border border-border bg-background/70 px-3 text-sm text-foreground outline-none transition-colors focus:border-[var(--gold)]/70"
            />
          </label>

          {message && <p className="text-sm text-[oklch(0.75_0.12_25)]">{message}</p>}

          <IconButton type="submit">
            <Save className="h-4 w-4" />
            {busy ? "Processando..." : mode === "register" ? "Criar acesso" : "Entrar"}
          </IconButton>
        </form>
      </ChronicleCard>
    </PageContainer>
  );
}

function SectionForm({
  section,
  draft,
  setField,
}: {
  section: SectionKey;
  draft: DraftItem;
  setField: (field: string, value: unknown) => void;
}) {
  if (section === "sessions") {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Field
          label="Slug da URL"
          value={draft.slug}
          onChange={(value) => setField("slug", value)}
        />
        <NumberField
          label="Número"
          value={draft.number}
          onChange={(value) => setField("number", value)}
        />
        <Field label="Título" value={draft.title} onChange={(value) => setField("title", value)} />
        <Field label="Data" value={draft.date} onChange={(value) => setField("date", value)} />
        <div className="lg:col-span-2">
          <LinesField
            label="Presentes"
            value={draft.present}
            onChange={(value) => setField("present", value)}
          />
        </div>
        <div className="lg:col-span-2">
          <TextAreaField
            label="Resumo"
            value={draft.summary}
            onChange={(value) => setField("summary", value)}
          />
        </div>
        <LinesField
          label="Acontecimentos"
          value={draft.events}
          onChange={(value) => setField("events", value)}
        />
        <LinesField
          label="NPCs encontrados"
          value={draft.npcs}
          onChange={(value) => setField("npcs", value)}
        />
        <LinesField
          label="Locais visitados"
          value={draft.locations}
          onChange={(value) => setField("locations", value)}
        />
        <LinesField
          label="Consequências"
          value={draft.consequences}
          onChange={(value) => setField("consequences", value)}
        />
        <LinesField
          label="Ganchos pendentes"
          value={draft.hooks}
          onChange={(value) => setField("hooks", value)}
        />
        <div className="lg:col-span-2">
          <TextAreaField
            label="Notas do Mestre"
            value={draft.masterNotes}
            onChange={(value) => setField("masterNotes", value)}
          />
        </div>
      </div>
    );
  }

  if (section === "characters") {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Field
          label="Slug da URL"
          value={draft.slug}
          onChange={(value) => setField("slug", value)}
        />
        <Field label="Nome" value={draft.name} onChange={(value) => setField("name", value)} />
        <Field
          label="Subtítulo"
          value={draft.subtitle}
          onChange={(value) => setField("subtitle", value)}
        />
        <Field
          label="Jogador(a)"
          value={draft.player}
          onChange={(value) => setField("player", value)}
        />
        <Field label="Ocupação" value={draft.role} onChange={(value) => setField("role", value)} />
        <Field label="Povo" value={draft.people} onChange={(value) => setField("people", value)} />
        <Field
          label="Status"
          value={draft.status}
          onChange={(value) => setField("status", value)}
        />
        <Field
          label="Imagem"
          value={draft.image}
          onChange={(value) => setField("image", value)}
          help="Caminho público, ex.: /images/characters/nome.webp"
        />
        <div className="lg:col-span-2">
          <TextAreaField
            label="Citação"
            value={draft.quote}
            onChange={(value) => setField("quote", value)}
            rows={3}
          />
        </div>
        <TextAreaField
          label="Aparência"
          value={draft.appearance}
          onChange={(value) => setField("appearance", value)}
        />
        <TextAreaField
          label="Objetivo pessoal"
          value={draft.goal}
          onChange={(value) => setField("goal", value)}
        />
        <TextAreaField
          label="Histórico"
          value={draft.history}
          onChange={(value) => setField("history", value)}
        />
        <TextAreaField
          label="Vínculos"
          value={draft.bonds}
          onChange={(value) => setField("bonds", value)}
        />
        <LinesField
          label="Itens importantes"
          value={draft.items}
          onChange={(value) => setField("items", value)}
        />
        <TextAreaField
          label="Notas de evolução"
          value={draft.evolution}
          onChange={(value) => setField("evolution", value)}
        />
        <div className="lg:col-span-2">
          <TextAreaField
            label="Relações com NPCs"
            value={draft.relations}
            onChange={(value) => setField("relations", value)}
          />
        </div>
      </div>
    );
  }

  if (section === "npcs") {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Field
          label="Slug da URL"
          value={draft.slug}
          onChange={(value) => setField("slug", value)}
        />
        <Field label="Nome" value={draft.name} onChange={(value) => setField("name", value)} />
        <Field label="Papel" value={draft.role} onChange={(value) => setField("role", value)} />
        <Field
          label="Local"
          value={draft.location}
          onChange={(value) => setField("location", value)}
        />
        <Field
          label="Relação"
          value={draft.relation}
          onChange={(value) => setField("relation", value)}
        />
        <Field
          label="Status"
          value={draft.status}
          onChange={(value) => setField("status", value)}
        />
        <div className="lg:col-span-2">
          <TextAreaField
            label="Resumo"
            value={draft.summary}
            onChange={(value) => setField("summary", value)}
          />
        </div>
      </div>
    );
  }

  if (section === "archive") {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Field label="Slug" value={draft.slug} onChange={(value) => setField("slug", value)} />
        <Field label="Título" value={draft.title} onChange={(value) => setField("title", value)} />
        <SelectField
          label="Tipo"
          value={draft.type}
          onChange={(value) => setField("type", value)}
          options={["Carta", "Mapa", "Imagem", "Documento", "Handout"]}
        />
        <Field
          label="Descoberto em"
          value={draft.discovered}
          onChange={(value) => setField("discovered", value)}
        />
        <div className="lg:col-span-2">
          <TextAreaField
            label="Descrição"
            value={draft.description}
            onChange={(value) => setField("description", value)}
          />
        </div>
        <div className="lg:col-span-2">
          <Field
            label="Link externo"
            value={draft.link}
            onChange={(value) => setField("link", value)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Field label="Título" value={draft.title} onChange={(value) => setField("title", value)} />
      <Field
        label="Data/Contexto"
        value={draft.date}
        onChange={(value) => setField("date", value)}
      />
      <div className="lg:col-span-2">
        <TextAreaField
          label="Texto"
          value={draft.body}
          onChange={(value) => setField("body", value)}
        />
      </div>
    </div>
  );
}

function BackupPanel() {
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState("");

  function exportJson() {
    const blob = new Blob([JSON.stringify(readCampaignContent(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tenebre-conteudo-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importJson() {
    try {
      const parsed = JSON.parse(importText) as CampaignContent;
      if (
        !Array.isArray(parsed.sessions) ||
        !Array.isArray(parsed.characters) ||
        !Array.isArray(parsed.npcs) ||
        !Array.isArray(parsed.archive) ||
        !Array.isArray(parsed.masterNotes)
      ) {
        throw new Error("Formato incompleto.");
      }
      writeCampaignContent(parsed);
      setImportText("");
      setMessage("Conteúdo importado.");
    } catch {
      setMessage("JSON inválido ou fora do formato esperado.");
    }
  }

  function resetAll() {
    if (!window.confirm("Restaurar todo o conteúdo original do projeto?")) return;
    resetCampaignContent();
    setMessage("Conteúdo original restaurado.");
  }

  return (
    <ChronicleCard className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-foreground">Backup e restauração</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Exporte o JSON antes de grandes mudanças. A importação substitui todo o conteúdo
            editável.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <IconButton onClick={exportJson} variant="quiet">
            <Download className="h-4 w-4" />
            Exportar
          </IconButton>
          <IconButton onClick={resetAll} variant="danger">
            <RotateCcw className="h-4 w-4" />
            Restaurar original
          </IconButton>
        </div>
      </div>
      <TextAreaField
        label="Importar JSON"
        value={importText}
        onChange={setImportText}
        rows={5}
        help="Cole aqui um JSON exportado por este painel."
      />
      <div className="mt-3 flex items-center gap-3">
        <IconButton onClick={importJson}>
          <Upload className="h-4 w-4" />
          Importar
        </IconButton>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </ChronicleCard>
  );
}

function Editor({ username, onLogout }: { username: string; onLogout: () => void }) {
  const content = useCampaignContent();
  const [section, setSection] = useState<SectionKey>("sessions");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [draft, setDraft] = useState<DraftItem>(
    () => cloneContent(defaultCampaignContent).sessions[0] as DraftItem,
  );
  const [savedMessage, setSavedMessage] = useState("");

  const activeMeta = useMemo(
    () => sections.find((entry) => entry.key === section) ?? sections[0],
    [section],
  );
  const items = getCollection(content, section);

  useEffect(() => {
    const currentItems = getCollection(content, section);
    const safeIndex = Math.min(selectedIndex, Math.max(0, currentItems.length - 1));
    if (safeIndex !== selectedIndex) setSelectedIndex(safeIndex);
    setDraft(
      currentItems[safeIndex] ? { ...currentItems[safeIndex] } : createItem(section, content),
    );
  }, [content, section, selectedIndex]);

  function selectSection(nextSection: SectionKey) {
    setSection(nextSection);
    setSelectedIndex(0);
    setSavedMessage("");
  }

  function setField(field: string, value: unknown) {
    setDraft((current) => ({ ...current, [field]: value }));
    setSavedMessage("");
  }

  function addItem() {
    const next = cloneContent(content) as unknown as Record<SectionKey, DraftItem[]>;
    next[section] = [createItem(section, content), ...next[section]];
    writeCampaignContent(next as unknown as CampaignContent);
    setSelectedIndex(0);
    setSavedMessage("Novo registro criado.");
  }

  function saveItem() {
    const next = cloneContent(content) as unknown as Record<SectionKey, DraftItem[]>;
    next[section] = [...next[section]];
    next[section][selectedIndex] = draft;
    writeCampaignContent(next as unknown as CampaignContent);
    setSavedMessage("Alterações salvas.");
  }

  function deleteItem() {
    if (!items[selectedIndex]) return;
    if (!window.confirm("Remover este registro?")) return;

    const next = cloneContent(content) as unknown as Record<SectionKey, DraftItem[]>;
    next[section] = next[section].filter((_, index) => index !== selectedIndex);
    writeCampaignContent(next as unknown as CampaignContent);
    setSelectedIndex(0);
    setSavedMessage("Registro removido.");
  }

  return (
    <PageContainer>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <SectionTitle
          eyebrow="Área privada"
          title="Editor Tenebre"
          subtitle="Edite todos os blocos públicos da campanha em um único painel."
        />
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="ok">{username}</StatusBadge>
          <IconButton onClick={onLogout} variant="quiet">
            <LogOut className="h-4 w-4" />
            Sair
          </IconButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-3">
          {sections.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => selectSection(entry.key)}
              className={`w-full rounded border p-4 text-left transition-colors ${
                section === entry.key
                  ? "border-[var(--gold)]/50 bg-[var(--gold)]/10"
                  : "border-border/70 hover:border-[var(--gold)]/40"
              }`}
            >
              <span className="font-display text-xl text-foreground">{entry.label}</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                {entry.description}
              </span>
              <span className="mt-3 inline-flex text-xs uppercase tracking-widest text-[var(--gold)]/80">
                {getCollection(content, entry.key).length} registros
              </span>
            </button>
          ))}
        </aside>

        <ChronicleCard>
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl text-foreground">{activeMeta.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{activeMeta.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <IconButton onClick={addItem} variant="quiet">
                <Plus className="h-4 w-4" />
                Novo
              </IconButton>
              <IconButton onClick={deleteItem} variant="danger">
                <Trash2 className="h-4 w-4" />
                Remover
              </IconButton>
              <IconButton onClick={saveItem}>
                <Save className="h-4 w-4" />
                Salvar
              </IconButton>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,280px)_1fr]">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.22em] text-[var(--gold)]/80">
                Registro
              </span>
              <select
                value={selectedIndex}
                onChange={(event) => setSelectedIndex(Number(event.target.value))}
                className="mt-2 h-11 w-full rounded border border-border bg-background/70 px-3 text-sm text-foreground outline-none transition-colors focus:border-[var(--gold)]/70"
              >
                {items.map((item, index) => (
                  <option key={`${section}-${index}`} value={index}>
                    {getItemLabel(section, item, index)}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded border border-border/70 bg-background/35 p-3 text-sm text-muted-foreground">
              Este editor cobre todos os campos usados pelas páginas públicas. Para listas, use uma
              linha por item. Slugs alteram as URLs de detalhe.
            </div>
          </div>

          {items.length === 0 ? (
            <div className="rounded border border-border/70 p-6 text-center text-muted-foreground">
              Nenhum registro nesta seção. Use “Novo” para começar.
            </div>
          ) : (
            <SectionForm section={section} draft={draft} setField={setField} />
          )}

          {savedMessage && <p className="mt-4 text-sm text-[var(--gold)]">{savedMessage}</p>}
        </ChronicleCard>
      </div>

      <BackupPanel />
    </PageContainer>
  );
}

function AdminPage() {
  const { username, refresh } = useAdminSession();

  if (!username) {
    return <AuthPanel onAuthenticated={refresh} />;
  }

  return (
    <Editor
      username={username}
      onLogout={() => {
        logoutAdminUser();
        refresh();
      }}
    />
  );
}
