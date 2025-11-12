"use client";

import { useState } from "react";
import axios from "axios";
import SearchBar from "./components/SearchBar";
import RestaurantCard from "./components/RestaurantCard";
import "./style/page.css";

// Type pour un restaurant
interface Restaurant {
  name: string;
  slug: string;
  image: string;
  url: string;
  rating?: number;     // note moyenne
  reviews?: number;    // nombre d'avis
  deliveryTime?: string;
}

export default function Home() {
  const [results, setResults] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(query: string) {
    if (!query || query.trim() === "") {
      setError("Veuillez entrer un terme de recherche");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      
      console.log("Recherche en cours...", query);
      
      // Récupère la liste des restaurants
      const res = await axios.get(`${apiUrl}/api/restaurant?query=${encodeURIComponent(query)}`);
      const restaurants: Restaurant[] = res.data.results || [];

      // Pour chaque restaurant, récupère la note globale
      const restaurantsWithRating = await Promise.all(
        restaurants.map(async (r) => {
          try {
            const ratingRes = await axios.get(`${apiUrl}/api/restaurant/${r.url.split('/').pop()}/rating`);
            return { ...r, ...ratingRes.data };
          } catch (err) {
            console.warn(`Impossible de récupérer la note pour ${r.name}`);
            return r;
          }
        })
      );

      console.log("Résultats enrichis:", restaurantsWithRating);
      setResults(restaurantsWithRating);

    } catch (err: any) {
      console.error("Erreur:", err);
      setError(
        err.response?.data?.error || 
        "Impossible de récupérer les restaurants. Vérifiez que le serveur backend est lancé."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="main">
      <div className="header">
        <h1 className="title">Recherche Deliveroo</h1>
        <p className="subtitle">Trouvez votre restaurant préféré et consultez les notes</p>
      </div>

      <SearchBar onSearch={handleSearch} />

      {/* Message d'erreur */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Loading spinner */}
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Recherche en cours...</p>
        </div>
      )}

      {/* Résultats */}
      {!loading && results.length > 0 && (
        <>
          <div className="results-count">
            {results.length} restaurant{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
          </div>
          <div className="results">
            {results.map((r, index) => (
              <RestaurantCard key={`${r.slug}-${index}`} restaurant={r} />
            ))}
          </div>
        </>
      )}

      {/* Aucun résultat */}
      {!loading && !error && results.length === 0 && (
        <div className="empty-state">
          <p>Recherchez un restaurant pour commencer</p>
        </div>
      )}
    </main>
  );
}
