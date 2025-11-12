"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import ReviewCard from "../../components/ReviewCard";
import "./restaurant.css";

// Type pour un avis
interface Review {
  author: string;
  text: string;
  rating: string;
  date: string;
}

export default function RestaurantPage() {
  const { slug } = useParams();
  const router = useRouter();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function fetchReviews() {
      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        
        console.log(`Chargement des avis pour: ${slug}`);

        const res = await axios.get(`${apiUrl}/api/restaurant/${slug}/reviews`);
        
        console.log("Avis reçus:", res.data);
        
        // Le backend retourne { slug, count, reviews }
        setReviews(res.data.reviews || res.data);
        
      } catch (err: any) {
        console.error("❌ Erreur:", err);
        setError(
          err.response?.data?.error || 
          "Impossible de récupérer les avis. Vérifiez que le serveur backend est lancé."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [slug]);

  // Formate le slug en titre lisible
  const restaurantName = typeof slug === 'string' 
    ? slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'Restaurant';

  return (
    <main className="restaurant-page">
      {/* Bouton retour */}
      <button onClick={() => router.push("/")} className="back-btn">
        ⬅ Retour à la recherche
      </button>

      {/* En-tête */}
      <div className="restaurant-header">
        <h1 className="restaurant-title">{restaurantName}</h1>
        <p className="restaurant-subtitle">Les 10 derniers avis</p>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Chargement des avis...</p>
        </div>
      )}

      {/* Avis */}
      {!loading && !error && reviews.length > 0 && (
        <div className="reviews">
          {reviews.map((rev, i) => (
            <ReviewCard key={i} review={rev} />
          ))}
        </div>
      )}

      {/* Aucun avis */}
      {!loading && !error && reviews.length === 0 && (
        <div className="empty-reviews">
          <p>Aucun avis disponible pour ce restaurant</p>
        </div>
      )}
    </main>
  );
}
