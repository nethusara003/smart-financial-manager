import { forwardRef, useEffect, useRef, useState } from 'react';

/**
 * CurrencyInput — a drop-in replacement for <input type="number"> in any
 * monetary field.  It formats the displayed value with thousand-separator
 * commas in real-time while the user types, and surfaces the raw numeric
 * value through a synthetic onChange event so callers don't need to change
 * their state logic.
 *
 * Props:
 *   value        {number|string}  Controlled numeric value (no commas needed)
 *   onChange     {function}       Called with a synthetic-like event:
 *                                   { target: { name, value: rawString } }
 *                                 The `value` in the event is the plain
 *                                 digits string (e.g. "1500000.50") so
 *                                 existing handlers that do parseFloat/Number
 *                                 on e.target.value continue to work.
 *   name         {string}         Input name (forwarded to onChange event)
 *   placeholder  {string}         Shown when empty (default "0")
 *   decimals     {number}         Max decimal digits to allow (default 2)
 *   className    {string}         CSS classes for the <input> element
 *   disabled     {boolean}
 *   required     {boolean}
 *   min          {number}         Minimum allowed raw value (optional)
 *   max          {number}         Maximum allowed raw value (optional)
 *   ...rest                       Any other <input> props (id, aria-*, etc.)
 */
const stripFormatting = (str) => String(str ?? '').replace(/,/g, '');

const formatWithCommas = (raw, maxDecimals = 2) => {
  if (raw === '' || raw === undefined || raw === null) return '';

  const str = String(raw);
  // Split on decimal point
  const [intPart, decPart] = str.split('.');

  // Add thousand separators to integer portion
  const formattedInt = intPart === '' ? '' : Number(intPart).toLocaleString('en-US');

  if (decPart !== undefined) {
    // Keep the decimal portion as-is while typing (capped at maxDecimals)
    return `${formattedInt}.${decPart.slice(0, maxDecimals)}`;
  }

  return formattedInt;
};

const CurrencyInput = forwardRef(({
  value,
  onChange,
  name,
  placeholder = '0',
  decimals = 2,
  className = '',
  disabled = false,
  required = false,
  min,
  max,
  ...rest
}, ref) => {
  // The display string with commas
  const [display, setDisplay] = useState(() => formatWithCommas(stripFormatting(String(value ?? '')), decimals));
  // Keep a ref to the previous incoming value so we can sync on external changes
  const prevValueRef = useRef(value);

  // Sync display when the parent updates value externally (e.g. form reset)
  useEffect(() => {
    const incoming = String(value ?? '');
    if (incoming !== prevValueRef.current) {
      prevValueRef.current = incoming;
      setDisplay(formatWithCommas(stripFormatting(incoming), decimals));
    }
  }, [value, decimals]);

  const handleChange = (e) => {
    const raw = e.target.value;

    // Allow only digits, one decimal point, and commas (commas are formatting)
    const stripped = stripFormatting(raw).replace(/[^0-9.]/g, '');

    // Prevent more than one decimal point
    const parts = stripped.split('.');
    const safeRaw = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : stripped;

    // Enforce decimals cap on the decimal part
    let finalRaw = safeRaw;
    if (safeRaw.includes('.')) {
      const [i, d] = safeRaw.split('.');
      finalRaw = `${i}.${d.slice(0, decimals)}`;
    }

    // Update display immediately (live formatting)
    setDisplay(formatWithCommas(finalRaw, decimals));
    prevValueRef.current = finalRaw;

    // Fire onChange with a synthetic event so callers get e.target.name / e.target.value
    if (onChange) {
      onChange({ target: { name: name ?? e.target.name, value: finalRaw } });
    }
  };

  return (
    <input
      ref={ref}
      type="text"
      inputMode="decimal"
      name={name}
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={className}
      autoComplete="off"
      {...rest}
    />
  );
});

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
