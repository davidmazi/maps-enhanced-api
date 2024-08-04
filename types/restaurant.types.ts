export type Restaurant = {
  name: string;
  photoUrl: string | null;
  rating: number | null;
  totalRatings: number | null;
  address: string | null;
  type: string;
  latitude: number;
  longitude: number;
  openNow: boolean | null;
};
