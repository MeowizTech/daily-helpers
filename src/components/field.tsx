type FieldProps = {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly inputMode?: "decimal" | "numeric" | "text";
  readonly suffix?: string;
};

export const Field = ({
  label,
  value,
  onChange,
  placeholder,
  inputMode = "text",
  suffix,
}: FieldProps) => (
  <label className="block">
    <span className="text-xs text-fg-muted">{label}</span>
    <span className="mt-1 flex items-center gap-1 rounded-lg border border-line bg-surface px-3 focus-within:border-ink">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        enterKeyHint="done"
        className="tnum h-11 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-fg-subtle"
      />
      {suffix !== undefined && <span className="shrink-0 text-sm text-fg-subtle">{suffix}</span>}
    </span>
  </label>
);
