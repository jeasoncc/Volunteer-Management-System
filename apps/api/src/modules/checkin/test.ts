import Elysia from 'elysia'
// 定义JSON结构分析器中间件
//
export const jsonStructureAnalyzer = new Elysia().derive({ as: 'global' }, ({ request }) => {
  return {
    // 分析JSON结构并过滤大内容
    analyzeJsonStructure: async (maxStringLength: number = 50) => {
      try {
        // 获取请求体
        const body = await request.json().catch(() => null)

        if (!body || typeof body !== 'object') {
          return { structure: '非JSON或空请求体', original: body }
        }

        // 分析并处理JSON结构
        const analyzeObject = (obj: any, depth: number = 0): any => {
          if (depth > 5) return '[深度过大已截断]' // 防止无限递归

          if (obj === null || obj === undefined) {
            return null
          }

          if (Array.isArray(obj)) {
            if (obj.length === 0) return []
            // 取数组第一个元素分析结构
            return [analyzeObject(obj[0], depth + 1)]
          }

          if (typeof obj === 'object') {
            const result: any = {}

            for (const [key, value] of Object.entries(obj)) {
              if (typeof value === 'string') {
                // 处理字符串：截断过长的内容
                result[key] =
                  value.length > maxStringLength
                    ? `[字符串: ${value.length}字符] ${value.substring(0, 20)}...`
                    : value
              } else if (typeof value === 'number') {
                result[key] = `[数字: ${value}]`
              } else if (typeof value === 'boolean') {
                result[key] = `[布尔: ${value}]`
              } else if (value === null) {
                result[key] = null
              } else if (Array.isArray(value)) {
                result[key] = analyzeObject(value, depth + 1)
              } else if (typeof value === 'object') {
                result[key] = analyzeObject(value, depth + 1)
              }
            }

            return result
          }

          return obj
        }

        const analyzedStructure = analyzeObject(body)

        return {
          structure:    analyzedStructure,
          originalKeys: Object.keys(body),
          totalKeys:    Object.keys(body).length,
          analyzedAt:   new Date().toISOString(),
        }
      } catch (error) {
        return {
          error:   'JSON解析失败',
          message: error instanceof Error ? error.message : '未知错误',
        }
      }
    },
  }
})

var map = Immutable.Map({ a: 1, b: 2, c: 3 })
