const CONFIG = {
  completed: { label: 'Completed', cls: 'badge-completed' },
  failed:    { label: 'Failed',    cls: 'badge-failed'    },
  running:   { label: 'Running',   cls: 'badge-running'   },
};

export default function StatusBadge({ status }) {
  const { label, cls } = CONFIG[status] || { label: status, cls: '' };
  return <span className={`badge ${cls}`}>{label}</span>;
}
