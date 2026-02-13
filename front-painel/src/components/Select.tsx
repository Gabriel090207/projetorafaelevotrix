import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import "../styles/select.css";


interface Option {
  label: string;
  value: string;
}

interface Props {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

const Select = ({ label, options, value, onChange }: Props) => {
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="custom-select">
      <label>{label}</label>

      <div
        className="select-input"
        onClick={() => setOpen(!open)}
      >
        <span>{selected?.label}</span>
        <FiChevronDown />
      </div>

      {open && (
        <div className="select-dropdown">
          {options.map((option) => (
            <div
              key={option.value}
              className="select-option"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
