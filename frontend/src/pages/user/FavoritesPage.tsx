import React, { useState } from 'react';
import { Heart, Utensils } from 'lucide-react';
import { MOCK_RESTAURANTS } from '../../services/mockData';
import { RestaurantCard } from '../../components/public/RestaurantCard';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export const FavoritesPage: React.FC = () => {
  const [favorites] = useState(MOCK_RESTAURANTS.slice(0, 3));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#46564E]">Quán ăn yêu thích</h1>
          <p className="text-xs sm:text-sm text-fm-muted mt-1">Danh sách quán và món ăn bạn đã lưu để ghé thăm.</p>
        </div>
        <Link to="/restaurants">
          <Button variant="outline" size="sm" leftIcon={<Utensils size={14} />}>
            Khám phá thêm
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {favorites.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
};
