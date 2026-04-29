# EC Footwear E-Commerce Platform

## Backend (Node.js/Express/Supabase)

### Features
- Admin/User authentication (JWT)
- Admin: Add, update, delete footwear products
- User: Search, view, and order products
- Order management
- Supabase (PostgreSQL) integration

### Setup
1. Copy `.env.example` to `.env` and fill in your Supabase credentials.
2. Install dependencies:
   ```sh
   cd backend
   npm install
   ```
3. Start the server:
   ```sh
   npm run dev
   ```

### API Endpoints
- `POST /api/auth/register` — Register (admin/user)
- `POST /api/auth/login` — Login
- `GET /api/products` — List/search products
- `POST /api/products` — Add product (admin)
- `PUT /api/products/:id` — Update product (admin)
- `DELETE /api/products/:id` — Delete product (admin)
- `POST /api/orders` — Place order (user)
- `GET /api/orders` — List user orders

---

See frontend/README.md for frontend setup.
