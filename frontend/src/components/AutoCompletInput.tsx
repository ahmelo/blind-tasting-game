import { useMemo, useState } from "react";

interface AutocompleteInputProps {
  placeholder?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function AutocompleteInput({
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
}: AutocompleteInputProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    if (!query) return [];
    return options
      .filter((opt) =>
        opt.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 7); // limite ideal para mobile
  }, [query, options]);

  function handleSelect(option: string) {
    onChange(option);
    setQuery(option);
    setOpen(false);
  }

  return (
    <div className="field autocomplete">

      <input
        type="text"
        className="input"
        placeholder={placeholder}
        value={query}
        disabled={disabled}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value); // mantém texto livre
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // pequeno delay para permitir clique
          setTimeout(() => setOpen(false), 150);
        }}
      />

      {open && filteredOptions.length > 0 && !disabled && (
        <ul className="autocomplete-list">
          {filteredOptions.map((opt) => (
            <li
              key={opt}
              className="autocomplete-item"
              onMouseDown={() => handleSelect(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
