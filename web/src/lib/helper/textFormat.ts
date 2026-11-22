export const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}