import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await db.newsletterSubscriber.deleteMany()
  await db.supportMessage.deleteMany()
  await db.supportTicket.deleteMany()
  await db.inventoryAlert.deleteMany()
  await db.review.deleteMany()
  await db.wishlist.deleteMany()
  await db.media.deleteMany()
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.cartItem.deleteMany()
  await db.cart.deleteMany()
  await db.variant.deleteMany()
  await db.optionValue.deleteMany()
  await db.productOption.deleteMany()
  await db.product.deleteMany()
  await db.category.deleteMany()
  await db.address.deleteMany()
  await db.customer.deleteMany()
  await db.coupon.deleteMany()
  await db.user.deleteMany()
  console.log('✅ Cleared existing data')

  // Create admin user
  const adminUser = await db.user.create({
    data: {
      email: 'admin@furniturestore.com',
      name: 'Furniture Admin',
      role: 'ADMIN',
    },
  })

  console.log('✅ Created admin user')

  // Create furniture categories
  const categories = await Promise.all([
    db.category.create({
      data: {
        name: 'Coffee Tables',
        slug: 'coffee-tables',
        description: 'Stylish coffee tables for your living room',
        sortOrder: 1,
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        name: 'Desks',
        slug: 'desks',
        description: 'Modern desks for home and office',
        sortOrder: 2,
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        name: 'Chairs',
        slug: 'chairs',
        description: 'Comfortable chairs for every space',
        sortOrder: 3,
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        name: 'Storage',
        slug: 'storage',
        description: 'Smart storage solutions',
        sortOrder: 4,
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        name: 'Sofas',
        slug: 'sofas',
        description: 'Comfortable sofas and seating',
        sortOrder: 5,
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        name: 'Dining Tables',
        slug: 'dining-tables',
        description: 'Elegant dining tables for family meals',
        sortOrder: 6,
        isActive: true,
      },
    }),
  ])

  console.log('✅ Created categories')

  // Create products with variants and options
  const products = []

  // 1. Modern Coffee Table with Color and Size options
  const coffeeTable = await db.product.create({
    data: {
      name: 'Modern Glass Coffee Table',
      slug: 'modern-glass-coffee-table',
      description: 'Elegant glass coffee table with chrome legs. Perfect centerpiece for modern living rooms.',
      isActive: true,
      categoryId: categories[0].id,
      price: 8999.00,
      comparePrice: 12399.00,
      weight: 25.5,
      tags: ['modern', 'glass', 'chrome', 'living room'],
      seoTitle: 'Modern Glass Coffee Table - Premium Furniture Store',
      seoDescription: 'Shop our elegant modern glass coffee table with chrome legs. Perfect for contemporary living rooms. Free shipping and quality guarantee.',
    },
  })

  // Add color option for coffee table
  const coffeeTableColorOption = await db.productOption.create({
    data: {
      productId: coffeeTable.id,
      name: 'Color',
      position: 0,
    },
  })

  const coffeeTableColors = await Promise.all([
    db.optionValue.create({
      data: {
        optionId: coffeeTableColorOption.id,
        value: 'Clear Glass',
        hexColor: '#f0f0f0',
        position: 0,
      },
    }),
    db.optionValue.create({
      data: {
        optionId: coffeeTableColorOption.id,
        value: 'Smoked Glass',
        hexColor: '#4a4a4a',
        position: 1,
      },
    }),
  ])

  // Add size option for coffee table
  const coffeeTableSizeOption = await db.productOption.create({
    data: {
      productId: coffeeTable.id,
      name: 'Size',
      position: 1,
    },
  })

  const coffeeTableSizes = await Promise.all([
    db.optionValue.create({
      data: {
        optionId: coffeeTableSizeOption.id,
        value: 'Small (90cm)',
        position: 0,
      },
    }),
    db.optionValue.create({
      data: {
        optionId: coffeeTableSizeOption.id,
        value: 'Large (120cm)',
        position: 1,
      },
    }),
  ])

  // Create variants for coffee table
  const coffeeTableVariants = await Promise.all([
    // Clear Glass - Small (In Stock)
    db.variant.create({
      data: {
        productId: coffeeTable.id,
        sku: 'CT-CLEAR-SM-001',
        price: 8999.00,
        comparePrice: 12399.00,
        inventory: 15,
        isDefault: true,
      },
    }),
    // Clear Glass - Large (In Stock)
    db.variant.create({
      data: {
        productId: coffeeTable.id,
        sku: 'CT-CLEAR-LG-001',
        price: 10849.00,
        comparePrice: 13939.00,
        inventory: 8,
        isDefault: false,
      },
    }),
    // Smoked Glass - Small (Low Stock)
    db.variant.create({
      data: {
        productId: coffeeTable.id,
        sku: 'CT-SMOKE-SM-001',
        price: 9919.00,
        comparePrice: 13019.00,
        inventory: 3,
        isDefault: false,
      },
    }),
    // Smoked Glass - Large (Out of Stock)
    db.variant.create({
      data: {
        productId: coffeeTable.id,
        sku: 'CT-SMOKE-LG-001',
        price: 11469.00,
        comparePrice: 14569.00,
        inventory: 0,
        isDefault: false,
      },
    }),
  ])

  // Connect variants to option values using the connect method
  await db.variant.update({
    where: { id: coffeeTableVariants[0].id },
    data: {
      options: {
        connect: [
          { id: coffeeTableColors[0].id },
          { id: coffeeTableSizes[0].id }
        ]
      }
    }
  })
  
  await db.variant.update({
    where: { id: coffeeTableVariants[1].id },
    data: {
      options: {
        connect: [
          { id: coffeeTableColors[0].id },
          { id: coffeeTableSizes[1].id }
        ]
      }
    }
  })
  
  await db.variant.update({
    where: { id: coffeeTableVariants[2].id },
    data: {
      options: {
        connect: [
          { id: coffeeTableColors[1].id },
          { id: coffeeTableSizes[0].id }
        ]
      }
    }
  })
  
  await db.variant.update({
    where: { id: coffeeTableVariants[3].id },
    data: {
      options: {
        connect: [
          { id: coffeeTableColors[1].id },
          { id: coffeeTableSizes[1].id }
        ]
      }
    }
  })

  // Add product-level media for coffee table
  await Promise.all([
    db.media.create({
      data: {
        productId: coffeeTable.id,
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
        altText: 'Modern glass coffee table with chrome legs',
        position: 0,
      },
    }),
    db.media.create({
      data: {
        productId: coffeeTable.id,
        url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
        altText: 'Glass coffee table detail view',
        position: 1,
      },
    }),
  ])

  // Add variant-specific images for coffee table colors
  await Promise.all([
    // Clear Glass variant images
    db.media.create({
      data: {
        productId: coffeeTable.id,
        variantId: coffeeTableVariants[0].id, // Clear Glass - Small
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&sat=-100&bright=10',
        altText: 'Clear glass coffee table - small size',
        position: 0,
      },
    }),
    db.media.create({
      data: {
        productId: coffeeTable.id,
        variantId: coffeeTableVariants[1].id, // Clear Glass - Large
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&sat=-100&bright=10',
        altText: 'Clear glass coffee table - large size',
        position: 0,
      },
    }),
    // Smoked Glass variant images
    db.media.create({
      data: {
        productId: coffeeTable.id,
        variantId: coffeeTableVariants[2].id, // Smoked Glass - Small
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&sat=-100&bright=-20',
        altText: 'Smoked glass coffee table - small size',
        position: 0,
      },
    }),
    db.media.create({
      data: {
        productId: coffeeTable.id,
        variantId: coffeeTableVariants[3].id, // Smoked Glass - Large
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&sat=-100&bright=-20',
        altText: 'Smoked glass coffee table - large size',
        position: 0,
      },
    }),
  ])

  products.push(coffeeTable)

  // 2. Ergonomic Office Chair with Color and Material options
  const officeChair = await db.product.create({
    data: {
      name: 'Ergonomic Office Chair',
      slug: 'ergonomic-office-chair',
      description: 'Premium ergonomic office chair with lumbar support and adjustable height. Perfect for long work sessions.',
      isActive: true,
      categoryId: categories[2].id,
      price: 6199.00,
      comparePrice: 9299.00,
      weight: 18.0,
      tags: ['ergonomic', 'office', 'adjustable', 'lumbar support'],
      seoTitle: 'Ergonomic Office Chair - Comfortable Work Seating',
      seoDescription: 'Premium ergonomic office chair with lumbar support. Adjustable height and comfortable padding for productive work days.',
    },
  })

  // Add color option for office chair
  const chairColorOption = await db.productOption.create({
    data: {
      productId: officeChair.id,
      name: 'Color',
      position: 0,
    },
  })

  const chairColors = await Promise.all([
    db.optionValue.create({
      data: {
        optionId: chairColorOption.id,
        value: 'Black',
        hexColor: '#000000',
        position: 0,
      },
    }),
    db.optionValue.create({
      data: {
        optionId: chairColorOption.id,
        value: 'Gray',
        hexColor: '#808080',
        position: 1,
      },
    }),
    db.optionValue.create({
      data: {
        optionId: chairColorOption.id,
        value: 'Blue',
        hexColor: '#0066cc',
        position: 2,
      },
    }),
  ])

  // Add material option for office chair
  const chairMaterialOption = await db.productOption.create({
    data: {
      productId: officeChair.id,
      name: 'Material',
      position: 1,
    },
  })

  const chairMaterials = await Promise.all([
    db.optionValue.create({
      data: {
        optionId: chairMaterialOption.id,
        value: 'Mesh',
        position: 0,
      },
    }),
    db.optionValue.create({
      data: {
        optionId: chairMaterialOption.id,
        value: 'Leather',
        position: 1,
      },
    }),
  ])

  // Create variants for office chair (some out of stock)
  const chairVariants = await Promise.all([
    // Black Mesh (In Stock)
    db.variant.create({
      data: {
        productId: officeChair.id,
        sku: 'OC-BLACK-MESH-001',
        price: 6199.00,
        comparePrice: 9299.00,
        inventory: 12,
        isDefault: true,
      },
    }),
    // Black Leather (In Stock)
    db.variant.create({
      data: {
        productId: officeChair.id,
        sku: 'OC-BLACK-LEATHER-001',
        price: 7749.00,
        comparePrice: 10849.00,
        inventory: 7,
        isDefault: false,
      },
    }),
    // Gray Mesh (Low Stock)
    db.variant.create({
      data: {
        productId: officeChair.id,
        sku: 'OC-GRAY-MESH-001',
        price: 6199.00,
        comparePrice: 9299.00,
        inventory: 2,
        isDefault: false,
      },
    }),
    // Gray Leather (Out of Stock)
    db.variant.create({
      data: {
        productId: officeChair.id,
        sku: 'OC-GRAY-LEATHER-001',
        price: 7749.00,
        comparePrice: 10849.00,
        inventory: 0,
        isDefault: false,
      },
    }),
    // Blue Mesh (In Stock)
    db.variant.create({
      data: {
        productId: officeChair.id,
        sku: 'OC-BLUE-MESH-001',
        price: 6509.00,
        comparePrice: 9609.00,
        inventory: 5,
        isDefault: false,
      },
    }),
    // Blue Leather (Out of Stock)
    db.variant.create({
      data: {
        productId: officeChair.id,
        sku: 'OC-BLUE-LEATHER-001',
        price: 8059.00,
        comparePrice: 11159.00,
        inventory: 0,
        isDefault: false,
      },
    }),
  ])

  // Connect chair variants to option values
  await Promise.all([
    db.variant.update({
      where: { id: chairVariants[0].id },
      data: { options: { connect: [{ id: chairColors[0].id }, { id: chairMaterials[0].id }] } }
    }),
    db.variant.update({
      where: { id: chairVariants[1].id },
      data: { options: { connect: [{ id: chairColors[0].id }, { id: chairMaterials[1].id }] } }
    }),
    db.variant.update({
      where: { id: chairVariants[2].id },
      data: { options: { connect: [{ id: chairColors[1].id }, { id: chairMaterials[0].id }] } }
    }),
    db.variant.update({
      where: { id: chairVariants[3].id },
      data: { options: { connect: [{ id: chairColors[1].id }, { id: chairMaterials[1].id }] } }
    }),
    db.variant.update({
      where: { id: chairVariants[4].id },
      data: { options: { connect: [{ id: chairColors[2].id }, { id: chairMaterials[0].id }] } }
    }),
    db.variant.update({
      where: { id: chairVariants[5].id },
      data: { options: { connect: [{ id: chairColors[2].id }, { id: chairMaterials[1].id }] } }
    }),
  ])

  // Add product-level media for office chair
  await Promise.all([
    db.media.create({
      data: {
        productId: officeChair.id,
        url: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800',
        altText: 'Ergonomic office chair with lumbar support',
        position: 0,
      },
    }),
    db.media.create({
      data: {
        productId: officeChair.id,
        url: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800',
        altText: 'Office chair detail view',
        position: 1,
      },
    }),
  ])

  // Add variant-specific images for office chair colors
  await Promise.all([
    // Black variants
    db.media.create({
      data: {
        productId: officeChair.id,
        variantId: chairVariants[0].id, // Black Mesh
        url: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800&sat=-100',
        altText: 'Black mesh ergonomic office chair',
        position: 0,
      },
    }),
    db.media.create({
      data: {
        productId: officeChair.id,
        variantId: chairVariants[1].id, // Black Leather
        url: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800&sat=-100&con=20',
        altText: 'Black leather ergonomic office chair',
        position: 0,
      },
    }),
    // Gray variants
    db.media.create({
      data: {
        productId: officeChair.id,
        variantId: chairVariants[2].id, // Gray Mesh
        url: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800&hue=0&sat=0&bright=20',
        altText: 'Gray mesh ergonomic office chair',
        position: 0,
      },
    }),
    db.media.create({
      data: {
        productId: officeChair.id,
        variantId: chairVariants[3].id, // Gray Leather
        url: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800&hue=0&sat=0&bright=20&con=20',
        altText: 'Gray leather ergonomic office chair',
        position: 0,
      },
    }),
    // Blue variants
    db.media.create({
      data: {
        productId: officeChair.id,
        variantId: chairVariants[4].id, // Blue Mesh
        url: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800&hue=220&sat=50',
        altText: 'Blue mesh ergonomic office chair',
        position: 0,
      },
    }),
    db.media.create({
      data: {
        productId: officeChair.id,
        variantId: chairVariants[5].id, // Blue Leather
        url: 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800&hue=220&sat=50&con=20',
        altText: 'Blue leather ergonomic office chair',
        position: 0,
      },
    }),
  ])

  products.push(officeChair)

  // 3. Simple product without variants (Standing Desk)
  const standingDesk = await db.product.create({
    data: {
      name: 'Electric Standing Desk',
      slug: 'electric-standing-desk',
      description: 'Height-adjustable electric standing desk with memory presets. Transform your workspace for better health and productivity.',
      isActive: true,
      categoryId: categories[1].id,
      price: 18999.00,
      comparePrice: 24799.00,
      weight: 45.0,
      tags: ['standing desk', 'electric', 'adjustable', 'ergonomic', 'health'],
      seoTitle: 'Electric Standing Desk - Height Adjustable Workspace',
      seoDescription: 'Premium electric standing desk with memory presets. Improve your health and productivity with our height-adjustable workspace solution.',
    },
  })

  // Create single variant for standing desk
  const standingDeskVariant = await db.variant.create({
    data: {
      productId: standingDesk.id,
      sku: 'SD-ELECTRIC-001',
      price: 18599.00,
      comparePrice: 24799.00,
      inventory: 6,
      isDefault: true,
    },
  })

  // Add media for standing desk
  await Promise.all([
    db.media.create({
      data: {
        productId: standingDesk.id,
        url: 'https://images.unsplash.com/photo-1631679706909-faf1f2986f8d?w=800',
        altText: 'Electric standing desk in modern office',
        position: 0,
      },
    }),
    db.media.create({
      data: {
        productId: standingDesk.id,
        url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800',
        altText: 'Standing desk height adjustment mechanism',
        position: 1,
      },
    }),
  ])

  products.push(standingDesk)

  console.log('✅ Created products with variants and options')

  // Create furniture-themed coupons
  const coupons = await Promise.all([
    db.coupon.create({
      data: {
        code: 'FURNITURE20',
        type: 'PERCENT',
        value: 20,
        minSubtotal: 6200,
        maxRedemptions: 100,
        perCustomer: 1,
        usageCount: 0,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true,
      },
    }),
    db.coupon.create({
      data: {
        code: 'NEWCUSTOMER',
        type: 'FIXED',
        value: 1550,
        minSubtotal: 9300,
        maxRedemptions: 50,
        perCustomer: 1,
        usageCount: 0,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        isActive: true,
      },
    }),
    db.coupon.create({
      data: {
        code: 'OFFICE15',
        type: 'PERCENT',
        value: 15,
        minSubtotal: 4650,
        maxRedemptions: 200,
        perCustomer: 2,
        usageCount: 0,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        isActive: true,
      },
    }),
  ])

  console.log('✅ Created coupons')

  // Create sample customers
  const customers = await Promise.all([
    db.customer.create({
      data: {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        addresses: {
          create: {
            firstName: 'John',
            lastName: 'Doe',
            company: 'Tech Corp',
            line1: '123 Main Street',
            line2: 'Apt 4B',
            city: 'New York',
            state: 'NY',
            buildingNumber: '123',
            floorNumber: '4',
            apartmentNumber: '4B',
            country: 'US',
            phone: '+1234567890',
            isDefault: true,
          }
        }
      }
    }),
    db.customer.create({
      data: {
        email: 'sarah.wilson@example.com',
        firstName: 'Sarah',
        lastName: 'Wilson',
        phone: '+1987654321',
        addresses: {
          create: {
            firstName: 'Sarah',
            lastName: 'Wilson',
            line1: '456 Oak Avenue',
            city: 'Los Angeles',
            state: 'CA',
            buildingNumber: '456',
            floorNumber: '2',
            apartmentNumber: '2A',
            country: 'US',
            phone: '+1987654321',
            isDefault: true,
          }
        }
      }
    }),
    db.customer.create({
      data: {
        email: 'mike.johnson@example.com',
        firstName: 'Mike',
        lastName: 'Johnson',
        phone: '+1555123456',
        addresses: {
          create: {
            firstName: 'Mike',
            lastName: 'Johnson',
            company: 'Design Studio',
            line1: '789 Pine Street',
            city: 'Chicago',
            state: 'IL',
            buildingNumber: '789',
            floorNumber: '3',
            apartmentNumber: '3C',
            country: 'US',
            phone: '+1555123456',
            isDefault: true,
          }
        }
      }
    }),
  ])

  console.log('✅ Created customers')

  // Get customer addresses for orders
  const customerAddresses = await Promise.all([
    db.address.findFirst({ where: { customerId: customers[0].id } }),
    db.address.findFirst({ where: { customerId: customers[1].id } }),
    db.address.findFirst({ where: { customerId: customers[2].id } }),
  ])

  // Create sample orders
  const orders = await Promise.all([
    // Completed order
    db.order.create({
      data: {
        customerId: customers[0].id,
        addressId: customerAddresses[0]!.id,
        orderNumber: 'ORD-2024-001',
        status: 'DELIVERED',
        subtotal: 9299.00,
        shippingCost: 775.00,
        taxAmount: 813.75,
        total: 10887.75,
        contactPhone: '+1234567890',
        items: {
          create: {
            productId: coffeeTable.id,
            variantId: coffeeTableVariants[0].id,
            quantity: 1,
            price: 9299.00,
            title: 'Modern Glass Coffee Table',
            variantTitle: 'Clear Glass / Small (90cm)',
          }
        }
      }
    }),
    // Processing order
    db.order.create({
      data: {
        customerId: customers[1].id,
        addressId: customerAddresses[1]!.id,
        orderNumber: 'ORD-2024-002',
        status: 'CONFIRMED',
        subtotal: 6199.00,
        shippingCost: 620.00,
        taxAmount: 545.60,
        total: 7364.60,
        contactPhone: '+1987654321',
        items: {
          create: {
            productId: officeChair.id,
            variantId: chairVariants[0].id,
            quantity: 1,
            price: 6199.00,
            title: 'Ergonomic Office Chair',
            variantTitle: 'Black / Mesh',
          }
        }
      }
    }),
    // Shipped order
    db.order.create({
      data: {
        customerId: customers[2].id,
        addressId: customerAddresses[2]!.id,
        orderNumber: 'ORD-2024-003',
        status: 'OUT_FOR_DELIVERY',
        subtotal: 18599.00,
        shippingCost: 1550.00,
        taxAmount: 1612.00,
        total: 21761.00,
        contactPhone: '+1555123456',
        couponId: coupons[0].id,
        discountAmount: 3719.00,
        items: {
          create: {
            productId: standingDesk.id,
            variantId: standingDeskVariant.id,
            quantity: 1,
            price: 18599.00,
            title: 'Electric Standing Desk',
            variantTitle: 'Standard',
          }
        }
      }
    }),
  ])

  console.log('✅ Created orders')

  // Create more products for better testing
  const modernSofa = await db.product.create({
    data: {
      name: 'Modern 3-Seater Sofa',
      slug: 'modern-3-seater-sofa',
      description: 'Luxurious 3-seater sofa with premium fabric upholstery. Perfect for modern living rooms and entertainment spaces.',
      isActive: true,
      categoryId: categories[4].id, // Sofas
      price: 24999.00,
      comparePrice: 31999.00,
      weight: 85.0,
      tags: ['sofa', 'modern', 'luxury', 'living room', '3-seater'],
      seoTitle: 'Modern 3-Seater Sofa - Premium Living Room Furniture',
      seoDescription: 'Luxury 3-seater sofa with premium fabric upholstery. Transform your living room with our modern furniture collection.',
    },
  })

  const sofaVariant = await db.variant.create({
    data: {
      productId: modernSofa.id,
      sku: 'SOFA-3SEAT-001',
      price: 24999.00,
      comparePrice: 31999.00,
      inventory: 4,
      isDefault: true,
    },
  })

  await db.media.create({
    data: {
      productId: modernSofa.id,
      url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      altText: 'Modern 3-seater sofa in living room',
      position: 0,
    },
  })

  const diningTable = await db.product.create({
    data: {
      name: 'Oak Dining Table',
      slug: 'oak-dining-table',
      description: 'Solid oak dining table that seats 6 people comfortably. Handcrafted with attention to detail and built to last generations.',
      isActive: true,
      categoryId: categories[5].id, // Dining Tables
      price: 15499.00,
      comparePrice: 19999.00,
      weight: 65.0,
      tags: ['dining table', 'oak', 'solid wood', 'handcrafted', '6-seater'],
      seoTitle: 'Oak Dining Table - Solid Wood 6-Seater',
      seoDescription: 'Handcrafted solid oak dining table seats 6 people. Premium quality wood furniture built to last generations.',
    },
  })

  const diningTableVariant = await db.variant.create({
    data: {
      productId: diningTable.id,
      sku: 'DT-OAK-6SEAT-001',
      price: 15499.00,
      comparePrice: 19999.00,
      inventory: 3,
      isDefault: true,
    },
  })

  await db.media.create({
    data: {
      productId: diningTable.id,
      url: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=800',
      altText: 'Solid oak dining table with 6 chairs',
      position: 0,
    },
  })

  const bookshelf = await db.product.create({
    data: {
      name: 'Industrial Bookshelf',
      slug: 'industrial-bookshelf',
      description: 'Industrial-style bookshelf with metal frame and wooden shelves. Perfect for displaying books, decor, and personal items.',
      isActive: true,
      categoryId: categories[3].id, // Storage
      price: 4999.00,
      comparePrice: 6999.00,
      weight: 35.0,
      tags: ['bookshelf', 'industrial', 'storage', 'metal', 'wood'],
      seoTitle: 'Industrial Bookshelf - Metal Frame Storage',
      seoDescription: 'Industrial-style bookshelf with metal frame and wooden shelves. Stylish storage solution for any room.',
    },
  })

  const bookshelfVariant = await db.variant.create({
    data: {
      productId: bookshelf.id,
      sku: 'BS-INDUSTRIAL-001',
      price: 4999.00,
      comparePrice: 6999.00,
      inventory: 12,
      isDefault: true,
    },
  })

  await db.media.create({
    data: {
      productId: bookshelf.id,
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      altText: 'Industrial bookshelf with books and decor',
      position: 0,
    },
  })

  console.log('✅ Created additional products')

  // Create test users for authentication
  const testUsers = await Promise.all([
    db.user.create({
      data: {
        email: 'user@test.com',
        name: 'Test User',
        role: 'CUSTOMER',
      },
    }),
    db.user.create({
      data: {
        email: 'customer@test.com',
        name: 'Customer User',
        role: 'CUSTOMER',
      },
    }),
  ])

  console.log('✅ Created test users')

  // Create product reviews
  const reviews = await Promise.all([
    db.review.create({
      data: {
        productId: coffeeTable.id,
        userId: testUsers[0].id,
        rating: 5,
        title: 'Beautiful coffee table!',
        comment: 'This coffee table exceeded my expectations. The glass is high quality and the chrome legs are very sturdy. Perfect for my modern living room.',
        isVerified: true,
        helpfulVotes: 12,
      },
    }),
    db.review.create({
      data: {
        productId: coffeeTable.id,
        userId: testUsers[1].id,
        rating: 4,
        title: 'Great quality, fast shipping',
        comment: 'Really happy with this purchase. The table arrived well-packaged and assembly was straightforward. Only minor complaint is it shows fingerprints easily.',
        isVerified: true,
        helpfulVotes: 8,
      },
    }),
    db.review.create({
      data: {
        productId: officeChair.id,
        userId: testUsers[0].id,
        rating: 5,
        title: 'Best chair I\'ve ever owned',
        comment: 'As someone who works from home, this chair has been a game-changer. The lumbar support is excellent and it\'s comfortable for 8+ hour days.',
        isVerified: true,
        helpfulVotes: 15,
      },
    }),
    db.review.create({
      data: {
        productId: standingDesk.id,
        userId: testUsers[1].id,
        rating: 4,
        title: 'Good desk, minor issues',
        comment: 'The desk is solid and the height adjustment works smoothly. The memory presets are convenient. Assembly took longer than expected but overall satisfied.',
        isVerified: false,
        helpfulVotes: 6,
      },
    }),
    db.review.create({
      data: {
        productId: modernSofa.id,
        userId: testUsers[0].id,
        rating: 5,
        title: 'Absolutely love this sofa!',
        comment: 'This sofa is incredibly comfortable and looks amazing in our living room. The fabric quality is excellent and it\'s held up well with daily use.',
        isVerified: true,
        helpfulVotes: 9,
      },
    }),
  ])

  console.log('✅ Created product reviews')

  // Create wishlist items
  await Promise.all([
    db.wishlist.create({
      data: {
        userId: testUsers[0].id,
        productId: diningTable.id,
      },
    }),
    db.wishlist.create({
      data: {
        userId: testUsers[0].id,
        productId: bookshelf.id,
      },
    }),
    db.wishlist.create({
      data: {
        userId: testUsers[1].id,
        productId: modernSofa.id,
      },
    }),
    db.wishlist.create({
      data: {
        userId: testUsers[1].id,
        productId: standingDesk.id,
      },
    }),
  ])

  console.log('✅ Created wishlist items')

  // Create newsletter subscribers
  const subscribers = await Promise.all([
    db.newsletterSubscriber.create({
      data: {
        email: 'subscriber1@example.com',
        firstName: 'Alice',
        lastName: 'Smith',
        isActive: true,
        preferences: {
          newProducts: true,
          promotions: true,
          tips: false,
        },
      },
    }),
    db.newsletterSubscriber.create({
      data: {
        email: 'subscriber2@example.com',
        firstName: 'Bob',
        lastName: 'Brown',
        isActive: true,
        preferences: {
          newProducts: false,
          promotions: true,
          tips: true,
        },
      },
    }),
    db.newsletterSubscriber.create({
      data: {
        email: 'subscriber3@example.com',
        isActive: false,
        preferences: {
          newProducts: true,
          promotions: false,
          tips: false,
        },
      },
    }),
  ])

  console.log('✅ Created newsletter subscribers')

  // Create inventory alerts
  const inventoryAlerts = await Promise.all([
    db.inventoryAlert.create({
      data: {
        productId: coffeeTable.id,
        variantId: coffeeTableVariants[2].id, // Smoked Glass - Small (Low Stock)
        alertType: 'LOW_STOCK',
        threshold: 5,
        isActive: true,
      },
    }),
    db.inventoryAlert.create({
      data: {
        productId: officeChair.id,
        variantId: chairVariants[2].id, // Gray Mesh (Low Stock)
        alertType: 'LOW_STOCK',
        threshold: 5,
        isActive: true,
      },
    }),
    db.inventoryAlert.create({
      data: {
        productId: officeChair.id,
        variantId: chairVariants[3].id, // Gray Leather (Out of Stock)
        alertType: 'OUT_OF_STOCK',
        threshold: 0,
        isActive: true,
        lastAlertSent: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    }),
  ])

  console.log('✅ Created inventory alerts')

  // Create support tickets
  const supportTickets = await Promise.all([
    db.supportTicket.create({
      data: {
        ticketNumber: 'TICKET-20240908-0001',
        subject: 'Question about delivery time',
        description: 'Hi, I placed an order yesterday and wanted to know when I can expect delivery. My order number is ORD-2024-002.',
        status: 'OPEN',
        priority: 'MEDIUM',
        category: 'ORDER',
        customerEmail: 'sarah.wilson@example.com',
        customerName: 'Sarah Wilson',
        customerId: customers[1].id,
      },
    }),
    db.supportTicket.create({
      data: {
        ticketNumber: 'TICKET-20240908-0002',
        subject: 'Assembly instructions missing',
        description: 'I received my coffee table but the assembly instructions were not included in the package. Could you please send them to me?',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        category: 'PRODUCT',
        customerEmail: 'john.doe@example.com',
        customerName: 'John Doe',
        customerId: customers[0].id,
        assignedToId: adminUser.id,
      },
    }),
    db.supportTicket.create({
      data: {
        ticketNumber: 'TICKET-20240908-0003',
        subject: 'Billing inquiry',
        description: 'I was charged twice for my recent order. Can you please check and refund the duplicate charge?',
        status: 'RESOLVED',
        priority: 'URGENT',
        category: 'BILLING',
        customerEmail: 'mike.johnson@example.com',
        customerName: 'Mike Johnson',
        customerId: customers[2].id,
        assignedToId: adminUser.id,
        resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
    }),
  ])

  // Create support messages
  await Promise.all([
    db.supportMessage.create({
      data: {
        ticketId: supportTickets[1].id,
        content: 'Thank you for contacting us. I\'ve located your order and will email you the assembly instructions right away.',
        isFromCustomer: false,
        userId: adminUser.id,
        senderName: 'Admin Support',
      },
    }),
    db.supportMessage.create({
      data: {
        ticketId: supportTickets[1].id,
        content: 'Perfect, I received the instructions. Thank you for the quick response!',
        isFromCustomer: true,
        customerEmail: 'john.doe@example.com',
        senderName: 'John Doe',
      },
    }),
    db.supportMessage.create({
      data: {
        ticketId: supportTickets[2].id,
        content: 'I\'ve reviewed your account and confirmed the duplicate charge. The refund has been processed and should appear in your account within 3-5 business days.',
        isFromCustomer: false,
        userId: adminUser.id,
        senderName: 'Admin Support',
      },
    }),
    db.supportMessage.create({
      data: {
        ticketId: supportTickets[2].id,
        content: 'Thank you so much for resolving this quickly!',
        isFromCustomer: true,
        customerEmail: 'mike.johnson@example.com',
        senderName: 'Mike Johnson',
      },
    }),
  ])

  console.log('✅ Created support tickets and messages')

  // Create shopping carts for test users
  await Promise.all([
    db.cart.create({
      data: {
        sessionId: 'session_' + testUsers[0].id,
        userId: testUsers[0].id,
        items: {
          create: [
            {
              productId: bookshelf.id,
              variantId: bookshelfVariant.id,
              quantity: 1,
            },
            {
              productId: coffeeTable.id,
              variantId: coffeeTableVariants[0].id,
              quantity: 1,
            },
          ],
        },
      },
    }),
    db.cart.create({
      data: {
        sessionId: 'session_' + testUsers[1].id,
        userId: testUsers[1].id,
        items: {
          create: [
            {
              productId: officeChair.id,
              variantId: chairVariants[4].id, // Blue Mesh
              quantity: 2,
            },
          ],
        },
      },
    }),
  ])

  console.log('✅ Created shopping carts')

  const totalProducts = products.length + 3; // Original products + new ones
  const totalReviews = reviews.length;
  const totalSubscribers = subscribers.length;
  const totalTickets = supportTickets.length;
  const totalAlerts = inventoryAlerts.length;

  console.log(`🎉 Seed completed successfully!`)
  console.log(`📊 Created:`)
  console.log(`   - ${categories.length} categories`)
  console.log(`   - ${totalProducts} products with variants and variant-specific images`)
  console.log(`   - ${customers.length} customers with addresses`)
  console.log(`   - ${orders.length} sample orders`)
  console.log(`   - ${coupons.length} coupons`)
  console.log(`   - ${testUsers.length + 1} users (1 admin + ${testUsers.length} regular users)`)
  console.log(`   - ${totalReviews} product reviews`)
  console.log(`   - 4 wishlist items`)
  console.log(`   - ${totalSubscribers} newsletter subscribers`)
  console.log(`   - ${totalAlerts} inventory alerts`)
  console.log(`   - ${totalTickets} support tickets with messages`)
  console.log(`   - 2 shopping carts with items`)
  console.log(`\n🔑 Admin Login:`)
  console.log(`   Email: admin@furniturestore.com`)
  console.log(`   Password: any password (development mode)`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
