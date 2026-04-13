const getFileStyle = (mimeType = '') => {
  if (mimeType.startsWith('image/')) return { color: '#60a5fa' }
  if (mimeType === 'application/pdf') return { color: '#f87171' }
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
    return { color: '#4ade80' }
  if (mimeType.includes('word')) return { color: '#818cf8' }
  return { color: '#94a3b8' }
}

export default { getFileStyle }
