'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Users, ShoppingBag, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { partnerService } from '@/services/partner.service';
import { PartnerClothes } from '@/types/partner';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState<PartnerClothes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const response = await partnerService.getPublicClothes();
      // Get the last 8 uploaded dresses (most recent)
      if (response && response.data) {
        const sortedByDate = response.data.sort((a: PartnerClothes, b: PartnerClothes) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setFeaturedProducts(sortedByDate.slice(0, 8));
      } else {
        setFeaturedProducts([]);
      }
    } catch (error) {
      console.error('Error loading featured products:', error);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/5709643/pexels-photo-5709643.jpeg"
            alt="Fashion background"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-8 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
            Find Your Perfect Fit,<br />From Anywhere.
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed max-w-3xl mx-auto">
            Experience the newest trends. Try on clothes from top brands and partner shops from the comfort of your home.
          </p>
          <Button
            size="lg"
            className="bg-white hover:bg-gray-100 text-gray-900 px-10 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => router.push('/auth/register')}
          >
            Start Styling Now
          </Button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your personalized styling path in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#e2c2b7] rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Scan Your Body</h3>
              <p className="text-gray-600">
                Create your profile and let our AI analyze your measurements for the perfect fit recommendations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#e2c2b7] rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Browse & Select</h3>
              <p className="text-gray-600">
                Explore curated collections from our partner shops and choose outfits that match your style.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#e2c2b7] rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-8 w-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Style It On You</h3>
              <p className="text-gray-600">
                Visualize how clothes look on you with our virtual try-on and get personalized styling advice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections Section */}
      <section className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Collections</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our latest arrivals from partner shops
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading collections...</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No featured products available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Card
                  key={product._id || product.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => router.push('/auth/login')}
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-[#e2c2b7] to-[#d4b5a8] overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-20 w-20 text-white opacity-40" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-600 capitalize mb-3">
                      {product.brand}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">LKR {product.price}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[#e2c2b7] hover:text-[#d4b5a8]"
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by shoppers everywhere</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-gray-600">SL</span>
                </div>
                <div>
                  <h4 className="font-semibold">Sarah L.</h4>
                  <div className="flex text-yellow-400">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600">
                "I was a little skeptical at first, but this platform made finding the perfect dress so easy. The fit was spot on!"
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-gray-600">AR</span>
                </div>
                <div>
                  <h4 className="font-semibold">Alex R.</h4>
                  <div className="flex text-yellow-400">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600">
                "The virtual try-on feature is a game changer! I can see exactly how clothes will look before buying."
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-gray-600">JK</span>
                </div>
                <div>
                  <h4 className="font-semibold">Jessica K.</h4>
                  <div className="flex text-yellow-400">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600">
                "Amazing selection from local shops! I love supporting small businesses while looking great."
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
