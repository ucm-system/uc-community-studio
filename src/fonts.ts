const embeddedFiles = new Map<string, Promise<string>>();

function faceKey(family: string, weight: string, style: string, range: string) {
  return [family, weight, style, range]
    .map((value) => value.replace(/[\s"']/g, "").toLowerCase())
    .join("|");
}

async function fontDataUrl(url: string) {
  let pending = embeddedFiles.get(url);
  if (!pending) {
    pending = fetch(url, { cache: "force-cache" })
      .then(async (response) => {
        if (!response.ok) throw new Error("字体读取失败，请稍后再次导出。");
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("无法将字体嵌入海报。"));
          reader.readAsDataURL(blob);
        });
      })
      .catch((error) => {
        embeddedFiles.delete(url);
        throw error;
      });
    embeddedFiles.set(url, pending);
  }
  return pending;
}

/**
 * Embed the font faces already used by the preview. Fontsource's CJK stylesheet
 * declares over a hundred Unicode subsets; html-to-image otherwise downloads
 * every subset. Our bundled same-origin stylesheets use one WOFF2 URL per face.
 * Re-select on every export so newly typed characters bring their subset along.
 */
export async function embedLoadedFonts(doc: Document) {
  await doc.fonts.ready;
  const loaded = new Set(
    Array.from(doc.fonts)
      .filter((face) => face.status === "loaded")
      .map((face) =>
        faceKey(face.family, face.weight, face.style, face.unicodeRange),
      ),
  );
  const rules = Array.from(doc.styleSheets).flatMap((sheet) =>
    Array.from(sheet.cssRules).filter(
      (rule): rule is CSSFontFaceRule => rule.type === CSSRule.FONT_FACE_RULE,
    ),
  );
  return (
    await Promise.all(
      rules
        .filter((rule) =>
          loaded.has(
            faceKey(
              rule.style.fontFamily,
              rule.style.fontWeight,
              rule.style.fontStyle,
              rule.style.getPropertyValue("unicode-range"),
            ),
          ),
        )
        .map(async (rule) => {
          const source = /url\((['"]?)(.*?)\1\)/.exec(
            rule.style.getPropertyValue("src"),
          );
          if (!source || source[2].startsWith("data:")) return rule.cssText;
          const url = new URL(
            source[2],
            rule.parentStyleSheet?.href || doc.baseURI,
          ).href;
          return rule.cssText.replace(
            source[0],
            `url("${await fontDataUrl(url)}")`,
          );
        }),
    )
  ).join("\n");
}
