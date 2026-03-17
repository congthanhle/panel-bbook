import dayjs from 'dayjs';
import { apiClient } from '@/lib/api-client';
import { axiosInstance } from '@/lib/axios';
import { PaginatedResponse } from '@/types/common.types';
import { 
  Customer, 
  CustomerQueryDto, 
  CustomerStats, 
  CustomerLookupDto, 
  CreateCustomerDto, 
  UpdateCustomerDto 
} from '@/types/customer.types';

export const customersApi = {
  getAll: (params: CustomerQueryDto) =>
    apiClient.get<PaginatedResponse<Customer>>("/customers", params),

  getStats: () =>
    apiClient.get<CustomerStats>("/customers/stats"),

  getOne: (id: string) =>
    apiClient.get<Customer>(`/customers/${id}`),

  lookupByPhone: (phone: string) =>
    apiClient.get<CustomerLookupDto>(`/customers/by-phone/${phone}`),

  create: (dto: CreateCustomerDto) =>
    apiClient.post<Customer>("/customers", dto),

  update: (id: string, dto: UpdateCustomerDto) =>
    apiClient.patch<Customer>(`/customers/${id}`, dto),

  delete: (id: string) =>
    apiClient.del(`/customers/${id}`),

  exportCsv: async () => {
    const response = await axiosInstance.get("/customers/export", { 
      responseType: "blob" 
    });
    // Trigger download:
    const url = URL.createObjectURL(response.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-${dayjs().format("YYYYMMDD")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
