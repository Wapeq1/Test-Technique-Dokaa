import express from "express";
import { searchRestaurants, getRestaurantRating } from "../scrapers/deliverooScraper.js";

const router = express.Router();

/**
 * GET /api/restaurant?query=pizza
 * Recherche des restaurants sur Deliveroo
 */
router.get("/", async (req, res) => {
  try {
    const query = req.query.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ 
        error: "Missing query parameter",
        example: "/api/restaurant?query=pizza"
      });
    }
    
    console.log(`🔍 Recherche de: "${query}"`);
    
    // Appel du scraper
    const results = await searchRestaurants(query);
    
    console.log(`${results.length} restaurants trouvés`);
    
    res.json({
      query,
      count: results.length,
      results
    });
    
  } catch (error) {
    console.error("❌ Erreur dans /api/restaurant:", error);
    res.status(500).json({ 
      error: "Failed to search restaurants",
      message: error.message 
    });
  }
});

/**
 * GET /api/restaurant/:slug/rating
 * Récupère la note globale et le nombre d'avis d'un restaurant
 */
router.get("/:slug/rating", async (req, res) => {
  try {
    const { slug } = req.params;
    
    if (!slug || slug.trim() === "") {
      return res.status(400).json({ 
        error: "Missing slug parameter" 
      });
    }
    
    console.log(`📝 Récupération de la note pour: "${slug}"`);
    
    // Appel du scraper
    const ratingData = await getRestaurantRating(slug);
    
    console.log(`Note récupérée: ${ratingData.rating} (${ratingData.reviews} avis)`);
    
    res.json({
      slug,
      ...ratingData
    });
    
  } catch (error) {
    console.error("❌ Erreur dans /api/restaurant/:slug/rating:", error);
    res.status(500).json({ 
      error: "Failed to fetch restaurant rating",
      message: error.message 
    });
  }
});

/**
 * GET /api/restaurant/:slug/info
 * Récupère les infos complètes d'un restaurant (bonus)
 */
router.get("/:slug/info", async (req, res) => {
  try {
    const { slug } = req.params;

    res.json({
      slug,
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      message: "Info endpoint - à étendre si besoin"
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to fetch restaurant info",
      message: error.message 
    });
  }
});

export default router;
