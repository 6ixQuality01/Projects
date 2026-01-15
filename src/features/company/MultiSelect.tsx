import { useMemo, useState } from "react";

type Option = { value: string; label: string };

export function MultiSelect({
  options,
  value,
  placeholder,
  onChange,
}: {
  options: Option[];
  value: string[];
  placeholder?: string;
  onChange: (value: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => {
    const map = new Map(options.map(o => [o.value, o.label]));
    return value.map(v => ({ value: v, label: map.get(v) ?? v }));
  }, [options, value]);

  function toggle(v: string) {
    if (value.includes(v)) onChange(value.filter(x => x !== v));
    else onChange([...value, v]);
  }

  return (
    <div className="multiselect">
      <button type="button" className="multiselect-trigger" onClick={() => setOpen(p => !p)}>
        {selected.length === 0 ? <span className="muted">{placeholder ?? "Select..."}</span> : (
          <div className="chips">
            {selected.map(s => <span key={s.value} className="chip">{s.label}</span>)}
          </div>
        )}
        <span className="caret">▾</span>
      </button>

      {open && (
        <div className="multiselect-popover">
          {options.map(o => (
            <label key={o.value} className="multiselect-option">
              <input type="checkbox" checked={value.includes(o.value)} onChange={() => toggle(o.value)} />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
