import { http, HttpResponse, delay } from 'msw';
import { Product } from '@/types/product.types';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

export const mockProducts: Product[] = [
  {
    id: 'prod_1',
    name: 'Yonex Aerosensa 10',
    category: 'shuttle_cock',
    price: 25,
    unit: 'tube',
    stock: 4, // low stock test
    isService: false,
    isActive: true,
    description: 'High-quality goose feather shuttlecocks (12 pcs).',
    imageUrl: 'https://images.unsplash.com/photo-1622279457486-640c4cb47345?w=500&q=80',
  },
  {
    id: 'prod_2',
    name: 'Premium Racket Rental',
    category: 'equipment_rental',
    price: 10,
    unit: 'hour',
    stock: 15,
    isService: true,
    isActive: true,
    description: 'Rent a professional-grade Yonex or Victor racket.',
    imageUrl: 'https://images.unsplash.com/photo-1622279457486-640c4cb47345?w=500&q=80',
  },
  {
    id: 'prod_3',
    name: 'Sports Drink (Aquarius)',
    category: 'beverage',
    price: 3,
    unit: 'bottle',
    stock: 45,
    isService: false,
    isActive: true,
  },
  {
    id: 'prod_4',
    name: 'Private Coaching (1-on-1)',
    category: 'coaching',
    price: 45,
    unit: 'hour',
    isService: true,
    isActive: true,
    description: 'Personalized training with a certified coach.',
  },
];

export const productHandlers = [
  http.get(`${API_URL}/products`, async () => {
    await delay(500);
    return HttpResponse.json(mockProducts);
  }),

  http.post(`${API_URL}/products`, async ({ request }) => {
    await delay(600);
    const body = await request.json() as Partial<Product>;
    
    const newProduct: Product = {
      ...body,
      id: `prod_${Math.random().toString(36).substring(7)}`,
      name: body.name || '',
      category: body.category || 'other',
      price: body.price || 0,
      unit: body.unit || 'item',
      isService: body.isService || false,
      isActive: body.isActive !== undefined ? body.isActive : true,
    };
    
    mockProducts.push(newProduct);
    return HttpResponse.json(newProduct, { status: 201 });
  }),

  http.patch(`${API_URL}/products/:id`, async ({ params, request }) => {
    await delay(600);
    const { id } = params;
    const body = await request.json() as Partial<Product>;
    
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index !== -1) {
      mockProducts[index] = { ...mockProducts[index], ...body };
      return HttpResponse.json(mockProducts[index]);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.delete(`${API_URL}/products/:id`, async ({ params }) => {
    await delay(600);
    const { id } = params;
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index !== -1) {
      mockProducts.splice(index, 1);
      return HttpResponse.json({ success: true });
    }
    return new HttpResponse(null, { status: 404 });
  }),
];
