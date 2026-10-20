import express from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get All Products with Search & Filtering
router.get('/', async (req, res) => {
  try {
    const { keyword, category, sort } = req.query;
    let query = {};

    if (keyword && keyword.trim() !== '') {
      query.$or = [
        { title: { $regex: keyword.trim(), $options: 'i' } },
        { description: { $regex: keyword.trim(), $options: 'i' } },
        { brand: { $regex: keyword.trim(), $options: 'i' } },
        { category: { $regex: keyword.trim(), $options: 'i' } },
      ];
    }

    if (category && category !== 'All Products') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    let productQuery = Product.find(query);

    if (sort === 'lowest') {
      productQuery = productQuery.sort({ price: 1 });
    } else if (sort === 'highest') {
      productQuery = productQuery.sort({ price: -1 });
    } else if (sort === 'toprated') {
      productQuery = productQuery.sort({ ratings: -1 });
    } else {
      productQuery = productQuery.sort({ createdAt: -1 });
    }

    const products = await productQuery;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Single Product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create Product (Admin / Seller protected)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      discountPrice,
      category,
      subcategory,
      brand,
      images,
      stock,
    } = req.body;

    if (!title || !description || price === undefined) {
      return res.status(400).json({ message: 'Title, description and price are required' });
    }

    const imageArray = Array.isArray(images) && images.length > 0 
      ? images 
      : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600'];

    const product = new Product({
      title,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      category: category || 'Electronics',
      subcategory: subcategory || '',
      brand: brand || 'Nexus',
      images: imageArray,
      stock: Number(stock || 10),
      ratings: 4.8,
      numReviews: 1,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    Object.assign(product, req.body);
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete Product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
