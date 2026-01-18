# POS System v2.1

A comprehensive Point of Sale system with web and Android support.

## Features

- 🔹 **Sales & Billing**: Product catalog, cart management, discounts, invoice generation, multiple payment methods
- 🔹 **Inventory Management**: Stock tracking, low-stock alerts, supplier management, barcode scanning
- 🔹 **User & Role Management**: Admin, cashier, manager roles with permissions control
- 🔹 **Customer Management**: Customer profiles, purchase history, loyalty points
- 🔹 **Reports & Analytics**: Sales, profit, tax, and inventory reports with PDF/Excel export

## Tech Stack

- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: Angular + Angular Material
- **Mobile**: Capacitor for native features (barcode scanning)
- **Authentication**: JWT
- **Reports**: PDFKit, ExcelJS

## Project Structure

```
pos_v2.1/
├── backend/          # Node.js Express API
├── frontend/         # Angular web application
└── shared/           # Shared TypeScript interfaces
```

## Getting Started

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure your database and environment variables
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
ng serve
```

## Development

- Backend runs on: http://localhost:3000
- Frontend runs on: http://localhost:4200

## License

MIT
