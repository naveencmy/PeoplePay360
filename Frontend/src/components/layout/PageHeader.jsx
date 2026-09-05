export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#E6EDF3]">{title}</h1>
        {subtitle && <p className="text-sm text-[#8B949E] mt-1">{subtitle}</p>}
      </div>
      {actions && actions.length > 0 && (
        <div className="flex items-center gap-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                action.primary
                  ? 'bg-[#4F7CFF] text-white hover:bg-[#3B66E5]'
                  : 'bg-[#161B22] text-[#E6EDF3] border border-[rgba(255,255,255,0.08)] hover:bg-[#0B0D10]'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
