"use client";

import Link from "next/link";
import "./RestaurantCard.css";

interface Restaurant {
  name: string;
  slug: string;
  image: string;
  url: string;
  rating?: number | string;  // peut être string ou number
  reviews?: number;           // nombre d'avis
  deliveryTime?: string;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  // Conversion sécurisée de rating en nombre
  const numericRating = restaurant.rating !== undefined ? Number(restaurant.rating) : undefined;

  return (
    <Link href={`/restaurant/${restaurant.slug}`} className="restaurant-card">
      {/* Image du restaurant */}
      <div className="card-image-wrapper">
        {restaurant.image ? (
          <img 
            src={restaurant.image} 
            alt={restaurant.name}
            className="card-image"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400";
            }}
          />
        ) : (
          <div className="card-image-placeholder">
            🍽️
          </div>
        )}
      </div>

      {/* Contenu de la carte */}
      <div className="card-content">
        <h3 className="card-title">{restaurant.name}</h3>
        
        <div className="card-meta">
          {numericRating !== undefined && (
            <span className="card-rating">
              {numericRating.toFixed(1)}
              {restaurant.reviews !== undefined && ` (${restaurant.reviews})`}
            </span>
          )}
          
          {restaurant.deliveryTime && (
            <span className="card-delivery">
              {restaurant.deliveryTime}
            </span>
          )}
        </div>
        
        <div className="card-action">
          <span className="view-reviews">
            Voir les avis →
          </span>
        </div>
      </div>
    </Link>
  );
}
