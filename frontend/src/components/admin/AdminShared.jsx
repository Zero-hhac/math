export function AdminToolbar({ eyebrow, title, description, meta = [], actions = null }) {
  return (
    <div className="admin-toolbar">
      <div className="admin-toolbar__copy">
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="admin-toolbar__side">
        {meta.length > 0 && (
          <div className="admin-toolbar__meta">
            {meta.map((item) => (
              <div key={item.label} className="admin-chip">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        )}
        {actions && <div className="admin-toolbar__actions">{actions}</div>}
      </div>
    </div>
  )
}

export function AdminSearch({ value, onChange, placeholder = '搜索' }) {
  return (
    <label className="admin-search">
      <span>⌕</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  )
}

export function AdminNotice({ notice }) {
  if (!notice) return null

  return (
    <div className={`admin-notice ${notice.type}`}>
      <strong>{notice.title}</strong>
      <p>{notice.message}</p>
    </div>
  )
}

export function AdminEmptyState({ title, description }) {
  return (
    <div className="admin-empty">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  )
}

export function AdminLoadingBlock({ label = '加载中...' }) {
  return (
    <div className="admin-loading-block">
      <div className="loading-spinner" />
      <p>{label}</p>
    </div>
  )
}

export function AdminModal({ eyebrow, title, subtitle, onClose, children }) {
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog-card dialog-card--admin dialog-card--admin-wide" onClick={(event) => event.stopPropagation()}>
        <div className="dialog-card__topbar">
          <div>
            <div className="eyebrow">{eyebrow}</div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="dialog-close" onClick={onClose}>
            关闭
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
