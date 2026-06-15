# PropertyReach Backend API

Node.js/Express backend API for PropertyReach real estate platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Setup database:
```bash
npx prisma generate
npx prisma migrate dev
```

4. Start development server:
```bash
npm run dev
```

## Roles & access

- **SUPER_ADMIN**: Can onboard agents (approve pending users) via `/api/admin/agents/*`. Can also list and manage own listings like an agent.
- **AGENT**: Can list and manage own properties only (`/api/listings`, `/api/listings/my`). Cannot access `/api/admin/agents`.
- **PENDING**: User has signed up; must be approved by a super admin before they can use agent features.

## Agent onboarding API (super admin)

These endpoints are for super admins to onboard new agents. **Tables:** the `users` table (columns: `id`, `mobileNumber`, `role`, `createdAt`, `updatedAt`). Role is one of `SUPER_ADMIN`, `AGENT`, `PENDING`. There is no separate "agents" table; agents are users with `role = 'AGENT'`.

**API discovery (`GET /api/admin/agents/info`):** available in development, or in production only when `EXPOSE_ADMIN_API_INFO=true`. Otherwise disabled to avoid disclosing admin surface area.

**List users pending approval (requires Bearer JWT, super admin):**
```http
GET /api/admin/agents/pending
Authorization: Bearer <token>
```

**List onboarded agents (requires Bearer JWT, super admin):**
```http
GET /api/admin/agents
Authorization: Bearer <token>
```

**Approve a pending user as agent (requires Bearer JWT, super admin):**
```http
POST /api/admin/agents/:id/approve
Authorization: Bearer <token>
```
Replace `:id` with the user's UUID from the pending list.

**Swagger:** Open `http://localhost:3001/api-docs` and look at the **Admin** tag for these endpoints.

## API Documentation

### Authentication

#### Send OTP
```http
POST /api/auth/otp/send
Content-Type: application/json

{
  "mobileNumber": "0211234567"
}
```

#### Verify OTP
```http
POST /api/auth/otp/verify
Content-Type: application/json

{
  "mobileNumber": "0211234567",
  "otp": "123456"
}
```

### Listings

#### Get Listings
```http
GET /api/listings?listingType=SALE&page=1&pageSize=12&region=Auckland
```

#### Get Single Listing
```http
GET /api/listings/:id
Authorization: Bearer <token>
```

#### Create Listing (Admin)
```http
POST /api/listings
Authorization: Bearer <token>
Content-Type: application/json

{
  "listingType": "SALE",
  "headline": "Beautiful Home",
  "description": "...",
  ...
}
```

#### Update Listing (Admin)
```http
PUT /api/listings/:id
Authorization: Bearer <token>
```

#### Delete Listing (Admin)
```http
DELETE /api/listings/:id
Authorization: Bearer <token>
```

## Database

Uses Prisma ORM with PostgreSQL. Schema defined in `prisma/schema.prisma`.

## Environment Variables

See `.env.example` for required variables.
