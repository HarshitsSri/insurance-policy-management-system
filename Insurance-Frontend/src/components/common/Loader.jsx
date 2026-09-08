import { Loader2 } from "lucide-react";

export default function Loader({ label = "Loading", fullScreen = false, size = 20 }) {
  const content = (
    <div className="flex items-center justify-center gap-2.5 text-ink-500">
      <Loader2 size={size} className="animate-spin" />
      <span className="text-sm font-medium">{label}…</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="py-10">{content}</div>;
}
