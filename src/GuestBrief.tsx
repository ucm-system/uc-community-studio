import { useRef, useState } from "react";
import {
  CheckIcon,
  ClipboardTextIcon,
  CopyIcon,
  XIcon,
} from "@phosphor-icons/react";
import { GUEST_BRIEF } from "./guestTemplate";
import "./guest.css";

export function GuestBrief({ disabled = false }: { disabled?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const text = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "error">(
    "idle",
  );

  async function copy() {
    setStatus("copying");
    try {
      await navigator.clipboard.writeText(GUEST_BRIEF);
      setStatus("copied");
    } catch {
      setStatus("error");
      text.current?.focus();
      text.current?.select();
    }
  }

  return (
    <>
      <button
        className="quiet-button guest-template-button"
        disabled={disabled}
        aria-label="嘉宾填写模板"
        title="嘉宾填写模板"
        onClick={() => {
          setStatus("idle");
          dialog.current?.showModal();
        }}
      >
        <ClipboardTextIcon size={18} />
        嘉宾填写模板
      </button>
      <dialog
        className="guest-dialog"
        ref={dialog}
        aria-labelledby="guest-brief-title"
      >
        <header className="guest-dialog-header">
          <div>
            <h2 id="guest-brief-title">给嘉宾的填写模板</h2>
            <p>待填写内容和完整示例一起复制，可直接粘贴发给嘉宾。</p>
          </div>
          <button
            className="icon-button"
            aria-label="关闭嘉宾填写模板"
            onClick={() => dialog.current?.close()}
          >
            <XIcon size={21} />
          </button>
        </header>
        <textarea
          ref={text}
          aria-label="嘉宾填写内容"
          value={GUEST_BRIEF}
          readOnly
          spellCheck={false}
        />
        <footer className="guest-dialog-footer">
          <p role="status">
            {status === "copied"
              ? "已复制模板与示例，可直接粘贴发送。"
              : status === "error"
                ? "浏览器未允许复制，已选中文本，请手动复制。"
                : "示例只用于说明格式；日期、主讲人等以嘉宾回填为准。"}
          </p>
          <button
            className="primary-button"
            onClick={copy}
            disabled={status === "copying"}
          >
            {status === "copied" ? (
              <CheckIcon size={18} />
            ) : (
              <CopyIcon size={18} />
            )}
            {status === "copying" ? "复制中…" : "复制模板与示例"}
          </button>
        </footer>
      </dialog>
    </>
  );
}
