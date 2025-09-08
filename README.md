# R&M Store - E-commerce MVP

A production-ready Next.js 14 e-commerce platform focused on Cash on Delivery (COD) with comprehensive admin panel, product variants, coupon system, and advertising popups.

## 🚀 Features

### Storefront
- **Product Catalog**: Categories, product listings with search and filters
- **Product Details**: Image gallery, variant selection (color/size), inventory tracking
- **Shopping Cart**: Add/remove items, quantity management, persistent sessions
- **Coupon System**: Percentage, fixed amount, and free shipping coupons
- **COD Checkout**: Address collection, optional SMS OTP verification
- **Order Tracking**: Public order status page with tokenized access
- **Mobile-First**: Responsive design optimized for mobile devices

### Admin Panel
- **Dashboard**: Key metrics, recent orders, low stock alerts
- **Categories**: Hierarchical category management with nested support
- **Products**: Full CRUD with variants, options, media upload, inventory
- **Orders**: Status workflow, COD collection tracking, courier export
- **Coupons**: Advanced validation rules, usage limits, date ranges
- **Popups**: Targeting system with frequency capping and A/B testing
- **Media Management**: S3/R2 integration with presigned uploads

### Technical Features
- **Authentication**: NextAuth with email OTP for admin access
- **Database**: Prisma ORM with PostgreSQL, comprehensive schema
- **Caching**: Redis for rate limiting, popup frequency capping
- **Validation**: Zod schemas for all inputs, server-side validation
- **SEO**: JSON-LD structured data, OpenGraph tags, breadcrumbs
- **Performance**: ISR, image optimization, efficient queries

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI**: Tailwind CSS + shadcn/ui components
- **Caching**: Upstash Redis
- **Storage**: AWS S3 / Cloudflare R2
- **Validation**: Zod
- **Forms**: React Hook Form
- **Animation**: Framer Motion
- **Testing**: Vitest

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cod-ecommerce-mvp
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables:
   ```env
   DATABASE_URL=postgres://user:pass@host:5432/db
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   EMAIL_FROM=noreply@example.com
   EMAIL_SERVER_HOST=localhost
   EMAIL_SERVER_PORT=1025
   REDIS_URL=rediss://your-redis-url
   AWS_REGION=eu-central-1
   AWS_S3_BUCKET=your-bucket-name
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   ```

4. **Database Setup**
   ```bash
   pnpm db:push
   pnpm seed
   ```

5. **Start Development Server**
   ```bash
   pnpm dev
   ```

## 🗄️ Database Schema

### Core Entities
- **User**: Admin authentication and roles
- **Category**: Hierarchical product categories
- **Product**: Main product information with SEO
- **ProductOption**: Configurable options (Color, Size, etc.)
- **OptionValue**: Individual option values with hex colors
- **Variant**: Product variants with SKU, price, inventory
- **Media**: Product images with positioning
- **Customer**: Customer information and statistics
- **Address**: Delivery addresses
- **Order**: Order management with COD tracking
- **OrderItem**: Individual order line items
- **Cart/CartItem**: Shopping cart persistence
- **Coupon**: Discount codes with validation rules
- **Popup**: Advertising popups with targeting

## 🔧 Development Scripts

```bash
# Development
pnpm dev                 # Start development server
pnpm build              # Build for production
pnpm start              # Start production server

# Database
pnpm db:push            # Push schema changes
pnpm db:migrate         # Run migrations
pnpm db:studio          # Open Prisma Studio
pnpm seed               # Seed database with sample data

# Utilities
pnpm export:courier     # Export orders for courier (CSV)
pnpm lint               # Run ESLint
pnpm test               # Run tests
```

## 🏪 Admin Panel Access

1. **Seed Database**: Run `pnpm seed` to create admin user
2. **Admin Login**: Visit `/api/auth/signin`
3. **Email**: `admin@codstore.com`
4. **Magic Link**: Check console for development login link

## 📱 Mobile Development

The application is built mobile-first with:
- Responsive breakpoints (sm, md, lg, xl)
- Touch-friendly interface elements
- Optimized images and lazy loading
- Sticky add-to-cart on product pages
- Mobile-optimized checkout flow

## 🎯 Popup System

### Targeting Options
- **Paths**: Specific routes or wildcard patterns
- **Devices**: Mobile, desktop, or both
- **UTM Parameters**: Campaign-based targeting

### Frequency Capping
- **Per Session**: Limit shows per browser session
- **Per Day**: Daily impression limits
- **Cooldown**: Hours between shows
- **A/B Testing**: Split traffic between variants

## 💳 Coupon Engine

### Coupon Types
- **PERCENT**: Percentage discount (e.g., 10% off)
- **FIXED**: Fixed amount discount (e.g., $50 off)
- **FREESHIP**: Free shipping coupon

### Validation Rules
- Minimum order amount requirements
- Date range validity (start/end dates)
- Usage limits (global and per customer)
- Customer identification via phone/email

## 📦 Order Management

### Order Statuses
1. **PENDING**: Order placed, awaiting confirmation
2. **CONFIRMED**: Order confirmed, preparing for shipment
3. **PACKED**: Order packed, ready for pickup
4. **OUT_FOR_DELIVERY**: Order dispatched to customer
5. **DELIVERED**: Order successfully delivered
6. **FAILED**: Delivery failed
7. **CANCELED**: Order canceled

### COD Features
- Optional SMS OTP verification
- COD collection tracking
- Courier integration (CSV export)
- Order tracking with public URLs

## 🔒 Security Features

- **Rate Limiting**: Checkout, API endpoints
- **Input Validation**: Zod schemas on all inputs
- **CSRF Protection**: Built-in Next.js protection
- **SQL Injection**: Prisma ORM protection
- **XSS Prevention**: React's built-in protection
- **Authentication**: Secure session management

## 🚀 Deployment

### Prerequisites
- PostgreSQL database
- Redis instance
- S3-compatible storage
- SMTP server (for emails)

### Environment Variables
Ensure all production environment variables are set:
- Database connection strings
- Authentication secrets
- Storage credentials
- Email configuration
- Redis connection

### Build Process
```bash
pnpm build
pnpm start
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests with UI
pnpm test:ui

# Test specific functionality
pnpm test coupon-engine
pnpm test popup-targeting
```

## 📈 Performance Optimization

- **ISR**: Incremental Static Regeneration for product pages
- **Image Optimization**: Next.js Image component with remote patterns
- **Code Splitting**: Automatic route-based splitting
- **Caching**: Redis for frequently accessed data
- **Database**: Optimized queries with proper indexing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

---

Built with ❤️ using Next.js 14, TypeScript, and modern web technologies.
