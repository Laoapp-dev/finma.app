export function Card({ title, subtitle, children }) {
  return (
    <div className="card">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h2 className="font-display font-bold text-xl text-ink">{title}</h2>}
          {subtitle && <p className="text-ink/60 text-sm mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export function ResultTile({ label, value, tone = "indigo" }) {
  const toneClasses = {
    indigo: "bg-indigo-50 text-indigo-700",
    gold: "bg-gold-50 text-gold-700",
    bamboo: "bg-bamboo-50 text-bamboo",
    lotus: "bg-lotus-50 text-lotus",
  };
  return (
    <div className={`rounded-xl px-4 py-3 ${toneClasses[tone] || toneClasses.indigo}`}>
      <p className="text-xs uppercase tracking-wide opacity-70 mb-0.5">{label}</p>
      <p className="font-display font-bold text-xl">{value}</p>
    </div>
  );
}
