import Link from "next/link";
import { Wordmark } from "./Brand";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
      <Link href="/" aria-label="SeatScanner home">
        <Wordmark />
      </Link>
    </nav>
  );
}
