import { sequelize } from '../config/database.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import { Supplier } from '../models/Supplier.js';

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seed...');

        // Sync database (create tables)
        await sequelize.sync({ force: true });
        console.log('✅ Database tables created');

        // Create admin user
        const admin = await User.create({
            username: 'admin',
            email: 'admin@pos.com',
            password: 'admin123',
            role: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            isActive: true
        });
        console.log('✅ Admin user created (username: admin, password: admin123)');

        // Create manager user
        await User.create({
            username: 'manager',
            email: 'manager@pos.com',
            password: 'manager123',
            role: 'manager',
            firstName: 'Manager',
            lastName: 'User',
            isActive: true
        });
        console.log('✅ Manager user created (username: manager, password: manager123)');

        // Create cashier user
        await User.create({
            username: 'cashier',
            email: 'cashier@pos.com',
            password: 'cashier123',
            role: 'cashier',
            firstName: 'Cashier',
            lastName: 'User',
            isActive: true
        });
        console.log('✅ Cashier user created (username: cashier, password: cashier123)');

        // Create sample products
        const products = [
            {
                sku: 'PROD-001',
                barcode: '1234567890123',
                name: 'Laptop',
                description: 'High-performance laptop',
                category: 'Electronics',
                price: 45000,
                costPrice: 35000,
                taxRate: 18,
                stockQuantity: 50,
                minStockLevel: 10,
                unit: 'pcs'
            },
            {
                sku: 'PROD-002',
                barcode: '1234567890124',
                name: 'Mouse',
                description: 'Wireless mouse',
                category: 'Electronics',
                price: 500,
                costPrice: 300,
                taxRate: 18,
                stockQuantity: 100,
                minStockLevel: 20,
                unit: 'pcs'
            },
            {
                sku: 'PROD-003',
                barcode: '1234567890125',
                name: 'Keyboard',
                description: 'Mechanical keyboard',
                category: 'Electronics',
                price: 2500,
                costPrice: 1800,
                taxRate: 18,
                stockQuantity: 75,
                minStockLevel: 15,
                unit: 'pcs'
            },
            {
                sku: 'PROD-004',
                barcode: '1234567890126',
                name: 'Monitor',
                description: '24-inch LED monitor',
                category: 'Electronics',
                price: 12000,
                costPrice: 9000,
                taxRate: 18,
                stockQuantity: 30,
                minStockLevel: 5,
                unit: 'pcs'
            },
            {
                sku: 'PROD-005',
                barcode: '1234567890127',
                name: 'USB Cable',
                description: 'USB Type-C cable',
                category: 'Accessories',
                price: 200,
                costPrice: 100,
                taxRate: 12,
                stockQuantity: 200,
                minStockLevel: 50,
                unit: 'pcs'
            }
        ];

        for (const productData of products) {
            await Product.create(productData);
        }
        console.log('✅ Sample products created');

        // Create sample customers
        const customers = [
            {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+91 9876543210',
                loyaltyPoints: 100
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                phone: '+91 9876543211',
                loyaltyPoints: 250
            },
            {
                name: 'Bob Johnson',
                email: 'bob@example.com',
                phone: '+91 9876543212',
                loyaltyPoints: 50
            }
        ];

        for (const customerData of customers) {
            await Customer.create(customerData);
        }
        console.log('✅ Sample customers created');

        // Create sample supplier
        await Supplier.create({
            name: 'Tech Supplies Inc.',
            contactPerson: 'Alice Brown',
            email: 'alice@techsupplies.com',
            phone: '+91 9876543213',
            address: { street: '123 Tech Street', city: 'Mumbai', state: 'Maharashtra', zip: '400001' }
        });
        console.log('✅ Sample supplier created');

        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📝 Login credentials:');
        console.log('   Admin    - username: admin,    password: admin123');
        console.log('   Manager  - username: manager,  password: manager123');
        console.log('   Cashier  - username: cashier,  password: cashier123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
