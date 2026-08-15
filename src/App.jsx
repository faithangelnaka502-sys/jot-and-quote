import React, { useState, useEffect, useMemo, useRef } from "react";
import { Star, Plus, X, Search, Quote as QuoteIcon, PenLine, Tag as TagIcon, Share2, User, Image as ImageIcon, Copy, Check } from "lucide-react";

const STORAGE_KEY = "entries";
const PROFILE_KEY = "profile";
const THEME_KEY = "theme";
const FONT_KEY = "font";
const ONBOARD_KEY = "onboarded";

const FONTS = {
  serif: { label: "Classic", family: "'Georgia', serif" },
  sans: { label: "Modern", family: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  mono: { label: "Typewriter", family: "'Courier New', Courier, monospace" },
  round: { label: "Rounded", family: "'Trebuchet MS', 'Verdana', sans-serif" },
};
const DEFAULT_FONT = "serif";

const THEMES = {
  paper: {
    label: "Paper",
    swatch: "#B5654A",
    paper: "#F6F1E7",
    paperEdge: "#E9E0CC",
    card: "#FFFEFB",
    ink: "#2B2620",
    inkSoft: "#6B6255",
    clay: "#B5654A",
    moss: "#5C6B4F",
    gold: "#B8923C",
  },
  dusk: {
    label: "Dusk",
    swatch: "#8A6FA3",
    paper: "#F1EDF5",
    paperEdge: "#E0D7E9",
    card: "#FCFBFD",
    ink: "#2E2A38",
    inkSoft: "#6E6579",
    clay: "#8A6FA3",
    moss: "#5C6B4F",
    gold: "#B8923C",
  },
  sage: {
    label: "Sage",
    swatch: "#5C7A5E",
    paper: "#EFF2ED",
    paperEdge: "#DCE3D8",
    card: "#FBFCFA",
    ink: "#26302A",
    inkSoft: "#63715F",
    clay: "#B5654A",
    moss: "#5C7A5E",
    gold: "#B8923C",
  },
  ink: {
    label: "Ink",
    swatch: "#D9A066",
    paper: "#211D19",
    paperEdge: "#3A342C",
    card: "#2A2521",
    ink: "#F1EAE0",
    inkSoft: "#A79A8A",
    clay: "#D9A066",
    moss: "#8FA382",
    gold: "#D9A066",
  },
  sky: {
    label: "Sky",
    swatch: "#5B9BC7",
    paper: "#EAF4FB",
    paperEdge: "#D3E8F5",
    card: "#FCFEFF",
    ink: "#1F3A4D",
    inkSoft: "#587085",
    clay: "#4E8FC0",
    moss: "#5C6B4F",
    gold: "#B8923C",
  },
  blossom: {
    label: "Blossom",
    swatch: "#D97A93",
    paper: "#FBEEF2",
    paperEdge: "#F5DCE4",
    card: "#FFFAFB",
    ink: "#4A2A34",
    inkSoft: "#8A5D6A",
    clay: "#D97A93",
    moss: "#5C6B4F",
    gold: "#B8923C",
  },
  lilac: {
    label: "Lilac",
    swatch: "#9B7CC0",
    paper: "#F3EEFA",
    paperEdge: "#E6DBF3",
    card: "#FCFBFF",
    ink: "#372C4A",
    inkSoft: "#6E5F86",
    clay: "#9B7CC0",
    moss: "#5C6B4F",
    gold: "#B8923C",
  },
  butter: {
    label: "Butter",
    swatch: "#D6B23E",
    paper: "#FBF6E6",
    paperEdge: "#F3E8C4",
    card: "#FFFDF6",
    ink: "#4A3E1C",
    inkSoft: "#8A7A46",
    clay: "#D6B23E",
    moss: "#5C6B4F",
    gold: "#B8923C",
  },
  navy: {
    label: "Navy",
    swatch: "#7FA0DA",
    paper: "#10192B",
    paperEdge: "#24314A",
    card: "#16213A",
    ink: "#E8ECF5",
    inkSoft: "#9AA8C2",
    clay: "#7FA0DA",
    moss: "#7FA88F",
    gold: "#D9A066",
  },
  forest: {
    label: "Forest",
    swatch: "#6FA57C",
    paper: "#10201A",
    paperEdge: "#23392E",
    card: "#16281F",
    ink: "#E7F0EA",
    inkSoft: "#9CB6A7",
    clay: "#D9A066",
    moss: "#6FA57C",
    gold: "#D9A066",
  },
};
const DEFAULT_THEME = "paper";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function EmptyState({ filter, T }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
        style={{ background: T.paperEdge }}
      >
        <PenLine size={22} color={T.inkSoft} strokeWidth={1.5} />
      </div>
      <p style={{ color: T.ink, fontFamily: "'Georgia', serif" }} className="text-lg mb-1">
        {filter === "all" ? "Nothing here yet" : `No ${filter} yet`}
      </p>
      <p style={{ color: T.inkSoft }} className="text-sm max-w-[220px]">
        Tap the pencil below to jot a thought or save a quote worth remembering.
      </p>
    </div>
  );
}

function Composer({ onSave, onClose, T, F, editing }) {
  const [type, setType] = useState(editing?.type || "note");
  const [text, setText] = useState(editing?.text || "");
  const [source, setSource] = useState(editing?.source || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState(editing?.tags || []);

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, "");
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const removeTag = (t) => setTags(tags.filter((x) => x !== t));

  const canSave = text.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: editing?.id || uid(),
      type,
      text: text.trim(),
      source: type === "quote" ? source.trim() : "",
      tags,
      favorite: editing?.favorite || false,
      createdAt: editing?.createdAt || Date.now(),
      updatedAt: editing ? Date.now() : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(43,38,32,0.45)" }}
        onClick={onClose}
      />
      <div
        className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 pb-6 max-h-[88vh] overflow-y-auto"
        style={{ background: T.paper, boxShadow: "0 -8px 30px rgba(0,0,0,0.2)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setType("note")}
              className="px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-colors"
              style={{
                background: type === "note" ? T.ink : "transparent",
                color: type === "note" ? T.paper : T.inkSoft,
                border: `1px solid ${type === "note" ? T.ink : T.paperEdge}`,
              }}
            >
              <PenLine size={14} /> Note
            </button>
            <button
              onClick={() => setType("quote")}
              className="px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-colors"
              style={{
                background: type === "quote" ? T.clay : "transparent",
                color: type === "quote" ? T.paper : T.inkSoft,
                border: `1px solid ${type === "quote" ? T.clay : T.paperEdge}`,
              }}
            >
              <QuoteIcon size={14} /> Quote
            </button>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ color: T.inkSoft }}>
            <X size={20} />
          </button>
        </div>

        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={type === "quote" ? "The quote itself..." : "What's on your mind..."}
          rows={4}
          className="w-full bg-transparent outline-none resize-none mb-3"
          style={{
            color: T.ink,
            fontFamily: F.family,
            fontStyle: type === "quote" ? "italic" : "normal",
            fontSize: "17px",
            lineHeight: 1.5,
            borderBottom: `1px solid ${T.paperEdge}`,
            paddingBottom: "10px",
          }}
        />

        {type === "quote" && (
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="— who said it (optional)"
            className="w-full bg-transparent outline-none mb-3 text-sm"
            style={{ color: T.inkSoft, borderBottom: `1px solid ${T.paperEdge}`, paddingBottom: "8px" }}
          />
        )}

        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((t) => (
            <span
              key={t}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
              style={{ background: T.paperEdge, color: T.ink }}
            >
              #{t}
              <button onClick={() => removeTag(t)} aria-label={`Remove tag ${t}`}>
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 mb-5">
          <TagIcon size={15} color={T.inkSoft} />
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="add a tag, press enter"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: T.ink }}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full py-3 rounded-2xl text-sm font-medium transition-opacity"
          style={{
            background: T.ink,
            color: T.paper,
            opacity: canSave ? 1 : 0.35,
          }}
        >
          {editing ? "Save changes" : `Save ${type === "quote" ? "quote" : "note"}`}
        </button>
      </div>
    </div>
  );
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawAvatarCircle(ctx, cx, cy, r, initial, accent, T) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = T.paperEdge;
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.font = `600 ${Math.floor(r * 0.9)}px Helvetica, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initial, cx, cy + 2);
  ctx.restore();
}

function drawCard(canvas, entry, profileName, profileHandle, T, fontFamily) {
  const W = 1080;
  const H = 1080;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const bg = T.paper;
  const fg = T.ink;
  const dim = T.inkSoft;
  const accent = entry.type === "quote" ? T.clay : T.moss;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const marginX = 90;
  const displayName = profileName || "You";
  const handle = "@" + (profileHandle || (profileName ? profileName.toLowerCase().replace(/\s+/g, "") : "jotandquote"));

  // header: avatar + name + handle
  const avatarR = 42;
  const avatarCx = marginX + avatarR;
  const avatarCy = 130;
  drawAvatarCircle(ctx, avatarCx, avatarCy, avatarR, displayName.trim()[0]?.toUpperCase() || "Y", accent, T);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = fg;
  ctx.font = `600 34px ${fontFamily}`;
  ctx.fillText(displayName, avatarCx + avatarR + 22, avatarCy - 6);
  ctx.fillStyle = dim;
  ctx.font = `30px ${fontFamily}`;
  ctx.fillText(handle, avatarCx + avatarR + 22, avatarCy + 34);

  // main text, starts a clear gap below the header
  ctx.fillStyle = fg;
  ctx.font = `44px ${fontFamily}`;
  const maxWidth = W - marginX * 2;
  const lines = wrapText(ctx, entry.text, maxWidth);
  const lineHeight = 62;
  let y = avatarCy + avatarR + 90;
  for (const line of lines) {
    ctx.fillText(line, marginX, y);
    y += lineHeight;
  }

  if (entry.source) {
    y += 10;
    ctx.font = `32px ${fontFamily}`;
    ctx.fillStyle = dim;
    ctx.fillText("— " + entry.source, marginX, y);
  }

  // divider + footer
  ctx.strokeStyle = T.paperEdge;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(marginX, H - 90);
  ctx.lineTo(W - marginX, H - 90);
  ctx.stroke();

  ctx.font = `26px ${fontFamily}`;
  ctx.fillStyle = dim;
  ctx.fillText("Jot & Quote", marginX, H - 50);
}

function ShareSheet({ entry, profileName, profileHandle, onClose, T, F }) {
  const canvasRef = useRef(null);
  const [imgReady, setImgReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      drawCard(canvasRef.current, entry, profileName, profileHandle, T, F.family);
      setImgReady(true);
    }
  }, [entry, profileName, profileHandle, T, F]);

  const shareText = entry.source ? `"${entry.text}" — ${entry.source}` : entry.text;
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;
  const [imgSaved, setImgSaved] = useState(false);

  const shareAsText = async () => {
    if (canNativeShare) {
      try {
        await navigator.share({ text: shareText });
        onClose();
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return; // user cancelled, do nothing
        // otherwise fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // last resort: select-friendly prompt
      window.prompt("Copy this text:", shareText);
    }
  };

  const shareAsImage = async () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "jot-and-quote.png", { type: "image/png" });
      let shared = false;
      if (canNativeShare && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          onClose();
          shared = true;
        } catch (e) {
          if (e && e.name === "AbortError") return; // user cancelled
        }
      }
      if (!shared) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "jot-and-quote.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setImgSaved(true);
        setTimeout(() => setImgSaved(false), 1800);
      }
    }, "image/png");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0" style={{ background: "rgba(43,38,32,0.5)" }} onClick={onClose} />
      <div
        className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-5 pb-6"
        style={{ background: T.paper, boxShadow: "0 -8px 30px rgba(0,0,0,0.2)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ color: T.ink, fontFamily: "'Georgia', serif" }} className="text-lg">
            Share
          </h3>
          <button onClick={onClose} aria-label="Close" style={{ color: T.inkSoft }}>
            <X size={20} />
          </button>
        </div>

        <div
          className="rounded-xl overflow-hidden mb-4"
          style={{ border: `1px solid ${T.paperEdge}`, aspectRatio: "1/1" }}
        >
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={shareAsImage}
            disabled={!imgReady}
            className="w-full py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2"
            style={{ background: T.ink, color: T.paper }}
          >
            {imgSaved ? <Check size={16} /> : <ImageIcon size={16} />}
            {imgSaved ? (canNativeShare ? "Shared" : "Saved to your device") : "Share as image"}
          </button>
          <button
            onClick={shareAsText}
            className="w-full py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2"
            style={{ background: T.card, color: T.ink, border: `1px solid ${T.paperEdge}` }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Share as text"}
          </button>
          {!canNativeShare && (
            <p className="text-xs text-center mt-1" style={{ color: T.inkSoft }}>
              Your browser doesn't support direct sharing here — image downloads or text copies instead, ready to paste into WhatsApp, Instagram, etc.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileSheet({ profile, onSave, onClose, T, theme, onThemeChange, font, onFontChange }) {
  const [name, setName] = useState(profile?.name || "");
  const [handle, setHandle] = useState(profile?.handle || "");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0" style={{ background: "rgba(43,38,32,0.5)" }} onClick={onClose} />
      <div
        className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-5 pb-6 max-h-[88vh] overflow-y-auto"
        style={{ background: T.paper, boxShadow: "0 -8px 30px rgba(0,0,0,0.2)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ color: T.ink, fontFamily: "'Georgia', serif" }} className="text-lg">
            Your profile
          </h3>
          <button onClick={onClose} aria-label="Close" style={{ color: T.inkSoft }}>
            <X size={20} />
          </button>
        </div>
        <p className="text-xs mb-4" style={{ color: T.inkSoft }}>
          This stays on this device only — it's used to sign your shared quote cards. No login yet, no sync across devices.
        </p>
        <div
          className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 mb-3"
          style={{ background: T.card, border: `1px solid ${T.paperEdge}` }}
        >
          <User size={15} color={T.inkSoft} />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: T.ink }}
          />
        </div>
        <div
          className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 mb-5"
          style={{ background: T.card, border: `1px solid ${T.paperEdge}` }}
        >
          <span style={{ color: T.inkSoft, fontSize: "15px" }}>@</span>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
            placeholder="yourhandle"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: T.ink }}
          />
        </div>

        <p className="text-xs mb-2.5 uppercase tracking-wide" style={{ color: T.inkSoft, letterSpacing: "0.06em" }}>
          Colour
        </p>
        <div className="grid grid-cols-4 gap-x-2 gap-y-3 mb-5">
          {Object.entries(THEMES).map(([key, th]) => (
            <button
              key={key}
              onClick={() => onThemeChange(key)}
              aria-label={th.label}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: th.paper,
                  border: `2px solid ${theme === key ? th.swatch : th.paperEdge}`,
                  boxShadow: theme === key ? `0 0 0 2px ${T.paper}, 0 0 0 4px ${th.swatch}` : "none",
                }}
              >
                <span
                  className="w-4.5 h-4.5 rounded-full"
                  style={{ background: th.swatch, width: "18px", height: "18px" }}
                />
              </span>
              <span className="text-[11px]" style={{ color: theme === key ? T.ink : T.inkSoft }}>
                {th.label}
              </span>
            </button>
          ))}
        </div>

        <p className="text-xs mb-2.5 uppercase tracking-wide" style={{ color: T.inkSoft, letterSpacing: "0.06em" }}>
          Font
        </p>
        <div className="flex flex-col gap-2 mb-5">
          {Object.entries(FONTS).map(([key, f]) => (
            <button
              key={key}
              onClick={() => onFontChange(key)}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm flex items-center justify-between"
              style={{
                background: font === key ? T.ink : T.card,
                color: font === key ? T.paper : T.ink,
                border: `1px solid ${font === key ? T.ink : T.paperEdge}`,
                fontFamily: f.family,
              }}
            >
              <span>{f.label}</span>
              <span style={{ fontSize: "13px", opacity: 0.8 }}>Aa</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => onSave({ name: name.trim(), handle: handle.trim() })}
          className="w-full py-3 rounded-2xl text-sm font-medium"
          style={{ background: T.ink, color: T.paper }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

function EntryCard({ entry, onToggleFavorite, onDelete, onShare, onEdit, T, F }) {
  const isQuote = entry.type === "quote";
  const date = new Date(entry.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="rounded-2xl p-4 mb-3 relative"
      style={{
        background: T.card,
        border: `1px solid ${T.paperEdge}`,
        borderLeft: `3px solid ${isQuote ? T.clay : T.moss}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {isQuote && (
            <QuoteIcon size={16} color={T.clay} className="mb-1" fill={T.clay} />
          )}
          <p
            style={{
              color: T.ink,
              fontFamily: F.family,
              fontStyle: isQuote ? "italic" : "normal",
              fontSize: "16px",
              lineHeight: 1.5,
            }}
          >
            {entry.text}
          </p>
          {entry.source && (
            <p className="text-sm mt-1" style={{ color: T.inkSoft }}>
              — {entry.source}
            </p>
          )}
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {entry.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: T.paperEdge, color: T.inkSoft }}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
          <p className="text-xs mt-2" style={{ color: T.inkSoft, opacity: 0.7 }}>
            {date}
            {entry.updatedAt ? " · edited" : ""}
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button onClick={() => onToggleFavorite(entry.id)} aria-label="Toggle favorite">
            <Star
              size={18}
              color={entry.favorite ? T.gold : T.inkSoft}
              fill={entry.favorite ? T.gold : "none"}
              strokeWidth={1.5}
            />
          </button>
          <button onClick={() => onEdit(entry)} aria-label="Edit">
            <PenLine size={16} color={T.inkSoft} strokeWidth={1.5} />
          </button>
          <button onClick={() => onShare(entry)} aria-label="Share">
            <Share2 size={16} color={T.inkSoft} strokeWidth={1.5} />
          </button>
          <button onClick={() => onDelete(entry.id)} aria-label="Delete" style={{ opacity: 0.5 }}>
            <X size={15} color={T.inkSoft} />
          </button>
        </div>
      </div>
    </div>
  );
}

function OnboardingDemo({ T, onDone }) {
  const [step, setStep] = useState(0);
  const slides = [
    {
      title: "Welcome to Jot & Quote",
      body: "A simple place to keep short notes and quotes worth remembering, side by side.",
    },
    {
      title: "Add a note or quote",
      body: "Tap the + button in the bottom right anytime. Choose Note or Quote, add tags if you like, and save.",
    },
    {
      title: "Star, edit, share",
      body: "Star your favorites, tap the pencil to edit anything later, and share as text or a styled image.",
    },
    {
      title: "Make it yours",
      body: "Tap the circle top-right to set your name, handle, colour palette, and font.",
    },
  ];
  const isLast = step === slides.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0" style={{ background: "rgba(43,38,32,0.55)" }} />
      <div
        className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 pb-6"
        style={{ background: T.paper, boxShadow: "0 -8px 30px rgba(0,0,0,0.2)" }}
      >
        <div className="flex gap-1.5 mb-5">
          {slides.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full"
              style={{ background: i <= step ? T.clay : T.paperEdge }}
            />
          ))}
        </div>
        <h3 style={{ color: T.ink, fontFamily: "'Georgia', serif" }} className="text-xl mb-2">
          {slides[step].title}
        </h3>
        <p style={{ color: T.inkSoft }} className="text-sm mb-8 leading-relaxed">
          {slides[step].body}
        </p>
        <div className="flex items-center justify-between">
          <button
            onClick={onDone}
            className="text-sm"
            style={{ color: T.inkSoft }}
          >
            Skip
          </button>
          <button
            onClick={() => (isLast ? onDone() : setStep((s) => s + 1))}
            className="px-5 py-2.5 rounded-full text-sm font-medium"
            style={{ background: T.ink, color: T.paper }}
          >
            {isLast ? "Get started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [filter, setFilter] = useState("all"); // all | note | quote | favorite
  const [activeTag, setActiveTag] = useState(null);
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [shareEntry, setShareEntry] = useState(null);
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [font, setFont] = useState(DEFAULT_FONT);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const T = THEMES[theme];
  const F = FONTS[font];

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch (e) {
      // no data yet
    }
    try {
      const p = localStorage.getItem(PROFILE_KEY);
      if (p) setProfile(JSON.parse(p));
    } catch (e) {
      // no profile yet
    }
    try {
      const t = localStorage.getItem(THEME_KEY);
      if (t && THEMES[t]) setTheme(t);
    } catch (e) {
      // no theme saved yet
    }
    try {
      const f = localStorage.getItem(FONT_KEY);
      if (f && FONTS[f]) setFont(f);
    } catch (e) {
      // no font saved yet
    }
    try {
      const onboarded = localStorage.getItem(ONBOARD_KEY);
      if (!onboarded) setShowOnboarding(true);
    } catch (e) {
      // ignore
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      // storage full or unavailable
    }
  }, [entries, loaded]);

  const finishOnboarding = () => {
    setShowOnboarding(false);
    try {
      localStorage.setItem(ONBOARD_KEY, "1");
    } catch (e) {
      // storage unavailable
    }
  };

  const changeFont = (key) => {
    setFont(key);
    try {
      localStorage.setItem(FONT_KEY, key);
    } catch (e) {
      // storage unavailable
    }
  };

  const saveProfile = (p) => {
    setProfile(p);
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    } catch (e) {
      // storage unavailable
    }
    setShowProfile(false);
  };

  const changeTheme = (key) => {
    setTheme(key);
    try {
      localStorage.setItem(THEME_KEY, key);
    } catch (e) {
      // storage unavailable
    }
  };

  const allTags = useMemo(() => {
    const s = new Set();
    entries.forEach((e) => e.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    return entries
      .filter((e) => {
        if (filter === "note" && e.type !== "note") return false;
        if (filter === "quote" && e.type !== "quote") return false;
        if (filter === "favorite" && !e.favorite) return false;
        if (activeTag && !e.tags.includes(activeTag)) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          if (
            !e.text.toLowerCase().includes(q) &&
            !e.source.toLowerCase().includes(q) &&
            !e.tags.some((t) => t.toLowerCase().includes(q))
          )
            return false;
        }
        return true;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [entries, filter, activeTag, search]);

  const handleSave = (entry) => {
    setEntries((prev) => {
      const exists = prev.some((e) => e.id === entry.id);
      if (exists) {
        return prev.map((e) => (e.id === entry.id ? entry : e));
      }
      return [entry, ...prev];
    });
    setShowComposer(false);
    setEditingEntry(null);
  };

  const startEdit = (entry) => {
    setEditingEntry(entry);
    setShowComposer(true);
  };

  const toggleFavorite = (id) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, favorite: !e.favorite } : e)));

  const deleteEntry = (id) => setEntries((prev) => prev.filter((e) => e.id !== id));

  const filters = [
    { key: "all", label: "All" },
    { key: "note", label: "Notes" },
    { key: "quote", label: "Quotes" },
    { key: "favorite", label: "★" },
  ];

  return (
    <div
      className="min-h-screen w-full pb-28"
      style={{ background: T.paper, fontFamily: "'Helvetica Neue', sans-serif" }}
    >
      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="flex items-start justify-between mb-1">
          <h1 style={{ color: T.ink, fontFamily: "'Georgia', serif" }} className="text-2xl">
            Jot & Quote
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOnboarding(true)}
              aria-label="Show tutorial"
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
              style={{ background: T.card, border: `1px solid ${T.paperEdge}`, color: T.inkSoft }}
            >
              ?
            </button>
            <button
              onClick={() => setShowProfile(true)}
              aria-label="Profile"
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: T.card, border: `1px solid ${T.paperEdge}` }}
            >
              {profile?.name ? (
                <span style={{ color: T.ink, fontSize: "13px", fontWeight: 600 }}>
                  {profile.name.trim()[0].toUpperCase()}
                </span>
              ) : (
                <User size={16} color={T.inkSoft} />
              )}
            </button>
          </div>
        </div>
        <p style={{ color: T.inkSoft }} className="text-sm mb-4">
          {profile?.name ? `Hey ${profile.name.split(" ")[0]}, notes and quotes, side by side.` : "Notes and quotes, side by side."}
        </p>

        <div
          className="flex items-center gap-2 rounded-full px-3.5 py-2.5 mb-4"
          style={{ background: T.card, border: `1px solid ${T.paperEdge}` }}
        >
          <Search size={15} color={T.inkSoft} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: T.ink }}
          />
        </div>

        <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors"
              style={{
                background: filter === f.key ? T.ink : "transparent",
                color: filter === f.key ? T.paper : T.inkSoft,
                border: `1px solid ${filter === f.key ? T.ink : T.paperEdge}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {allTags.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag(activeTag === t ? null : t)}
                className="px-2.5 py-1 rounded-full text-xs whitespace-nowrap"
                style={{
                  background: activeTag === t ? T.gold : T.paperEdge,
                  color: activeTag === t ? "#fff" : T.inkSoft,
                }}
              >
                #{t}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState filter={filter === "all" ? "all" : filter} T={T} />
        ) : (
          <div>
            {filtered.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onToggleFavorite={toggleFavorite}
                onDelete={deleteEntry}
                onShare={setShareEntry}
                onEdit={startEdit}
                T={T}
                F={F}
              />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => {
          setEditingEntry(null);
          setShowComposer(true);
        }}
        aria-label="Add new"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: T.clay, color: "#fff" }}
      >
        <Plus size={26} />
      </button>

      {showComposer && (
        <Composer
          onSave={handleSave}
          onClose={() => {
            setShowComposer(false);
            setEditingEntry(null);
          }}
          T={T}
          F={F}
          editing={editingEntry}
        />
      )}
      {showProfile && (
        <ProfileSheet
          profile={profile}
          onSave={saveProfile}
          onClose={() => setShowProfile(false)}
          T={T}
          theme={theme}
          onThemeChange={changeTheme}
          font={font}
          onFontChange={changeFont}
        />
      )}
      {shareEntry && (
        <ShareSheet
          entry={shareEntry}
          profileName={profile?.name}
          profileHandle={profile?.handle}
          onClose={() => setShareEntry(null)}
          T={T}
          F={F}
        />
      )}
      {showOnboarding && <OnboardingDemo T={T} onDone={finishOnboarding} />}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
    }
