export const getSimpleStructure = (obj: any): any => {
  if (obj === null || obj === undefined) return 'null'
  if (Array.isArray(obj)) {
    return obj.length > 0 ? [getSimpleStructure(obj[0])] : []
  }
  if (typeof obj !== 'object') return typeof obj

  const result: any = {}
  for (const [key, value] of Object.entries(obj)) {
    result[key] = getSimpleStructure(value)
  }
  return result
}
