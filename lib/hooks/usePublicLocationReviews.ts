import { useQuery } from "@tanstack/react-query";
import { reviewService } from "@/lib/services/reviewService";

export function usePublicLocationReviews(locationId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["public-reviews", locationId],
    queryFn: () => reviewService.getPublicLocationReviews(locationId),
    enabled: !!locationId,
  });

  return {
    reviews: data ?? [],
    loading: isLoading,
    err: error instanceof Error ? error.message : null,
    refresh: refetch,
  };
}