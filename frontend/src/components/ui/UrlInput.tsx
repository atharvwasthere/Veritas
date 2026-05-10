import { useState, type FormEvent } from "react";

import { Button } from "./Button";

interface Props {
  onSubmit: (url: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function UrlInput({ onSubmit, disabled, placeholder = "https://company.com" }: Props) {
  const [value, setValue] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = normalize(value);
    if (!v) return;
    onSubmit(v);
  };

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-1 rounded-pill border border-stone bg-canvas pl-6 pr-1 py-1 focus-within:border-ink transition-colors max-w-[560px]"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-transparent py-3 outline-none text-body-lg text-ink placeholder:text-gunmetal"
        type="text"
        autoComplete="off"
        spellCheck={false}
      />
      <Button type="submit" variant="primary" disabled={disabled}>
        {disabled ? "Auditing…" : "Run audit"}
      </Button>
    </form>
  );
}

function normalize(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
