"use client";

import "./ReviewCard.css";

interface Review {
  author: string;
  text: string;
  rating: string;
  date: string;
}

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  // Génère un avatar avec l'initiale de l'auteur
  const avatarInitial = review.author.charAt(0).toUpperCase();
  
  // Couleurs aléatoires mais cohérentes pour chaque auteur
  const avatarColor = getAvatarColor(review.author);

  return (
    <div className="review-card">
      {/* En-tête de l'avis */}
      <div className="review-header">
        <div className="review-avatar" style={{ backgroundColor: avatarColor }}>
          {avatarInitial}
        </div>
        
        <div className="review-author-info">
          <h4 className="review-author">{review.author}</h4>
          <span className="review-date">{review.date}</span>
        </div>
      </div>

      {/* Note */}
      <div className="review-rating">
        {review.rating}
      </div>

      {/* Texte de l'avis */}
      <p className="review-text">{review.text}</p>
    </div>
  );
}

// Génère une couleur cohérente basée sur le nom
function getAvatarColor(name: string): string {
  const colors = [
    "#FF6B6B", // Rouge
    "#4ECDC4", // Turquoise
    "#45B7D1", // Bleu
    "#FFA07A", // Saumon
    "#98D8C8", // Vert menthe
    "#F7DC6F", // Jaune
    "#BB8FCE", // Violet
    "#85C1E2", // Bleu ciel
  ];
  
  // Hash simple du nom pour choisir une couleur
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}
