import { useQuery } from "@tanstack/react-query";
import { reviewService } from "@/lib/services/reviewService";

export function usePublic__Location__Reviews(__location__Id: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["public-reviews", __location__Id],
    queryFn: () => reviewService.getPublic__Location__Reviews(__location__Id),
    enabled: !!__location__Id,
  });

  return {
    reviews: data ?? [],
    loading: isLoading,
    err: error instanceof Error ? error.message : null,
    refresh: refetch,
  };
}