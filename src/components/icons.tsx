export function PackageIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M21 8l-9-5-9 5 9 5 9-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3 8v8l9 5 9-5V8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 13v8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function TruckIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 7h11v8H3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 10h4l3 3v2h-7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="18" r="1.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function PinIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 21s7-6.2 7-11.5A7 7 0 105 9.5C5 14.8 12 21 12 21z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function CheckIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12.5l2.5 2.5L16 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ClockIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
