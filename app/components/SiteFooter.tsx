import { Wordmark } from "./Brand";

export function SiteFooter() {
  return (
    <footer className="px-8 py-8 border-t border-gray-100">
      <div className="flex flex-col items-center gap-2">
        <Wordmark />
        <p className="text-sm font-light text-gray-400 tracking-wide">
          Any ticket. Best price.
        </p>
      </div>
    </footer>
  );
}
