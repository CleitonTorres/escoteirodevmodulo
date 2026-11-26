import "server-only";

const maxFileCount = 10;
const maxFileBytes = 10 * 1024 * 1024;
const maxTotalBytes = 30 * 1024 * 1024;
const uploadTimeoutMs = 60_000;

const formats = [
  { extensions: ["pdf"], type: "application/pdf", signature: [0x25, 0x50, 0x44, 0x46, 0x2d] },
  { extensions: ["jpg", "jpeg"], type: "image/jpeg", signature: [0xff, 0xd8, 0xff] },
  { extensions: ["png"], type: "image/png", signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { extensions: ["webp"], type: "image/webp", signature: [0x52, 0x49, 0x46, 0x46] },
];

type FileUploadErrorCode = "INVALID_FILES" | "UPLOAD_CONFIG" | "UPLOAD_TIMEOUT" | "UPLOAD_NETWORK" |
  "UPLOAD_RATE_LIMIT" | "UPLOAD_HTTP" | "UPLOAD_RESPONSE";

export class FileUploadError extends Error {
  constructor(readonly code: FileUploadErrorCode, message: string, readonly status?: number) {
    super(message);
    this.name = "FileUploadError";
  }
}

type FileUploadResult = {
  message: string;
  urlsImagens: string[];
};

function httpsUrl(value: string | undefined) {
  if (!value || !/^https:\/\//i.test(value)) return;
  try {
    const url = new URL(value);
    if (!url.username && !url.password) return url;
  } catch {
    return undefined;
  }
}

function matchesSignature(bytes: Uint8Array, signature: readonly number[], offset = 0) {
  return signature.every((byte, index) => bytes[index + offset] === byte);
}

async function validateFile(file: File) {
  const extension = /\.([a-z]+)$/i.exec(file.name)?.[1].toLowerCase();
  const format = formats.find(({ extensions }) => extension && extensions.includes(extension));
  if (!format || /[\\/\p{Cc}]/u.test(file.name)) {
    throw new FileUploadError("INVALID_FILES", "Use arquivos PDF, JPG, PNG ou WebP com nomes válidos.");
  }

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!matchesSignature(bytes, format.signature) ||
      (format.type === "image/webp" && !matchesSignature(bytes, [0x57, 0x45, 0x42, 0x50], 8))) {
    throw new FileUploadError("INVALID_FILES", "O conteúdo do arquivo não corresponde à extensão.");
  }

  return file.type === format.type ? file : new File([file], file.name, { type: format.type });
}

export async function uploadFiles(files: readonly File[]): Promise<FileUploadResult> {
  if (files.length === 0 || files.length > maxFileCount) {
    throw new FileUploadError("INVALID_FILES", "Envie de 1 a 10 arquivos por requisição.");
  }

  let totalBytes = 0;
  for (const file of files) {
    if (!(file instanceof File) || file.size === 0 || file.size > maxFileBytes) {
      throw new FileUploadError("INVALID_FILES", "Cada arquivo deve ter conteúdo e até 10 MB.");
    }
    totalBytes += file.size;
  }
  if (totalBytes > maxTotalBytes) {
    throw new FileUploadError("INVALID_FILES", "O total dos arquivos deve ter até 30 MB.");
  }

  const { BUCKET_NAME, DESTINATION_FOLDER, URL_FILES_APLOAD, AUTORIZATION_TOKEN_COQUEIRAL } = process.env;
  const endpoint = httpsUrl(URL_FILES_APLOAD);
  const token = AUTORIZATION_TOKEN_COQUEIRAL?.trim().replace(/^Bearer[ \t]+/i, "");
  if (!BUCKET_NAME || !DESTINATION_FOLDER || !endpoint || !token || /[^!-~]/.test(token)) {
    throw new FileUploadError("UPLOAD_CONFIG", "A configuração do serviço de upload está incompleta ou inválida.");
  }

  const validatedFiles = await Promise.all(files.map(validateFile));
  const form = new FormData();
  form.set("bucketName", BUCKET_NAME);
  form.set("destinationFolder", DESTINATION_FOLDER);
  validatedFiles.forEach((file, index) => form.set(`file-${index}`, file));

  const signal = AbortSignal.timeout(uploadTimeoutMs);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
      cache: "no-store",
      redirect: "error",
      signal,
    });

    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined);
      if (response.status === 429) {
        throw new FileUploadError("UPLOAD_RATE_LIMIT", "Limite de envios atingido. Tente novamente em instantes.", 429);
      }
      throw new FileUploadError("UPLOAD_HTTP", "O serviço de upload recusou o envio.", response.status);
    }

    const data: { message?: unknown; urlsImagens?: unknown } | null = await response.json().catch(() => null);
    if (typeof data?.message !== "string" || !data.message.trim() || !Array.isArray(data.urlsImagens) ||
        data.urlsImagens.length !== validatedFiles.length ||
        !data.urlsImagens.every((url: unknown) => typeof url === "string" && httpsUrl(url))) {
      throw new FileUploadError("UPLOAD_RESPONSE", "O serviço de upload retornou uma resposta inválida.", response.status);
    }

    return { message: data.message, urlsImagens: data.urlsImagens };
  } catch (error) {
    if (signal.aborted) {
      throw new FileUploadError("UPLOAD_TIMEOUT", "O serviço de upload demorou para responder.");
    }
    if (error instanceof FileUploadError) throw error;
    throw new FileUploadError("UPLOAD_NETWORK", "Falha de conexão com o serviço de upload.");
  }
}
