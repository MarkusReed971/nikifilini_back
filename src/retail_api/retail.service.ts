import { Injectable } from '@nestjs/common'
import { CrmType, Order, RetailPagination } from './types'
import axios, { AxiosInstance } from 'axios'
// import { ConcurrencyManager } from 'axios-concurrency'
import { serialize } from '../tools'
import { plainToClass } from 'class-transformer'
import { OrdersResponse } from '../graphql'


process.env.RETAIL_URL = "https://example.retailcrm.ru"
process.env.RETAIL_KEY = "EpgGiVOdto8tnlcSqr2AOPDbd0OTlt7U"

@Injectable()
export class RetailService {
  private readonly axios: AxiosInstance

  constructor() {
    this.axios = axios.create({
      baseURL: `${process.env.RETAIL_URL}/api/v5`,
      timeout: 10000,
      headers: { },
    })

    this.axios.interceptors.request.use((config) => {
      // console.log(config.url)
      return config
    })
    this.axios.interceptors.response.use(
      (r) => {
        // console.log("Result:", r.data)
        return r
      },
      (r) => {
        // console.log("Error:", r.response.data)
        return r
      },
    )
  }

  async orders(page: number): Promise<OrdersResponse> {
    const params = serialize({page, apiKey: process.env.RETAIL_KEY}, '')
    const resp = await this.axios.get('/orders?' + params)

    if (!resp.data) throw new Error('RETAIL CRM ERROR')

    const orders = plainToClass(Order, resp.data.orders as Array<any>)
    const pagination: RetailPagination = resp.data.pagination
    const ordersResponse: OrdersResponse = {orders, pagination}

    return ordersResponse
  }

  async findOrder(id: string): Promise<Order | null> {
    const params = serialize({by: "id", apiKey: process.env.RETAIL_KEY}, '')
    const resp = await this.axios.get(`/orders/${id}?${params}`)

    if (!resp.data) return null

    const order = plainToClass(Order, resp.data.order)
    return order
  }

  async orderStatuses(): Promise<CrmType[]> {
    const params = serialize({apiKey: process.env.RETAIL_KEY}, '')
    const resp = await this.axios.get(`/reference/statuses?${params}`)

    if (!resp.data) throw new Error('RETAIL CRM ERROR')

    const statuses = Object.values(resp.data.statuses)
      .map((status: CrmType) => ({code: status.code, name: status.name}))
    return statuses
  }

  async productStatuses(): Promise<CrmType[]> {
    const params = serialize({apiKey: process.env.RETAIL_KEY}, '')
    const resp = await this.axios.get(`/reference/product-statuses?${params}`)

    if (!resp.data) throw new Error('RETAIL CRM ERROR')

    const statuses = Object.values(resp.data.productStatuses)
      .map((status: CrmType) => ({code: status.code, name: status.name}))
    return statuses
  }

  async deliveryTypes(): Promise<CrmType[]> {
    const params = serialize({apiKey: process.env.RETAIL_KEY}, '')
    const resp = await this.axios.get(`/reference/delivery-types?${params}`)

    if (!resp.data) throw new Error('RETAIL CRM ERROR')

    const types = Object.values(resp.data.deliveryTypes)
      .map((type: CrmType) => ({code: type.code, name: type.name}))
    return types
  }
}
