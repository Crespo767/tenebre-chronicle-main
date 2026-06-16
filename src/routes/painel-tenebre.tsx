import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  Download,
  Image,
  LogOut,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { PageContainer, SectionTitle, ChronicleCard, StatusBadge } from "../components/ui-chrome";
import {
  cloneContent,
  defaultCampaignContent,
  uniqueSlug,
  type CampaignContent,
} from "../lib/campaign-content";
import {
  getAdminStatus,
  getCampaignContent,
  loginAdminUser,
  logoutAdminUser,
  registerAdminUser,
  saveCampaignContent,
  uploadCharacterImage,
} from "../lib/api/campaign.functions";

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
  loader: async () => ({
    admin: await getAdminStatus(),
    content: await getCampaignContent(),
  }),
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

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border/70 pt-5 first:border-t-0 first:pt-0">
      <div className="mb-4">
        <h3 className="font-display text-2xl text-foreground">{title}</h3>
        {description && (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function ImagePathField({
  value,
  onChange,
  onUpload,
}: {
  value: unknown;
  onChange: (value: string) => void;
  onUpload?: (file: File) => Promise<string>;
}) {
  const path = String(value ?? "").trim();
  const [previewFailed, setPreviewFailed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const isValidPath =
    !path || path.startsWith("/images/characters/") || path.startsWith("https://");

  useEffect(() => {
    setPreviewFailed(false);
  }, [path]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_150px]">
      <div>
        <Field
          label="Imagem"
          value={value}
          onChange={onChange}
          help="Use /images/characters/nome-do-personagem.webp, uma URL https ou envie um arquivo."
        />
        {onUpload && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded border border-border px-3 text-sm text-foreground transition-colors hover:border-[var(--gold)]/40">
              <Upload className="h-4 w-4" />
              {uploading ? "Enviando..." : "Enviar imagem"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                disabled={uploading}
                onChange={async (event) => {
                  const file = event.currentTarget.files?.[0];
                  event.currentTarget.value = "";
                  if (!file) return;

                  setUploading(true);
                  setUploadMessage("");
                  try {
                    const url = await onUpload(file);
                    onChange(url);
                    setUploadMessage("Imagem enviada.");
                  } catch (error) {
                    setUploadMessage(
                      error instanceof Error ? error.message : "Falha ao enviar imagem.",
                    );
                  } finally {
                    setUploading(false);
                  }
                }}
              />
            </label>
            {uploadMessage && <p className="text-sm text-muted-foreground">{uploadMessage}</p>}
          </div>
        )}
      </div>
      <div className="overflow-hidden rounded border border-border/70 bg-background/55">
        {path && !previewFailed ? (
          <img
            src={path}
            alt="Prévia da imagem do personagem"
            className="aspect-[3/4] w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
              setPreviewFailed(true);
            }}
          />
        ) : (
          <div className="flex aspect-[3/4] flex-col items-center justify-center gap-2 px-3 text-center text-xs text-muted-foreground">
            <Image className="h-5 w-5 text-[var(--gold)]/70" />
            {path ? "Imagem não encontrada" : "Sem imagem"}
          </div>
        )}
      </div>
      {(!isValidPath || previewFailed) && (
        <p className="flex items-start gap-2 text-sm text-[oklch(0.75_0.12_25)] md:col-span-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {previewFailed
            ? "Não foi possível carregar a prévia. Verifique se o arquivo existe no caminho informado."
            : "Prefira imagens dentro de /images/characters/ para manter o site simples e portável."}
        </p>
      )}
    </div>
  );
}

function IconButton({
  children,
  onClick,
  variant = "default",
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "danger" | "quiet";
  type?: "button" | "submit";
  disabled?: boolean;
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
      disabled={disabled}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded border px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

function withTimeout<T>(promise: Promise<T>, message: string, timeoutMs = 12_000) {
  let timeout: number | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = window.setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeout !== undefined) window.clearTimeout(timeout);
  });
}

function AuthPanel({
  canRegister,
  configured,
  configMessage,
  onAuthenticated,
}: {
  canRegister: boolean;
  configured: boolean;
  configMessage?: string;
  onAuthenticated: (username: string) => void;
}) {
  const loginFn = useServerFn(loginAdminUser);
  const registerFn = useServerFn(registerAdminUser);
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
    if (busy) return;

    setBusy(true);
    setMessage("");

    try {
      const credentials = { username, password };
      const result =
        mode === "register"
          ? await withTimeout(
              registerFn({ data: credentials }),
              "O cadastro demorou para responder. Verifique a configuração do Supabase e tente novamente.",
            )
          : await withTimeout(
              loginFn({ data: credentials }),
              "O login demorou para responder. Verifique a configuração do Supabase e tente novamente.",
            );

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      onAuthenticated(result.username);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao autenticar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer className="py-10 sm:py-12">
      <div className="mx-auto max-w-[34rem] text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--gold)]/80">Acesso privado</p>
        <h1 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">Painel Tenebre</h1>
        <p className="mx-auto mt-4 max-w-[30rem] text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
          Entre com login e senha para editar sessões, personagens, NPCs, arquivo e notas.
        </p>
        <div className="gold-rule mx-auto mt-5 w-32" />
      </div>
      <ChronicleCard className="mx-auto mt-7 w-full max-w-[24rem] p-4 sm:p-5">
        {!configured && (
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3 rounded border border-[var(--blood)]/40 bg-[var(--blood)]/10 p-3 text-sm text-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.75_0.12_25)]" />
              <div>
                <p className="font-medium text-[oklch(0.82_0.12_25)]">
                  Supabase não configurado no servidor.
                </p>
                <p className="mt-1 leading-relaxed text-muted-foreground">
                  {configMessage ||
                    "Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente do deploy e publique novamente."}
                </p>
              </div>
            </div>
          </div>
        )}

        {configured && (
          <>
            {canRegister && (
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "register" : "login")}
                  className="shrink-0 text-sm text-[var(--gold)] hover:underline"
                >
                  {mode === "login" ? "Registrar novo usuário" : "Voltar ao login"}
                </button>
              </div>
            )}

            <form onSubmit={submit} className="space-y-3.5">
              <Field label="Login" value={username} onChange={setUsername} />
              <label className="block">
                <span className="text-xs uppercase tracking-[0.22em] text-[var(--gold)]/80">
                  Senha
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 h-11 w-full rounded border border-border bg-background/70 px-3 text-sm text-foreground outline-none transition-colors focus:border-[var(--gold)]/70"
                />
              </label>

              {message && <p className="text-sm text-[oklch(0.75_0.12_25)]">{message}</p>}

              <IconButton type="submit" disabled={busy}>
                <Save className="h-4 w-4" />
                {busy ? "Processando..." : mode === "register" ? "Criar acesso" : "Entrar"}
              </IconButton>
            </form>
          </>
        )}
      </ChronicleCard>
    </PageContainer>
  );
}

function SectionForm({
  section,
  draft,
  setField,
  uploadImage,
}: {
  section: SectionKey;
  draft: DraftItem;
  setField: (field: string, value: unknown) => void;
  uploadImage?: (file: File) => Promise<string>;
}) {
  if (section === "sessions") {
    return (
      <div className="space-y-6">
        <FormSection title="Identificação" description="Dados usados para listar e abrir a sessão.">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <NumberField
              label="Número"
              value={draft.number}
              onChange={(value) => setField("number", value)}
            />
            <Field label="Data" value={draft.date} onChange={(value) => setField("date", value)} />
            <Field
              label="Título"
              value={draft.title}
              onChange={(value) => setField("title", value)}
            />
            <Field
              label="Slug da URL"
              value={draft.slug}
              onChange={(value) => setField("slug", value)}
            />
          </div>
        </FormSection>

        <FormSection title="Registro" description="Resumo principal e participantes da noite.">
          <div className="space-y-4">
            <LinesField
              label="Presentes"
              value={draft.present}
              onChange={(value) => setField("present", value)}
            />
            <TextAreaField
              label="Resumo"
              value={draft.summary}
              onChange={(value) => setField("summary", value)}
            />
          </div>
        </FormSection>

        <FormSection
          title="Acontecimentos"
          description="Listas públicas exibidas na página da sessão."
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
            <TextAreaField
              label="Notas do Mestre"
              value={draft.masterNotes}
              onChange={(value) => setField("masterNotes", value)}
              rows={4}
            />
          </div>
        </FormSection>
      </div>
    );
  }

  if (section === "characters") {
    return (
      <div className="space-y-6">
        <FormSection
          title="Identidade"
          description="Informações que aparecem no card e no topo da ficha."
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Field label="Nome" value={draft.name} onChange={(value) => setField("name", value)} />
            <Field
              label="Slug da URL"
              value={draft.slug}
              onChange={(value) => setField("slug", value)}
            />
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
            <Field
              label="Ocupação"
              value={draft.role}
              onChange={(value) => setField("role", value)}
            />
            <Field
              label="Povo"
              value={draft.people}
              onChange={(value) => setField("people", value)}
            />
            <Field
              label="Status"
              value={draft.status}
              onChange={(value) => setField("status", value)}
            />
          </div>
        </FormSection>

        <FormSection
          title="Imagem"
          description="Use arquivos em public/images/characters para manter o deploy simples."
        >
          <ImagePathField
            value={draft.image}
            onChange={(value) => setField("image", value)}
            onUpload={uploadImage}
          />
        </FormSection>

        <FormSection
          title="Texto público"
          description="Conteúdo narrativo exibido na ficha do personagem."
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
            <div className="lg:col-span-2">
              <TextAreaField
                label="Histórico"
                value={draft.history}
                onChange={(value) => setField("history", value)}
                rows={6}
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Evolução e relações"
          description="Campos complementares para acompanhamento da campanha."
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
            <TextAreaField
              label="Relações com NPCs"
              value={draft.relations}
              onChange={(value) => setField("relations", value)}
            />
          </div>
        </FormSection>
      </div>
    );
  }

  if (section === "npcs") {
    return (
      <div className="space-y-6">
        <FormSection title="Identidade" description="Dados principais do NPC nas páginas públicas.">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Field label="Nome" value={draft.name} onChange={(value) => setField("name", value)} />
            <Field
              label="Slug da URL"
              value={draft.slug}
              onChange={(value) => setField("slug", value)}
            />
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
          </div>
        </FormSection>

        <FormSection title="Resumo">
          <TextAreaField
            label="Resumo"
            value={draft.summary}
            onChange={(value) => setField("summary", value)}
          />
        </FormSection>
      </div>
    );
  }

  if (section === "archive") {
    return (
      <div className="space-y-6">
        <FormSection
          title="Documento"
          description="Metadados usados no arquivo público da campanha."
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Field
              label="Título"
              value={draft.title}
              onChange={(value) => setField("title", value)}
            />
            <Field label="Slug" value={draft.slug} onChange={(value) => setField("slug", value)} />
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
          </div>
        </FormSection>

        <FormSection title="Conteúdo">
          <div className="space-y-4">
            <TextAreaField
              label="Descrição"
              value={draft.description}
              onChange={(value) => setField("description", value)}
            />
            <Field
              label="Link externo"
              value={draft.link}
              onChange={(value) => setField("link", value)}
            />
          </div>
        </FormSection>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FormSection title="Nota" description="Aviso público exibido na página de notas.">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Field
            label="Título"
            value={draft.title}
            onChange={(value) => setField("title", value)}
          />
          <Field
            label="Data/Contexto"
            value={draft.date}
            onChange={(value) => setField("date", value)}
          />
        </div>
        <TextAreaField
          label="Texto"
          value={draft.body}
          onChange={(value) => setField("body", value)}
        />
      </FormSection>
    </div>
  );
}

function BackupPanel({
  content,
  onReplace,
}: {
  content: CampaignContent;
  onReplace: (content: CampaignContent, message: string) => Promise<void>;
}) {
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState("");

  function exportJson() {
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tenebre-conteudo-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importJson() {
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
      await onReplace(parsed, "Conteúdo importado.");
      setImportText("");
      setMessage("Conteúdo importado.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "JSON inválido ou fora do formato esperado.",
      );
    }
  }

  async function resetAll() {
    if (!window.confirm("Restaurar todo o conteúdo original do projeto?")) return;
    await onReplace(cloneContent(defaultCampaignContent), "Conteúdo original restaurado.");
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

function Editor({
  initialContent,
  username,
  onLogout,
}: {
  initialContent: CampaignContent;
  username: string;
  onLogout: () => void;
}) {
  const router = useRouter();
  const saveContentFn = useServerFn(saveCampaignContent);
  const uploadImageFn = useServerFn(uploadCharacterImage);
  const [content, setContent] = useState<CampaignContent>(() => cloneContent(initialContent));
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
  const activeItem = items[selectedIndex];
  const hasUnsavedChanges = useMemo(
    () => Boolean(activeItem) && JSON.stringify(draft) !== JSON.stringify(activeItem),
    [activeItem, draft],
  );
  const hasSelection = Boolean(activeItem);

  useEffect(() => {
    setContent(cloneContent(initialContent));
  }, [initialContent]);

  useEffect(() => {
    const currentItems = getCollection(content, section);
    const safeIndex = Math.min(selectedIndex, Math.max(0, currentItems.length - 1));
    if (safeIndex !== selectedIndex) setSelectedIndex(safeIndex);
    setDraft(
      currentItems[safeIndex] ? { ...currentItems[safeIndex] } : createItem(section, content),
    );
  }, [content, section, selectedIndex]);

  function confirmDiscardChanges() {
    return (
      !hasUnsavedChanges ||
      window.confirm("Existem alterações não salvas. Deseja descartá-las e continuar?")
    );
  }

  function selectSection(nextSection: SectionKey) {
    if (nextSection === section) return;
    if (!confirmDiscardChanges()) return;
    setSection(nextSection);
    setSelectedIndex(0);
    setSavedMessage("");
  }

  function selectItem(nextIndex: number) {
    if (nextIndex === selectedIndex) return;
    if (!confirmDiscardChanges()) return;
    setSelectedIndex(nextIndex);
    setSavedMessage("");
  }

  function setField(field: string, value: unknown) {
    setDraft((current) => ({ ...current, [field]: value }));
    setSavedMessage("");
  }

  async function persistContent(nextContent: CampaignContent, message: string) {
    const result = await saveContentFn({ data: nextContent });
    setContent(result.content);
    setSavedMessage(message);
    await router.invalidate();
  }

  async function uploadImage(file: File) {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const value = String(reader.result ?? "");
        resolve(value.includes(",") ? (value.split(",")[1] ?? "") : value);
      };
      reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
      reader.readAsDataURL(file);
    });
    const result = await uploadImageFn({
      data: {
        fileName: file.name,
        mimeType: file.type as "image/png" | "image/jpeg" | "image/webp" | "image/gif",
        base64,
      },
    });

    if (!result.ok) throw new Error(result.message);
    return result.url;
  }

  async function addItem() {
    if (!confirmDiscardChanges()) return;
    const next = cloneContent(content) as unknown as Record<SectionKey, DraftItem[]>;
    next[section] = [createItem(section, content), ...next[section]];
    await persistContent(next as unknown as CampaignContent, "Novo registro criado.");
    setSelectedIndex(0);
  }

  async function saveItem() {
    if (!hasSelection) return;
    const next = cloneContent(content) as unknown as Record<SectionKey, DraftItem[]>;
    next[section] = [...next[section]];
    next[section][selectedIndex] = draft;
    await persistContent(next as unknown as CampaignContent, "Alterações salvas.");
  }

  async function deleteItem() {
    if (!items[selectedIndex]) return;
    if (!window.confirm("Remover este registro?")) return;

    const next = cloneContent(content) as unknown as Record<SectionKey, DraftItem[]>;
    next[section] = next[section].filter((_, index) => index !== selectedIndex);
    await persistContent(next as unknown as CampaignContent, "Registro removido.");
    setSelectedIndex(0);
  }

  function renderActionButtons() {
    return (
      <>
        <IconButton onClick={addItem} variant="quiet">
          <Plus className="h-4 w-4" />
          Novo
        </IconButton>
        <IconButton onClick={deleteItem} variant="danger" disabled={!hasSelection}>
          <Trash2 className="h-4 w-4" />
          Remover
        </IconButton>
        <IconButton onClick={saveItem} disabled={!hasSelection || !hasUnsavedChanges}>
          <Save className="h-4 w-4" />
          Salvar
        </IconButton>
      </>
    );
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
            <div className="flex flex-wrap items-center justify-end gap-2">
              {hasUnsavedChanges && (
                <span className="rounded border border-[var(--gold)]/40 px-2.5 py-1 text-xs text-[var(--gold)]">
                  Alterações não salvas
                </span>
              )}
              {renderActionButtons()}
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,280px)_1fr]">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.22em] text-[var(--gold)]/80">
                Registro
              </span>
              <select
                value={selectedIndex}
                onChange={(event) => selectItem(Number(event.target.value))}
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
            <SectionForm
              section={section}
              draft={draft}
              setField={setField}
              uploadImage={uploadImage}
            />
          )}

          {savedMessage && <p className="mt-4 text-sm text-[var(--gold)]">{savedMessage}</p>}
          <div className="sticky bottom-0 z-10 -mx-5 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 bg-background/95 px-5 py-4 backdrop-blur">
            <p className="text-sm text-muted-foreground">
              {hasUnsavedChanges
                ? "Revise e salve antes de sair deste registro."
                : savedMessage || "Nenhuma alteração pendente."}
            </p>
            <div className="flex flex-wrap gap-2">{renderActionButtons()}</div>
          </div>
        </ChronicleCard>
      </div>

      <BackupPanel content={content} onReplace={persistContent} />
    </PageContainer>
  );
}

function AdminPage() {
  const router = useRouter();
  const logoutFn = useServerFn(logoutAdminUser);
  const { admin, content } = Route.useLoaderData();
  const [username, setUsername] = useState<string | null>(admin.username);

  useEffect(() => {
    setUsername(admin.username);
  }, [admin.username]);

  if (!username) {
    return (
      <AuthPanel
        canRegister={admin.canRegister}
        configured={admin.configured}
        configMessage={admin.message}
        onAuthenticated={(nextUsername) => {
          setUsername(nextUsername);
          void router.invalidate();
        }}
      />
    );
  }

  return (
    <Editor
      initialContent={content}
      username={username}
      onLogout={async () => {
        await logoutFn();
        setUsername(null);
        await router.invalidate();
      }}
    />
  );
}
