# Database Seeding Required

## Issue

The login is failing because the database hasn't been seeded with demo users yet.

## Solution

You need to run the database seed script to create the demo users (admin, manager, cashier) and sample data.

### Steps:

1. **Stop the backend server temporarily**
   - Find the command window running the backend (it says "Backend Server" or shows nodemon/node)
   - Press `Ctrl+C` to stop it

2. **Run the seed script**
   - In the same command window (or open a new one), run:
   ```bash
   cd d:\Antigravity\pos_v2.1\backend
   npm run seed
   ```

3. **Wait for completion**
   - You should see messages like:
     - ✅ Database tables created
     - ✅ Admin user created
     - ✅ Manager user created
     - ✅ Cashier user created
     - ✅ Sample products created
     - 🎉 Database seeding completed successfully!

4. **Restart the backend server**
   ```bash
   npm run dev
   ```

5. **Try logging in again**
   - Go to http://localhost:4200
   - Use: manager / manager123
   - It should work now!

## What the seed script creates:

- **3 Users:**
  - admin / admin123 (Admin role)
  - manager / manager123 (Manager role)
  - cashier / cashier123 (Cashier role)

- **5 Sample Products:**
  - Laptop, Mouse, Keyboard, Monitor, USB Cable

- **3 Sample Customers** with loyalty points

- **1 Sample Supplier**

## Alternative: Use start.bat

If you want to avoid manual steps, you can:
1. Close all running servers
2. Run the seed script once: `cd backend && npm run seed`
3. Then use `start.bat` from the root directory to start both servers

---

**Note:** The seed script uses SQLite (file-based database), so no PostgreSQL installation is needed. The database file is created at `backend/database.sqlite`.
