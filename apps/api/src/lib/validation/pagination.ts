/**
 * 分页参数验证工具
 * 用于统一验证和处理所有 API 的分页参数
 */

export interface PaginationParams {
  page?: number | string
  pageSize?: number | string
  limit?: number | string
}

export interface ValidatedPaginationParams {
  page: number
  pageSize: number
  offset: number
}

export interface PaginationValidationOptions {
  maxPageSize?: number
  defaultPage?: number
  defaultPageSize?: number
}

/**
 * 验证并标准化分页参数
 * @param params 原始分页参数
 * @param options 验证选项
 * @returns 验证后的分页参数
 * @throws Error 如果参数无效
 */
export function validatePaginationParams(
  params: PaginationParams,
  options: PaginationValidationOptions = {}
): ValidatedPaginationParams {
  const {
    maxPageSize = 1000,
    defaultPage = 1,
    defaultPageSize = 20,
  } = options

  // 处理 page 参数（支持 page 或 默认值）
  const pageRaw = params.page ?? defaultPage
  const page = typeof pageRaw === 'number' ? pageRaw : parseInt(pageRaw as string, 10)

  // 处理 pageSize/limit 参数（支持 pageSize 或 limit）
  const pageSizeRaw = params.pageSize ?? params.limit ?? defaultPageSize
  const pageSize = typeof pageSizeRaw === 'number' ? pageSizeRaw : parseInt(pageSizeRaw as string, 10)

  // 验证 page
  if (isNaN(page) || page < 1) {
    throw new Error('无效的页码参数：必须是大于 0 的整数')
  }

  // 验证 pageSize
  if (isNaN(pageSize) || pageSize < 1) {
    throw new Error('无效的每页数量参数：必须是大于 0 的整数')
  }

  if (pageSize > maxPageSize) {
    throw new Error(`每页数量超过最大限制：最大 ${maxPageSize} 条`)
  }

  // 计算 offset
  const offset = (page - 1) * pageSize

  return {
    page,
    pageSize,
    offset,
  }
}

/**
 * 创建分页响应数据
 */
export interface PaginationResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function createPaginationResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginationResponse<T> {
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}
