// src/components/ui/Stars.jsx
export default function Stars({ rating, max = 5 }) {
  return (
    <div className="stars" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`star ${i < rating ? '' : 'empty'}`}>★</span>
      ))}
    </div>
  );
}
