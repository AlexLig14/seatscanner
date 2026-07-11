export function TicketIcon({ width, height }: { width: number; height: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M7 0 L73 0 A7 7 0 0 0 80 7 L80 41 A7 7 0 0 0 73 48 L7 48 A7 7 0 0 0 0 41 L0 7 A7 7 0 0 0 7 0 Z" fill="#F5A623"/>
      <path d="M23 6 L57 6 A4 4 0 0 0 61 10 L61 38 A4 4 0 0 0 57 42 L23 42 A4 4 0 0 0 19 38 L19 10 A4 4 0 0 0 23 6 Z" fill="white"/>
      <line x1="13" y1="0" x2="13" y2="48" stroke="white" strokeWidth="1.5" strokeDasharray="3 2"/>
      <line x1="67" y1="0" x2="67" y2="48" stroke="white" strokeWidth="1.5" strokeDasharray="3 2"/>
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="flex items-center gap-2">
      <TicketIcon width={40} height={24} />
      <span className="text-2xl font-extrabold tracking-tight">
        <span className="text-midnight">Seat</span>
        <span className="text-seat-green">Scanner</span>
      </span>
    </span>
  );
}
