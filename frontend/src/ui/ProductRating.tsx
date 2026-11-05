import { MdStar, MdStarOutline } from "react-icons/md";

interface Props {
  rating: number;
  reviews: number;
}

const ProductRating = ({ rating, reviews }: Props) => (
  <div
    className="flex flex-wrap items-center gap-2 text-xs"
    role="img"
    aria-label={`Demo rating: ${rating.toFixed(1)} out of 5 stars, ${reviews} sample reviews`}
    title="Sample catalog ratings, not verified customer reviews"
  >
    <span className="inline-flex shrink-0 text-base text-amber-500 dark:text-amber-400" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className="relative block h-4 w-4">
          <MdStarOutline className="block h-4 w-4" />
          <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${Math.min(1, Math.max(0, rating - index)) * 100}%` }}>
            <MdStar className="block h-4 w-4 max-w-none" />
          </span>
        </span>
      ))}
    </span>
    <span className="font-semibold text-ink" aria-hidden="true">{rating.toFixed(1)}</span>
    <span className="text-subtle" aria-hidden="true">({reviews}) · Demo</span>
  </div>
);

export default ProductRating;
