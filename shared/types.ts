export interface User {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'manager' | 'cashier';
    firstName: string;
    lastName: string;
    isActive: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface Product {
    id: string;
    sku: string;
    barcode?: string;
    name: string;
    description?: string;
    category?: string;
    price: number;
    costPrice: number;
    taxRate: number;
    stockQuantity: number;
    minStockLevel: number;
    unit: string;
    imageUrl?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Customer {
    id: string;
    customerId: string;
    name: string;
    email?: string;
    phone?: string;
    address?: any;
    loyaltyPoints: number;
    creditBalance: number;
    totalPurchases: number;
    lastPurchaseDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    discount: number;
    subtotal: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    customerId?: string;
    items: OrderItem[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    paymentMethod: 'cash' | 'card' | 'upi' | 'wallet';
    paymentStatus: 'pending' | 'completed' | 'refunded';
    cashierId: string;
    orderDate: Date;
    status: 'completed' | 'cancelled' | 'refunded';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface StockAdjustment {
    id: string;
    productId: string;
    adjustmentType: 'add' | 'remove' | 'set';
    quantity: number;
    previousQuantity: number;
    newQuantity: number;
    reason: string;
    performedBy: string;
    createdAt: Date;
}

export interface ActivityLog {
    id: string;
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    createdAt: Date;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    refreshToken: string;
    user: User;
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    totalPages: number;
}
