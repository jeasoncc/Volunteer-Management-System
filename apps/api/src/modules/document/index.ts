import { Elysia } from 'elysia'
import { documentService } from './service'

export const documentModule = new Elysia({ prefix: 'api/document' }).get('excel', () =>
  documentService.createExcel(),
)
