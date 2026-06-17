import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  ClipboardPaste,
  Download,
  Image,
  Link as LinkIcon,
  LogOut,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState, type ClipboardEvent, type FormEvent } from "react";

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

const buttonBase =
  "inline-flex h-10 items-center justify-center gap-2 rounded-sm border px-3 text-sm font-medium tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold)]/55 disabled:cursor-not-allowed disabled:opacity-45";
const defaultArchiveTypes = ["Carta", "Mapa", "Imagem", "Documento", "Handout"];
const otherArchiveTypeValue = "__other_archive_type__";

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

function getSectionSingularLabel(section: SectionKey) {
  if (section === "sessions") return "Sessão";
  if (section === "characters") return "Personagem";
  if (section === "npcs") return "NPC";
  if (section === "archive") return "Documento";
  return "Nota";
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
      shadow: "",
      quote: "",
      image: "",
      player: "",
      status: "Vivo",
      appearance: "",
      goal: "",
      history: "",
    };
  }

  if (section === "npcs") {
    return {
      slug: uniqueSlug(
        "novo-npc",
        content.npcs.map((npc) => npc.slug),
      ),
      name: "Novo NPC",
      image: "",
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
        className="mt-2 h-11 w-full appearance-none rounded-sm border border-border bg-background/70 px-3 text-sm text-foreground outline-none transition-colors focus:border-[var(--gold)]/70"
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
        className="mt-2 h-11 w-full appearance-none rounded-sm border border-border bg-background/70 px-3 text-sm text-foreground outline-none transition-colors focus:border-[var(--gold)]/70"
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
        className="mt-2 w-full resize-y appearance-none rounded-sm border border-border bg-background/70 px-3 py-3 text-sm leading-relaxed text-foreground outline-none transition-colors focus:border-[var(--gold)]/70"
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

type SelectOption = string | { value: string; label: string };

function SelectField({
  label,
  value,
  onChange,
  options,
  emptyOption,
}: {
  label: string;
  value: unknown;
  onChange: (value: string) => void;
  options: SelectOption[];
  emptyOption?: { value: string; label: string };
}) {
  const [open, setOpen] = useState(false);
  const entries =
    options.length > 0
      ? options.map((option) =>
          typeof option === "string" ? { value: option, label: option } : option,
        )
      : emptyOption
        ? [emptyOption]
        : [];
  const stringValue = String(value ?? entries[0]?.value ?? "");
  const selectedLabel =
    entries.find((option) => option.value === stringValue)?.label ?? stringValue;

  function choose(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
  }

  return (
    <div className="relative">
      <span className="text-xs uppercase tracking-[0.22em] text-[var(--gold)]/80">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="mt-2 flex h-11 w-full items-center justify-between rounded-sm border border-border bg-background/70 px-3 text-left text-sm text-foreground outline-none transition-colors hover:border-[var(--gold)]/40 focus:border-[var(--gold)]/70"
      >
        <span className="truncate">{selectedLabel}</span>
        <span className="ml-3 text-[var(--gold)]/70">▾</span>
      </button>
      {open && (
        <div className="absolute z-40 mt-1 max-h-64 w-full overflow-y-auto rounded-sm border border-[var(--gold)]/50 bg-background shadow-[0_16px_44px_oklch(0.08_0.01_95_/_0.45)]">
          {entries.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => choose(option.value)}
              className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                option.value === stringValue
                  ? "bg-[var(--gold)]/18 text-[var(--gold)]"
                  : "text-foreground hover:bg-[var(--gold)]/10"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
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
  label = "Imagem",
  help = "Use uma URL https, um caminho em /images/ ou envie uma imagem.",
  previewAlt = "Prévia da imagem",
  emptyLabel = "Sem imagem",
  ratio = "3/4",
}: {
  value: unknown;
  onChange: (value: string) => void;
  onUpload?: (file: File) => Promise<string>;
  label?: string;
  help?: string;
  previewAlt?: string;
  emptyLabel?: string;
  ratio?: string;
}) {
  const path = String(value ?? "").trim();
  const [previewFailed, setPreviewFailed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const isValidPath = !path || path.startsWith("/images/") || path.startsWith("https://");

  useEffect(() => {
    setPreviewFailed(false);
  }, [path]);

  async function uploadFile(file: File) {
    if (!onUpload) return;
    if (!isSupportedImageFile(file)) {
      setUploadMessage("Formato de imagem não aceito.");
      return;
    }

    setUploading(true);
    setUploadMessage("");
    try {
      const url = await onUpload(file);
      onChange(url);
      setUploadMessage("Imagem enviada.");
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "Falha ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLElement>) {
    const file = Array.from(event.clipboardData.files).find(isSupportedImageFile);
    if (file) {
      event.preventDefault();
      void uploadFile(file);
      return;
    }

    const text = event.clipboardData.getData("text").trim();
    if (text && (text.startsWith("https://") || text.startsWith("/images/"))) {
      event.preventDefault();
      onChange(text);
      setUploadMessage("Link colado.");
    }
  }

  async function pasteFromClipboard() {
    if (!navigator.clipboard) {
      setUploadMessage("Área de transferência indisponível.");
      return;
    }

    const clipboard = navigator.clipboard as Clipboard & {
      read?: () => Promise<Array<{ types: string[]; getType: (type: string) => Promise<Blob> }>>;
    };

    try {
      if (clipboard.read && onUpload) {
        const items = await clipboard.read();
        for (const item of items) {
          const type = item.types.find((itemType) => itemType.startsWith("image/"));
          if (!type) continue;

          const blob = await item.getType(type);
          await uploadFile(new File([blob], `imagem-colada.${mimeExtension(type)}`, { type }));
          return;
        }
      }

      const text = (await navigator.clipboard.readText()).trim();
      if (text) {
        onChange(text);
        setUploadMessage("Link colado.");
        return;
      }

      setUploadMessage("Nada para colar.");
    } catch {
      setUploadMessage("Não foi possível ler a área de transferência.");
    }
  }

  function removeImage() {
    onChange("");
    setPreviewFailed(false);
    setUploadMessage("Imagem removida.");
  }

  return (
    <div
      className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_150px]"
      onPaste={handlePaste}
    >
      <div>
        <Field label={label} value={value} onChange={onChange} help={help} />
        {onUpload && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label
              className={`${buttonBase} cursor-pointer border-border/80 bg-background/55 text-foreground hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/10`}
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Enviando..." : "Arquivo local"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                disabled={uploading}
                onChange={async (event) => {
                  const file = event.currentTarget.files?.[0];
                  event.currentTarget.value = "";
                  if (!file) return;

                  await uploadFile(file);
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => void pasteFromClipboard()}
              disabled={uploading}
              className={`${buttonBase} border-border/80 bg-background/55 text-foreground hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/10`}
            >
              <ClipboardPaste className="h-4 w-4" />
              Colar
            </button>
            {path && (
              <button
                type="button"
                onClick={removeImage}
                disabled={uploading}
                className={`${buttonBase} border-[var(--blood)]/60 bg-[var(--blood)]/10 text-[oklch(0.78_0.13_25)] hover:border-[var(--blood)]/80 hover:bg-[var(--blood)]/20`}
              >
                <Trash2 className="h-4 w-4" />
                Remover imagem
              </button>
            )}
            <span className="inline-flex h-10 items-center gap-2 rounded-sm border border-border/70 bg-background/35 px-3 text-sm text-muted-foreground">
              <LinkIcon className="h-4 w-4" />
              Link
            </span>
            {uploadMessage && <p className="text-sm text-muted-foreground">{uploadMessage}</p>}
          </div>
        )}
      </div>
      <div className="overflow-hidden rounded border border-border/70 bg-background/55">
        {path && !previewFailed ? (
          <img
            src={path}
            alt={previewAlt}
            className="aspect-[3/4] w-full object-cover"
            style={{ aspectRatio: ratio }}
            onError={(event) => {
              event.currentTarget.style.display = "none";
              setPreviewFailed(true);
            }}
          />
        ) : (
          <div
            className="flex aspect-[3/4] flex-col items-center justify-center gap-2 px-3 text-center text-xs text-muted-foreground"
            style={{ aspectRatio: ratio }}
          >
            <Image className="h-5 w-5 text-[var(--gold)]/70" />
            {path ? "Imagem não encontrada" : emptyLabel}
          </div>
        )}
      </div>
      {(!isValidPath || previewFailed) && (
        <p className="flex items-start gap-2 text-sm text-[oklch(0.75_0.12_25)] md:col-span-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {previewFailed
            ? "Não foi possível carregar a prévia. Verifique se o arquivo existe no caminho informado."
            : "Use um caminho em /images/ ou uma URL https."}
        </p>
      )}
    </div>
  );
}

function isSupportedImageFile(file: File) {
  return ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type);
}

function mimeExtension(mimeType: string) {
  if (mimeType === "image/jpeg") return "jpg";
  return mimeType.split("/")[1] || "webp";
}

function isImageArchiveType(value: unknown) {
  return value === "Imagem" || value === "Mapa" || value === "Handout";
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
    default:
      "border-[var(--gold)]/60 bg-[var(--gold)]/10 text-[var(--gold)] hover:bg-[var(--gold)]/20 hover:border-[var(--gold)]/80",
    danger:
      "border-[var(--blood)]/60 bg-[var(--blood)]/10 text-[oklch(0.78_0.13_25)] hover:bg-[var(--blood)]/20 hover:border-[var(--blood)]/80",
    quiet:
      "border-border/80 bg-background/55 text-foreground hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/10",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${buttonBase} ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

function DialogFrame({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-sm border border-border bg-background p-5 shadow-[0_18px_70px_oklch(0.08_0.01_95_/_0.55)]">
        <h2 className="font-display text-3xl text-foreground">{title}</h2>
        {description && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>}
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function NewItemDialog({
  sectionLabel,
  value,
  onChange,
  onCancel,
  onConfirm,
}: {
  sectionLabel: string;
  value: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  function submit(event: FormEvent) {
    event.preventDefault();
    onConfirm();
  }

  return (
    <DialogFrame
      title={`Novo ${sectionLabel}`}
      description="Defina o nome inicial do registro para já abrir a ficha no ponto certo."
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nome" value={value} onChange={onChange} />
        <div className="flex flex-wrap justify-end gap-2">
          <IconButton onClick={onCancel} variant="quiet">
            Cancelar
          </IconButton>
          <IconButton type="submit" disabled={!value.trim()}>
            Criar
          </IconButton>
        </div>
      </form>
    </DialogFrame>
  );
}

function ConfirmDeleteDialog({
  itemLabel,
  onCancel,
  onConfirm,
}: {
  itemLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <DialogFrame
      title="Remover registro"
      description={`Confirme a remoção de "${itemLabel}". Esta ação será salva imediatamente.`}
    >
      <div className="flex flex-wrap justify-end gap-2">
        <IconButton onClick={onCancel} variant="quiet">
          Cancelar
        </IconButton>
        <IconButton onClick={onConfirm} variant="danger">
          Remover
        </IconButton>
      </div>
    </DialogFrame>
  );
}

function ConfirmActionDialog({
  title,
  description,
  confirmLabel,
  variant = "danger",
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  variant?: "default" | "danger";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <DialogFrame title={title} description={description}>
      <div className="flex flex-wrap justify-end gap-2">
        <IconButton onClick={onCancel} variant="quiet">
          Cancelar
        </IconButton>
        <IconButton onClick={onConfirm} variant={variant}>
          {confirmLabel}
        </IconButton>
      </div>
    </DialogFrame>
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
                  className={`${buttonBase} h-9 shrink-0 border-border/80 bg-background/55 text-[var(--gold)] hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/10`}
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
                  className="mt-2 h-11 w-full appearance-none rounded-sm border border-border bg-background/70 px-3 text-sm text-foreground outline-none transition-colors focus:border-[var(--gold)]/70"
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
  archiveTypeOptions = defaultArchiveTypes,
}: {
  section: SectionKey;
  draft: DraftItem;
  setField: (field: string, value: unknown) => void;
  uploadImage?: (file: File) => Promise<string>;
  archiveTypeOptions?: string[];
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
              label="Raça"
              value={draft.people}
              onChange={(value) => setField("people", value)}
            />
            <Field
              label="Status"
              value={draft.status}
              onChange={(value) => setField("status", value)}
            />
            <Field
              label="Sombra"
              value={draft.shadow}
              onChange={(value) => setField("shadow", value)}
            />
          </div>
        </FormSection>

        <FormSection title="Imagem" description="Retrato público do personagem.">
          <ImagePathField
            value={draft.image}
            onChange={(value) => setField("image", value)}
            onUpload={uploadImage}
            previewAlt="Prévia da imagem do personagem"
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

        <FormSection title="Imagem" description="Retrato público do NPC.">
          <ImagePathField
            value={draft.image}
            onChange={(value) => setField("image", value)}
            onUpload={uploadImage}
            previewAlt="Prévia da imagem do NPC"
          />
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
              value={
                String(draft.type ?? "").trim() === "" ? otherArchiveTypeValue : draft.type
              }
              onChange={(value) =>
                setField("type", value === otherArchiveTypeValue ? "" : value)
              }
              options={[
                ...archiveTypeOptions,
                { value: otherArchiveTypeValue, label: "Outros" },
              ]}
            />
            {String(draft.type ?? "").trim() === "" && (
              <Field
                label="Tipo personalizado"
                value={draft.type}
                onChange={(value) => setField("type", value)}
              />
            )}
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
            {isImageArchiveType(draft.type) ? (
              <ImagePathField
                label="Imagem do arquivo"
                value={draft.link}
                onChange={(value) => setField("link", value)}
                onUpload={uploadImage}
                previewAlt="Prévia da imagem do arquivo"
                emptyLabel="Sem arquivo"
                ratio="16/10"
              />
            ) : (
              <Field
                label="Link externo"
                value={draft.link}
                onChange={(value) => setField("link", value)}
              />
            )}
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
  const [showResetDialog, setShowResetDialog] = useState(false);

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
    await onReplace(cloneContent(defaultCampaignContent), "Conteúdo original restaurado.");
    setMessage("Conteúdo original restaurado.");
    setShowResetDialog(false);
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
          <IconButton onClick={() => setShowResetDialog(true)} variant="danger">
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
      {showResetDialog && (
        <ConfirmActionDialog
          title="Restaurar original"
          description="Isso substitui todo o conteúdo editável pelo conteúdo original do projeto."
          confirmLabel="Restaurar"
          onCancel={() => setShowResetDialog(false)}
          onConfirm={() => void resetAll()}
        />
      )}
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
  const saveContentFn = useServerFn(saveCampaignContent);
  const uploadImageFn = useServerFn(uploadCharacterImage);
  const [content, setContent] = useState<CampaignContent>(() => cloneContent(initialContent));
  const [section, setSection] = useState<SectionKey>("sessions");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [draft, setDraft] = useState<DraftItem>(
    () => cloneContent(defaultCampaignContent).sessions[0] as DraftItem,
  );
  const [savedMessage, setSavedMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [contentRevision, setContentRevision] = useState(0);
  const [savedRevision, setSavedRevision] = useState(0);
  const [newItemName, setNewItemName] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [discardAction, setDiscardAction] = useState<(() => void) | null>(null);

  const activeMeta = useMemo(
    () => sections.find((entry) => entry.key === section) ?? sections[0],
    [section],
  );
  const archiveTypeOptions = useMemo(() => {
    const types = content.archive
      .map((item) => item.type.trim())
      .filter(Boolean);
    return Array.from(new Set([...defaultArchiveTypes, ...types]));
  }, [content.archive]);
  const items = getCollection(content, section);
  const activeItem = items[selectedIndex];
  const hasDraftChanges = useMemo(
    () => Boolean(activeItem) && JSON.stringify(draft) !== JSON.stringify(activeItem),
    [activeItem, draft],
  );
  const hasUnsavedChanges = hasDraftChanges || contentRevision !== savedRevision;
  const hasSelection = Boolean(activeItem);

  useEffect(() => {
    setContent(cloneContent(initialContent));
    setContentRevision(0);
    setSavedRevision(0);
  }, [initialContent]);

  useEffect(() => {
    const currentItems = getCollection(content, section);
    const safeIndex = Math.min(selectedIndex, Math.max(0, currentItems.length - 1));
    if (safeIndex !== selectedIndex) setSelectedIndex(safeIndex);
    setDraft(
      currentItems[safeIndex] ? { ...currentItems[safeIndex] } : createItem(section, content),
    );
  }, [content, section, selectedIndex]);

  function runOrConfirmDiscard(action: () => void) {
    if (!hasUnsavedChanges) {
      action();
      return;
    }

    setDiscardAction(() => action);
  }

  function selectSection(nextSection: SectionKey) {
    if (nextSection === section) return;
    runOrConfirmDiscard(() => {
      setSection(nextSection);
      setSelectedIndex(0);
      setSavedMessage("");
    });
  }

  function selectItem(nextIndex: number) {
    if (nextIndex === selectedIndex) return;
    runOrConfirmDiscard(() => {
      setSelectedIndex(nextIndex);
      setSavedMessage("");
    });
  }

  function handleRecordSelect(value: string) {
    if (value === "__create__") {
      openNewDialog();
      return;
    }

    selectItem(Number(value));
  }

  function setField(field: string, value: unknown) {
    setDraft((current) => ({ ...current, [field]: value }));
    setSavedMessage("");
  }

  function markContentDirty() {
    setContentRevision((current) => current + 1);
    setSavedMessage("");
  }

  async function persistContent(nextContent: CampaignContent, message: string) {
    setIsSaving(true);
    try {
      const result = await saveContentFn({ data: nextContent });
      setContent(result.content);
      setContentRevision((current) => {
        const nextRevision = current + 1;
        setSavedRevision(nextRevision);
        return nextRevision;
      });
      setSavedMessage(message);
    } finally {
      setIsSaving(false);
    }
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

  function openNewDialog() {
    runOrConfirmDiscard(() => {
      const nextItem = createItem(section, content);
      setNewItemName(String(nextItem.name ?? nextItem.title ?? ""));
      setShowNewDialog(true);
    });
  }

  function applyNameToItem(item: DraftItem, name: string): DraftItem {
    const cleanName = name.trim();
    if (section === "sessions") {
      return {
        ...item,
        title: cleanName,
        slug: uniqueSlug(
          cleanName,
          content.sessions.map((session) => session.slug),
        ),
      };
    }

    if (section === "characters") {
      return {
        ...item,
        name: cleanName,
        slug: uniqueSlug(
          cleanName,
          content.characters.map((character) => character.slug),
        ),
      };
    }

    if (section === "npcs") {
      return {
        ...item,
        name: cleanName,
        slug: uniqueSlug(
          cleanName,
          content.npcs.map((npc) => npc.slug),
        ),
      };
    }

    if (section === "archive") {
      return {
        ...item,
        title: cleanName,
        slug: uniqueSlug(
          cleanName,
          content.archive.map((item) => item.slug),
        ),
      };
    }

    return { ...item, title: cleanName };
  }

  function addItem() {
    const itemName = newItemName.trim();
    if (!itemName) return;

    const newItem = applyNameToItem(createItem(section, content), itemName);
    const next = cloneContent(content) as unknown as Record<SectionKey, DraftItem[]>;
    next[section] = [newItem, ...next[section]];
    setContent(next as unknown as CampaignContent);
    setDraft(newItem);
    setSelectedIndex(0);
    setShowNewDialog(false);
    markContentDirty();
    setSavedMessage("Novo registro criado. Salve para publicar.");
  }

  async function saveItem() {
    if (!hasUnsavedChanges || isSaving) return;
    const next = cloneContent(content) as unknown as Record<SectionKey, DraftItem[]>;
    if (hasSelection) {
      next[section] = [...next[section]];
      next[section][selectedIndex] = draft;
    }
    await persistContent(next as unknown as CampaignContent, "Alterações salvas.");
  }

  function openDeleteDialog() {
    if (!items[selectedIndex]) return;
    setShowDeleteDialog(true);
  }

  async function deleteItem() {
    if (!items[selectedIndex]) return;
    const next = cloneContent(content) as unknown as Record<SectionKey, DraftItem[]>;
    next[section] = next[section].filter((_, index) => index !== selectedIndex);
    setShowDeleteDialog(false);
    await persistContent(next as unknown as CampaignContent, "Registro removido.");
    setSelectedIndex(0);
  }

  function renderActionButtons() {
    return (
      <>
        <IconButton onClick={openNewDialog} variant="quiet" disabled={isSaving}>
          <Plus className="h-4 w-4" />
          Novo
        </IconButton>
        <IconButton onClick={openDeleteDialog} variant="danger" disabled={!hasSelection || isSaving}>
          <Trash2 className="h-4 w-4" />
          Remover
        </IconButton>
        <IconButton onClick={saveItem} disabled={!hasUnsavedChanges || isSaving}>
          <Save className="h-4 w-4" />
          {isSaving ? "Salvando..." : "Salvar"}
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
              className={`w-full appearance-none rounded-sm border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold)]/55 ${
                section === entry.key
                  ? "border-[var(--gold)]/60 bg-[var(--gold)]/10"
                  : "border-border/70 bg-background/35 hover:border-[var(--gold)]/40 hover:bg-[var(--gold)]/5"
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
            <SelectField
              label="Registro"
              value={items.length === 0 ? "__create__" : String(selectedIndex)}
              onChange={handleRecordSelect}
              options={items.map((item, index) => ({
                value: String(index),
                label: getItemLabel(section, item, index),
              }))}
              emptyOption={{ value: "__create__", label: "Criar novo" }}
            />
            <div className="rounded border border-border/70 bg-background/35 p-3 text-sm text-muted-foreground">
              {items.length === 0 ? (
                "Nenhum registro nesta seção. Selecione Criar novo ou use o botão Novo."
              ) : (
                <>
                  Este editor cobre todos os campos usados pelas páginas públicas. Para listas, use
                  uma linha por item. Slugs alteram as URLs de detalhe.
                </>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="rounded border border-border/70 p-6 text-center text-muted-foreground">
              Nenhum registro nesta seção. Use "Criar novo" para começar.
            </div>
          ) : (
            <SectionForm
              section={section}
              draft={draft}
              setField={setField}
              uploadImage={uploadImage}
              archiveTypeOptions={archiveTypeOptions}
            />
          )}

          {savedMessage && <p className="mt-4 text-sm text-[var(--gold)]">{savedMessage}</p>}
        </ChronicleCard>
      </div>

      <BackupPanel content={content} onReplace={persistContent} />
      {showNewDialog && (
        <NewItemDialog
          sectionLabel={getSectionSingularLabel(section)}
          value={newItemName}
          onChange={setNewItemName}
          onCancel={() => setShowNewDialog(false)}
          onConfirm={addItem}
        />
      )}
      {showDeleteDialog && activeItem && (
        <ConfirmDeleteDialog
          itemLabel={getItemLabel(section, activeItem, selectedIndex)}
          onCancel={() => setShowDeleteDialog(false)}
          onConfirm={deleteItem}
        />
      )}
      {discardAction && (
        <ConfirmActionDialog
          title="Descartar alterações"
          description="Existem alterações não salvas neste registro. Deseja descartá-las e continuar?"
          confirmLabel="Descartar"
          onCancel={() => setDiscardAction(null)}
          onConfirm={() => {
            const action = discardAction;
            setDiscardAction(null);
            action();
          }}
        />
      )}
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
