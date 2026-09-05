export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(date);
  }
};

export const formatDateTime = (date) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return String(date);
  }
};

export const formatDateShort = (date) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(d);
  } catch {
    return String(date);
  }
};

export const formatWorkedHours = (hours) => {
  if (hours == null) return '0h 0m';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

export const formatPercentage = (val) => {
  if (val == null) return '0%';
  return `${Number(val).toFixed(1)}%`;
};

export const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getAvatarColor = (name) => {
  if (!name) return 'bg-gray-500';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500',
    'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500',
    'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
    'bg-pink-500', 'bg-rose-500'
  ];
  return colors[Math.abs(hash) % colors.length];
};

export const getStatusColor = (status) => {
  const s = String(status).toLowerCase();
  switch (s) {
    case 'active':
    case 'present':
    case 'approved':
    case 'paid':
    case 'validated':
      return { bg: 'bg-green-500/10', text: 'text-green-500', dot: 'bg-green-500' };
    case 'draft':
    case 'submitted':
    case 'pending':
      return { bg: 'bg-blue-500/10', text: 'text-blue-500', dot: 'bg-blue-500' };
    case 'expired':
    case 'absent':
    case 'refused':
    case 'missing checkout':
    case 'rejected':
      return { bg: 'bg-red-500/10', text: 'text-red-500', dot: 'bg-red-500' };
    case 'late':
    case 'overtime':
    case 'warning':
      return { bg: 'bg-amber-500/10', text: 'text-amber-500', dot: 'bg-amber-500' };
    default:
      return { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-400' };
  }
};
