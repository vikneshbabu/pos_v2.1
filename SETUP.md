# POS System v2.1 - Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Database Setup

1. **Install PostgreSQL** if not already installed

2. **Create a database**:
```sql
CREATE DATABASE pos_db;
```

3. **Create a PostgreSQL user** (optional):
```sql
CREATE USER pos_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE pos_db TO pos_user;
```

## Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create environment file**:
```bash
copy .env.example .env
```

4. **Edit `.env` file** with your database credentials:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/pos_db
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRATION=24h
CORS_ORIGIN=http://localhost:4200
```

5. **Seed the database** with sample data:
```bash
npm run seed
```

This will create:
- Admin user (username: `admin`, password: `admin123`)
- Manager user (username: `manager`, password: `manager123`)
- Cashier user (username: `cashier`, password: `cashier123`)
- Sample products
- Sample customers
- Sample supplier

6. **Start the backend server**:
```bash
npm run dev
```

The backend API will be running at `http://localhost:3000`

## Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start the development server**:
```bash
ng serve
```

or

```bash
npm start
```

The frontend will be running at `http://localhost:4200`

## Testing the Application

1. **Open your browser** and navigate to `http://localhost:4200`

2. **Login** with one of the seeded accounts:
   - **Admin**: username `admin`, password `admin123`
   - **Manager**: username `manager`, password `manager123`
   - **Cashier**: username `cashier`, password `cashier123`

## API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### User Management (Admin/Manager only)

- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

### Products

- `GET /api/products` - List products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/barcode/:barcode` - Get product by barcode
- `POST /api/products` - Create product (Admin/Manager)
- `PUT /api/products/:id` - Update product (Admin/Manager)
- `DELETE /api/products/:id` - Delete product (Admin/Manager)
- `GET /api/products/low-stock` - Get low stock products

### Inventory

- `POST /api/inventory/adjust` - Adjust stock (Admin/Manager)
- `GET /api/inventory/history/:productId` - Get stock history
- `POST /api/inventory/purchase` - Create purchase order (Admin/Manager)
- `GET /api/inventory/purchases` - List purchases
- `PUT /api/inventory/purchases/:id/receive` - Receive purchase (Admin/Manager)

### Orders

- `POST /api/orders` - Create order (checkout)
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders/:id/refund` - Refund order (Admin/Manager)
- `GET /api/orders/:id/receipt` - Download receipt PDF

### Customers

- `GET /api/customers` - List customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `GET /api/customers/:id/orders` - Get customer orders
- `POST /api/customers/:id/loyalty` - Update loyalty points

### Reports (Admin/Manager only)

- `GET /api/reports/sales` - Sales report
- `GET /api/reports/profit` - Profit report
- `GET /api/reports/tax` - Tax report
- `GET /api/reports/inventory` - Inventory report
- `GET /api/reports/cash-drawer` - Cash drawer report
- `GET /api/reports/export/pdf` - Export report as PDF
- `GET /api/reports/export/excel` - Export report as Excel

## Troubleshooting

### Database Connection Issues

If you get database connection errors:

1. Ensure PostgreSQL is running:
```bash
# Windows
net start postgresql-x64-14

# Linux/Mac
sudo service postgresql start
```

2. Verify database credentials in `.env` file

3. Test database connection:
```bash
psql -U postgres -d pos_db
```

### Port Already in Use

If port 3000 or 4200 is already in use:

1. Change the port in backend `.env` file (PORT=3001)
2. Change the port in frontend by running:
```bash
ng serve --port 4201
```

### Module Not Found Errors

If you get module not found errors:

1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install` again

## Production Deployment

### Backend

1. Set `NODE_ENV=production` in `.env`
2. Update `DATABASE_URL` with production database
3. Generate a strong `JWT_SECRET`
4. Run migrations: `npm run migrate`
5. Start server: `npm start`

### Frontend

1. Build the production bundle:
```bash
ng build --configuration production
```

2. Serve the `dist/` folder using a web server (nginx, Apache, etc.)

## Features

✅ **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (Admin, Manager, Cashier)
- Activity logging

✅ **Product Management**
- SKU and barcode support
- Stock tracking
- Low-stock alerts
- Categories and pricing

✅ **Inventory Management**
- Stock adjustments
- Purchase orders
- Supplier management

✅ **Sales & Billing**
- Cart management
- Multiple payment methods (Cash, Card, UPI, Wallet)
- Discounts and promotions
- Receipt generation (PDF)
- Refunds and returns

✅ **Customer Management**
- Customer profiles
- Purchase history
- Loyalty points system
- Credit balance tracking

✅ **Reports & Analytics**
- Sales reports (daily/monthly)
- Profit analysis
- Tax reports
- Inventory reports
- Cash drawer reconciliation
- Export to PDF/Excel

## Support

For issues or questions, please refer to the documentation or contact the development team.
