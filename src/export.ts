import { toBlob, getFontEmbedCSS } from "html-to-image";
import { FORMATS, type Draft } from "./model";

export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function waitForPoster(element: HTMLElement) {
  await document.fonts.ready;
  await Promise.all(
    Array.from(element.querySelectorAll("img")).map((image) => image.decode()),
  );
}

export function findOverflow(element: HTMLElement) {
  return [
    ...new Set(
      Array.from(element.querySelectorAll<HTMLElement>("[data-check]"))
        .filter(
          (node) =>
            node.scrollHeight > node.clientHeight + 2 ||
            (node.dataset.check !== "整体版式" &&
              node.scrollWidth > node.clientWidth + 2),
        )
        .map((node) => node.dataset.check!),
    ),
  ];
}

let embeddedFonts: Promise<string> | undefined;

export async function exportPoster(element: HTMLElement, draft: Draft) {
  await waitForPoster(element);
  const overflow = findOverflow(element);
  if (overflow.length)
    throw new Error(
      `内容超出空间：${overflow.join("、")}。请缩短内容或调整标题字号后导出。`,
    );
  if (draft.kind === "event" && !draft.event.title.trim())
    throw new Error("请先填写分享标题。");
  const format = FORMATS[draft.format];
  // Embed local font files in the exported SVG; relying on OS fonts changes CJK line breaks.
  embeddedFonts ??= getFontEmbedCSS(element).catch((error) => {
    embeddedFonts = undefined;
    throw error;
  });
  const blob = await toBlob(element, {
    width: format.width,
    height: format.height,
    pixelRatio: format.pixels,
    backgroundColor: "#ffffff",
    fontEmbedCSS: await embeddedFonts,
    style: { transform: "none", margin: "0" },
  });
  if (!blob) throw new Error("图片生成失败，请保持页面打开并再次导出。");
  return blob;
}

export async function readImage(file: File) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
    throw new Error("请选择 PNG、JPG 或 WebP 图片。");
  if (file.size > 8 * 1024 * 1024)
    throw new Error("图片大于 8 MB，请压缩后再上传。");
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("无法读取图片，请重新选择。"));
    reader.readAsDataURL(file);
  });
  const image = new Image();
  image.src = data;
  await image.decode();
  return data;
}
