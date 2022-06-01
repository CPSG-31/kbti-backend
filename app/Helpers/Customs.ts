import { DateTime } from 'luxon'

export function getUnixTimestamp(datetime: DateTime): number {
  return Math.floor(+new Date(datetime.toString()) / 1000.0)
}

export function createResponse(res: ResponseInterface): {
  code: number
  status: string
  message?: string
  data?: any
} {
  return {
    code: res.code,
    status: res.status,
    message: res.message,
    data: res.data,
  }
}
