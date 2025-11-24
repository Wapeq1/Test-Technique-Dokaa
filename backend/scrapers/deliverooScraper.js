import axios from 'axios';
import * as cheerio from 'cheerio';

const DELIVEROO_BASE_URL = "https://deliveroo.fr/fr/restaurants/marseille/marseille-port?q=";

/**
 * Recherche de restaurants Deliveroo (Marseille - Port)
 * @param {string} query - Terme recherché (ex: "pizza", "burger", "sushi")
 * @returns {Promise<Array>} Liste de restaurants trouvés
 */
export async function searchRestaurants(query) {
  try {
    const searchUrl = `${DELIVEROO_BASE_URL}${encodeURIComponent(query)}`;
    console.log(`Scraping: ${searchUrl}`);

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const restaurants = [];

    // Sélectionne les cartes de restaurants
    $('[data-testid="restaurant-card"], a[href*="/menu/"]').each((i, el) => {
      const $el = $(el);
      const href = $el.attr('href');
      if (!href || !href.includes('/menu/')) return;

      const name =
        $el.find('h3, [data-testid="restaurant-name"]').text().trim() ||
        href.split('/').pop();

      const image =
        $el.find('img').attr('src') ||
        $el.find('img').attr('data-src') ||
        '';

      const rating =
        $el.find('[data-testid="rating"], [class*="Rating"]').text().trim() || 'N/A';

      const deliveryTime =
        $el.find('[data-testid="delivery-time"], [class*="Time"]').text().trim() || 'N/A';

      restaurants.push({
        name,
        image,
        url: `https://deliveroo.fr${href}`,
        rating,
        deliveryTime,
      });
    });

    if (restaurants.length === 0) {
      console.warn('Aucun restaurant trouvé, fallback vers données de démo.');
      return getDemoRestaurants(query);
    }

    console.log(`${restaurants.length} restaurants trouvés.`);
    return restaurants;
  } catch (error) {
    console.error('❌ Erreur scraping restaurants:', error.message);
    return getDemoRestaurants(query);
  }
}

/**
 * Récupère la note globale d’un restaurant Deliveroo (sans Puppeteer)
 * @param {string} slug - Slug du restaurant (ex: "monop-joliette-marseille")
 * @returns {Promise<Object>} Note moyenne et nombre d’avis
 */
export async function getRestaurantRating(slug) {
  try {
    const url = `https://deliveroo.fr/fr/menu/marseille/${slug}`;
    console.log(`Scraping notes: ${url}`);

    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    // Recherche d’un bloc contenant la note (souvent "4.6" ou "4,6 sur 5")
    const ratingText =
      $('[data-testid="rating"], [class*="Rating"]').first().text().trim() ||
      $('span:contains("sur 5")').first().text().trim();

    const match = ratingText.match(/([0-9],[0-9]|[0-9]\.[0-9])/);
    const rating = match ? match[1].replace(',', '.') : null;

    // Recherche d’un texte du style "(123 avis)"
    const reviewCountText =
      $('span:contains("avis")').first().text().trim() || '';
    const reviewCountMatch = reviewCountText.match(/\d+/);
    const reviewCount = reviewCountMatch ? parseInt(reviewCountMatch[0]) : null;

    if (!rating) {
      console.warn('Aucune note trouvée, fallback vers démo.');
      return getDemoRating(slug);
    }

    return {
      rating: parseFloat(rating),
      reviews: reviewCount || 0,
      url,
    };
  } catch (error) {
    console.error('❌ Erreur scraping note:', error.message);
    return getDemoRating(slug);
  }
}

/**
 * 🔧 Données de démonstration
 */
function getDemoRestaurants(query) {
  return [
    {
      name: `Restaurant "${query}" - Démo 1`,
      image:
        'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400',
      url: '#',
      rating: '4.6',
      deliveryTime: '25-35 min',
    },
    {
      name: `Restaurant "${query}" - Démo 2`,
      image:
        'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
      url: '#',
      rating: '4.8',
      deliveryTime: '20-30 min',
    },
  ];
}

function getDemoRating(slug) {
  return {
    rating: 4.7,
    reviews: 128,
    url: `https://deliveroo.fr/fr/menu/marseille/${slug}`,
  };
}

export async function getRestaurantReviews(slug) {
  const url = `https://deliveroo.fr/fr/menu/marseille/${slug}`;

  const response = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  const $ = cheerio.load(response.data);

  const reviews = [];

  // Composants React Deliveroo → classes dynamiques
  $('[data-testid="review"], [class*="ReviewCard"]').each((i, el) => {
    const author =
      $(el).find('[class*="User"]').text().trim() || "Client Deliveroo";
    const date = $(el).find("time").attr("datetime") || null;
    const text = $(el).find('[class*="Comment"]').text().trim();
    const rating = $(el).find("svg[aria-label*=star]").length || null;

    reviews.push({ author, date, text, rating });
  });

  return reviews;
}
