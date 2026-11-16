import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { FilterChips } from '../../components/public/FilterChips';
import { RestaurantCard } from '../../components/public/RestaurantCard';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useRestaurants } from '../../hooks/useRestaurants';

const CATEGORY_CHIPS = [
  { id: 'pho-bun', label: '🍜 Phở & Bún' },
  { id: 'com', label: '🍚 Cơm bình dân' },
  { id: 'binh-dan', label: '🍲 Bình dân giá rẻ' },
  { id: 'do-nuong', label: '🍢 Đồ nướng' },
  { id: 'giai-khat', label: '☕ Giải khát & Trà đá' },
];

export const RestaurantsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, isLoading, error, refetch } = useRestaurants({
    page,
    limit: 12,
    search: debouncedSearch,
    category: selectedCategories[0],
  });

  const handleSearch = (q: string) => {
    setSearch(q);
    const timeout = setTimeout(() => {
      setDebouncedSearch(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? [] : [id]
    );
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#46564E] tracking-tight">
          Danh bạ quán ăn bình dân Hà Nội
        </h1>
        <p className="text-xs sm:text-sm text-fm-muted mt-1">
          Tìm kiếm quán ngon theo món, khu vực hoặc khoảng giá đã được xác minh.
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <Input
          placeholder="Tìm kiếm theo tên quán, địa chỉ (Phở Thìn, Lò Đúc, Bún chả...)"
          leftIcon={<Search size={18} className="text-gray-400" />}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="text-sm shadow-xs"
        />
      </div>

      {/* Category filter chips */}
      <div className="mb-6">
        <FilterChips chips={CATEGORY_CHIPS} selected={selectedCategories} onToggle={toggleCategory} />
      </div>

      {/* Results grid */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {error && <ErrorState onRetry={() => refetch()} message="Không thể tải danh sách quán ăn." />}

      {!isLoading && !error && data?.data.length === 0 && (
        <EmptyState
          title="Không tìm thấy quán ăn phù hợp"
          description="Hãy thử tìm kiếm với từ khóa khác hoặc bỏ chọn bộ lọc danh mục."
        />
      )}

      {data && data.data.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {data.data.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>

          {/* Pagination */}
          {data.total > 12 && (
            <div className="flex justify-center items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Trang trước
              </Button>
              <span className="px-4 py-2 text-xs font-semibold text-fm-muted bg-white rounded-btn border border-[#E8E2D8]">
                Trang {page} / {Math.ceil(data.total / 12)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(data.total / 12)}
                onClick={() => setPage((p) => p + 1)}
              >
                Trang sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
