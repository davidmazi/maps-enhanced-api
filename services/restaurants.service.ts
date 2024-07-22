import fetchToCurl from "fetch-to-curl";
import type { Restaurant } from "../types/restaurant.types";

import {
  Client,
  PlacesNearbyRanking,
  PlaceType1,
} from "@googlemaps/google-maps-services-js";

const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";

export class RestaurantService {
  private googleMapsClient: Client;
  private googleApiKey = Bun.env.GMAPS_API_KEY;
  private gmapsPageToken?: string;

  constructor() {
    this.googleMapsClient = new Client({});
  }

  async getHighlyRatedRestaurants(
    lat: number,
    lng: number,
    radius: number = 500
  ): Promise<Restaurant[]> {
    try {
      const response = await this.googleMapsClient.placesNearby({
        params: {
          location: { lat, lng },
          radius,
          type: PlaceType1.restaurant,
          maxprice: 2,
          key: this.googleApiKey,
          pagetoken: this.gmapsPageToken,
        },
      });

      if (response.data.status === "OK" && response.data.results) {
        this.gmapsPageToken = response.data.next_page_token;
        return response.data.results.map((place) => ({
          name: place.name || "Unknown Restaurant",
          gmapsPhotoRef: place.photos?.[0].photo_reference,
          rating: place.rating || null,
          address: place.vicinity || "Unknown Address",
          type: place.types?.[0] || "Various",
          latitude: place.geometry?.location?.lat || 0,
          longitude: place.geometry?.location?.lng || 0,
        }));
      } else {
        throw new Error(`Failed to fetch restaurants: ${response.data.status}`);
      }
    } catch (error) {
      console.error("Error fetching highly rated restaurants:", error);
      return [];
    }
  }
}
