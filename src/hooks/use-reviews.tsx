import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface Review {
  id: string;
  user_id: string;
  property_id: string;
  booking_id: string | null;
  rating: number;
  content: string;
  photo_urls: string[];
  verified: boolean;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_avatar: string | null;
  response?: {
    id: string;
    content: string;
    host_name: string;
    created_at: string;
  } | null;
}

export function useReviews(propertyId: string) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    const { data: rawReviews } = await supabase
      .from("reviews")
      .select("*")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false });

    if (!rawReviews) { setLoading(false); return; }

    const enriched: Review[] = await Promise.all(
      rawReviews.map(async (r: any) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", r.user_id)
          .single();

        const { data: resp } = await supabase
          .from("review_responses")
          .select("*")
          .eq("review_id", r.id)
          .limit(1)
          .maybeSingle();

        let hostName = "Host";
        if (resp) {
          const { data: hostProfile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", resp.host_id)
            .single();
          hostName = hostProfile?.display_name || "Host";
        }

        return {
          ...r,
          user_name: profile?.display_name || "Guest",
          user_avatar: profile?.avatar_url,
          response: resp ? {
            id: resp.id,
            content: resp.content,
            host_name: hostName,
            created_at: resp.created_at,
          } : null,
        };
      })
    );

    setReviews(enriched);
    setLoading(false);
  }, [propertyId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const submitReview = useCallback(async (
    rating: number,
    content: string,
    photos: File[],
    bookingId?: string,
  ) => {
    if (!user) return;
    setSubmitting(true);

    // Upload photos
    const photoUrls: string[] = [];
    for (const file of photos) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("review-images").upload(path, file, { contentType: file.type });
      if (!error) {
        const { data } = supabase.storage.from("review-images").getPublicUrl(path);
        photoUrls.push(data.publicUrl);
      }
    }

    // Check if this is from a real booking
    let verified = false;
    if (bookingId) {
      const { data: booking } = await supabase
        .from("bookings")
        .select("id")
        .eq("id", bookingId)
        .eq("user_id", user.id)
        .single();
      verified = !!booking;
    }

    await supabase.from("reviews").insert({
      user_id: user.id,
      property_id: propertyId,
      booking_id: bookingId || null,
      rating,
      content,
      photo_urls: photoUrls,
      verified,
    });

    setSubmitting(false);
    fetchReviews();
  }, [user, propertyId, fetchReviews]);

  const stats = {
    average: reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0,
    count: reviews.length,
    breakdown: [0, 0, 0, 0, 0].map((_, i) => reviews.filter(r => r.rating === i + 1).length),
  };

  return { reviews, loading, submitting, submitReview, stats, refetch: fetchReviews };
}
