import React from 'react';

export const ProductSkeleton = () => (
  <div className="bg-white border rounded-lg p-3 animate-pulse">
    <div className="w-full h-48 bg-gray-200 rounded mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

export const EmptyState = ({ message = "No products found!" }) => (
  <div className="bg-white p-12 rounded-lg text-center border shadow-sm my-8">
    <div className="text-4xl mb-2">🔍</div>
    <h3 className="text-lg font-bold text-gray-800">{message}</h3>
    <p className="text-sm text-gray-500 mt-1">Try searching with a different keyword or category.</p>
  </div>
);