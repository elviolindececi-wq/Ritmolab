export function Mascot({ name = "Compasito", emoji = "🥁", message }: { name?: string; emoji?: string; message?: string }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="grid h-20 w-20 shrink-0 place-items-center rounded-[1.7rem] bg-brand-100 text-5xl shadow-inner">
        {emoji}
      </div>
      <div>
        <p className="text-sm font-black uppercase tracking-wide text-brand-700">{name}</p>
        <p className="text-lg font-black">{message || "Cinco minutos por día hacen un metrónomo humano."}</p>
      </div>
    </div>
  );
}
