import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();
await connectDB();

const sampleProducts = [
  {
    title: 'Wireless Bluetooth Earbuds Pro (Active Noise Cancelling)',
    description: 'Premium wireless earbuds with crystal-clear audio, deep punchy bass, active noise cancellation, and up to 36 hours total battery life with wireless charging case.',
    price: 4999,
    discountPrice: 3499,
    category: 'Electronics',
    brand: 'AudioTech',
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700&auto=format&fit=crop&q=80'],
    stock: 25,
    ratings: 4.8,
    numReviews: 34
  },
  {
    title: 'Smart Fitness Watch Series 8 (Amoled Display & SpO2)',
    description: 'Track your steps, heart rate, blood oxygen levels, and sleep patterns with vibrant AMOLED touch display, Bluetooth calling, and 7-day battery.',
    price: 7500,
    discountPrice: 5499,
    category: 'Electronics',
    brand: 'FitLife',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=80'],
    stock: 18,
    ratings: 4.7,
    numReviews: 28
  },
  {
    title: 'Ultra-Slim Gaming Mechanical Keyboard (RGB Backlit)',
    description: 'High-precision mechanical switches, customizable RGB backlighting per key, durable aluminum frame, and detachable Type-C braided cable.',
    price: 8999,
    discountPrice: 6999,
    category: 'Electronics',
    brand: 'KeyMaster',
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&auto=format&fit=crop&q=80'],
    stock: 12,
    ratings: 4.9,
    numReviews: 52
  },
  {
    title: '4K Ultra HD Action Camera with Waterproof Case',
    description: 'Capture high-speed outdoor adventures in stunning 4K 60FPS with 6-axis electronic image stabilization and dual screens.',
    price: 14500,
    discountPrice: 11999,
    category: 'Electronics',
    brand: 'VibeCam',
    images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=700&auto=format&fit=crop&q=80'],
    stock: 8,
    ratings: 4.6,
    numReviews: 19
  },
  {
    title: 'Men Classic Slim-Fit Denim Jacket',
    description: 'Crafted from premium durable cotton denim with modern tailored silhouette, buttoned flap chest pockets, and comfortable stretch.',
    price: 5200,
    discountPrice: 3899,
    category: 'Fashion',
    brand: 'UrbanStyle',
    images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=700&auto=format&fit=crop&q=80'],
    stock: 30,
    ratings: 4.5,
    numReviews: 41
  },
  {
    title: 'Premium Leather Minimalist Sneakers',
    description: 'Handcrafted genuine leather low-top sneakers featuring cushioned memory foam insole and durable rubber outsole for all-day comfort.',
    price: 6800,
    discountPrice: 4999,
    category: 'Fashion',
    brand: 'SoleCraft',
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=700&auto=format&fit=crop&q=80'],
    stock: 14,
    ratings: 4.8,
    numReviews: 63
  },
  {
    title: 'Nordic Style Ceramic Coffee Mug Set (4-Pack)',
    description: 'Artisanal matte glazed ceramic mugs with wooden handles and minimalist bamboo coasters. Microwave and dishwasher safe.',
    price: 3200,
    discountPrice: 2299,
    category: 'Home & Living',
    brand: 'HomeNest',
    images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=700&auto=format&fit=crop&q=80'],
    stock: 22,
    ratings: 4.9,
    numReviews: 15
  },
  {
    title: 'Modern Minimalist Desk Lamp with Wireless Charging',
    description: 'Sleek architectural LED desk lamp with 5 color temperatures, step-less dimming, integrated 15W fast wireless charging pad, and USB output.',
    price: 6400,
    discountPrice: 4799,
    category: 'Home & Living',
    brand: 'Lumiere',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=700&auto=format&fit=crop&q=80'],
    stock: 16,
    ratings: 4.7,
    numReviews: 22
  },
  {
    title: 'Luxury Chronograph Stainless Steel Watch',
    description: 'Precision Japanese quartz movement, scratch-resistant sapphire crystal glass, 50m water resistance, and polished stainless steel strap.',
    price: 12000,
    discountPrice: 8999,
    category: 'Accessories',
    brand: 'CrownHorology',
    images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=700&auto=format&fit=crop&q=80'],
    stock: 9,
    ratings: 4.9,
    numReviews: 38
  },
  {
    title: 'Polarized Aviator Sunglasses (UV400 Protection)',
    description: 'Classic aviator design featuring lightweight titanium alloy frame and polarized glare-reducing lenses for driving and outdoors.',
    price: 3900,
    discountPrice: 2499,
    category: 'Accessories',
    brand: 'SunRay',
    images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=700&auto=format&fit=crop&q=80'],
    stock: 40,
    ratings: 4.6,
    numReviews: 47
  }
];

const importData = async () => {
  try {
    await Product.deleteMany();
    await Product.insertMany(sampleProducts);

    // Create or update default demo user and admin
    const salt = await bcrypt.genSalt(10);
    const demoPassword = await bcrypt.hash('123456', salt);

    await User.deleteMany();
    await User.create([
      {
        name: 'Nexus Admin',
        email: 'admin@nexustore.com',
        password: demoPassword,
        role: 'admin',
        phone: '03001234567',
        address: { street: '123 Tech Avenue', city: 'Lahore', country: 'Pakistan' }
      },
      {
        name: 'Demo Customer',
        email: 'customer@nexustore.com',
        password: demoPassword,
        role: 'customer',
        phone: '03111234567',
        address: { street: '45 Mall Road', city: 'Karachi', country: 'Pakistan' }
      }
    ]);

    console.log('Sample Products & Users Imported Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    process.exit(1);
  }
};

importData();
