import axios, { AxiosError, isAxiosError } from "axios";
import type { Restaurant } from "../types/restaurant.types";

import {
  Client,
  PlacesNearbyRequest,
  PlacesNearbyResponse,
  PlaceType1,
} from "@googlemaps/google-maps-services-js";

export class RestaurantService {
  private googleMapsClient: Client;
  private googleApiKey = Bun.env.GMAPS_API_KEY;
  private gmapsPageToken?: string;

  constructor() {
    this.googleMapsClient = new Client({});
  }

  private async placesNearbyWithRetry(
    { params }: PlacesNearbyRequest,
    retryCount = 0
  ): Promise<PlacesNearbyResponse> {
    try {
      const response = await this.googleMapsClient.placesNearby({ params });
      return response;
    } catch (error) {
      if (
        isAxiosError(error) &&
        error.response?.status === 400 &&
        retryCount < 1
      ) {
        console.log(
          `Retrying placesNearby call after 400 error. Attempt: ${
            retryCount + 1
          }`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
        return this.placesNearbyWithRetry({ params }, retryCount + 1);
      }
      throw error;
    }
  }

  async getHighlyRatedRestaurants(
    lat: number,
    lng: number,
    radius: number = 500
  ): Promise<Restaurant[]> {
    try {
      const response = await this.placesNearbyWithRetry({
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

        const restaurants = await Promise.all(
          response.data.results.map(async (place) => {
            const photoUrl = await getPhotoUrl(
              place.photos?.[0]?.photo_reference
            );

            return {
              name: place.name || "Unknown Restaurant",
              photoUrl: photoUrl,
              rating: place.rating || null,
              address: place.vicinity || "Unknown Address",
              type: place.types?.[0] || "Various",
              latitude: place.geometry?.location?.lat || 0,
              longitude: place.geometry?.location?.lng || 0,
            };
          })
        );

        return restaurants;
      } else {
        throw new Error(`Failed to fetch restaurants: ${response.data.status}`);
      }
    } catch (error) {
      if (isAxiosError(error))
        console.error(
          "Error fetching highly rated restaurants:",
          (error as AxiosError).response?.data
        );

      return [];
    }

    async function getPhotoUrl(
      photoReference: string | undefined
    ): Promise<string | null> {
      if (!photoReference) return null;

      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/photo`,
          {
            params: {
              photoreference: photoReference,
              maxheight: 500,
              maxwidth: 500,
              key: Bun.env.GMAPS_API_KEY,
            },
            maxRedirects: 0,
            validateStatus: (status) => status === 302,
          }
        );

        return response.headers.location || null;
      } catch (error) {
        console.error("Error fetching photo URL:", error);
        return null;
      }
    }
  }
}
