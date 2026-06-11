interface TestProgressProps {
  current: number
  total: number
}

export function TestProgress({ current, total }: TestProgressProps) {
  const percent = total > 0 ? ((current + 1) / total) * 100 : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-fg-secondary">
          Câu {current + 1} / {total}
        </span>
        <span className="text-accent-sage font-medium">{Math.round(percent)}%</span>
      </div>
      <div
        className="h-2 bg-border rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={current + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label="Tiến độ bài kiểm tra"
      >
        <div
          className="h-full bg-accent-sage rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${
              i <= current ? 'bg-accent-sage' : 'bg-border'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  )
}
