# ⚡ NexuStore - Full-Stack E-Commerce Web Application (MERN)

A modern, high-performance, full-stack e-commerce web platform built with **React 18**, **Tailwind CSS**, **Node.js Express REST API**, and **MongoDB**.

---

## 🌟 Key Features

### 🛍️ Customer Storefront

- **Live Search & Filter**: Real-time product search with category pills (*Electronics, Fashion, Home & Living, Accessories*) and price sorting.
- **Interactive Product Catalog**: High-res images, stock indicators, ratings & reviews.
- **Smart Shopping Cart**: Real-time badge counter, dynamic quantity selectors, stock limits, and free shipping calculator (Free delivery on orders > Rs. 3,000).
- **Checkout & COD**: Delivery address form with Cash on Delivery (COD) and Card options.
- **Order Tracking & Invoices**: Real-time 4-step pipeline status (*Placed ➔ Processing ➔ Shipped ➔ Delivered*) with printable receipts/invoices.
- **Wishlist**: Save favorite items and move them to cart with one click.

### 🛡️ Protected Admin Portal (`/admin`)

- **Security Clearance Gate**: Password-protected entrance with 256-bit encryption check.
- **Real-Time Analytics**: Net sales (Rs.), total orders, inventory counters, and zero-stock alerts.
- **Product CRUD**: Add new items with image previews, edit prices/stock, and delete products directly from MongoDB.
- **Order Dispatch Pipeline**: Change order fulfillment statuses (*Pending ➔ Processing ➔ Shipped ➔ Delivered ➔ Cancelled*).
- **REST API & MongoDB Telemetry**: Live telemetry dashboard monitoring database health and collections.
- **One-Click Re-Seeder**: Instantly populate demo data and default accounts.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM, React Hot Toast, Lucide Icons
- **Backend**: Node.js, Express.js (Modern ES Modules)
- **Database**: MongoDB with Mongoose ODM
- **Security**: JWT (JSON Web Tokens), Bcrypt Password Encryption

---

## 🚀 Quick Start Guide

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) running locally or MongoDB Atlas URI

### 2. Installation

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/ishmauroojkml-max/nexustore.git
cd nexustore

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Variables

Create a `.env` file in the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/nexustore
JWT_SECRET=supersecretnexustorekey123
```

### 4. Seed Database (Optional)

```bash
cd backend
npm run seed
```

### 5. Run Application

```bash
# Start Unified Server (Port 5000)
cd backend
npm start
```

Or on Windows, simply double-click:
`start-website.bat`

---

## 🔗 Live Application Endpoints

- **Web Storefront**: `http://localhost:5000/`
- **Admin Control Panel**: `http://localhost:5000/admin`
- **REST API Telemetry**: `http://localhost:5000/api/status`
- **Products REST API**: `http://localhost:5000/api/products`

---

## 🔑 Demo Credentials

- **Admin Account**:
  - Email: `admin@nexustore.com`
  - Password: `123456`
- **Customer Account**:
  - Email: `customer@nexustore.com`
  - Password: `123456`

---

## 📄 License

MIT License. Built with ❤️ for seamless e-commerce.
