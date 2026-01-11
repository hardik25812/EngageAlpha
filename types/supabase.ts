export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          email_verified: string | null
          name: string | null
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          email_verified?: string | null
          name?: string | null
          image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          email_verified?: string | null
          name?: string | null
          image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          max_alerts_per_day: number
          min_predicted_impressions: number
          time_window_start: number
          time_window_end: number
          preferred_reply_styles: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          max_alerts_per_day?: number
          min_predicted_impressions?: number
          time_window_start?: number
          time_window_end?: number
          preferred_reply_styles?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          max_alerts_per_day?: number
          min_predicted_impressions?: number
          time_window_start?: number
          time_window_end?: number
          preferred_reply_styles?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      targets: {
        Row: {
          id: string
          user_id: string
          type: 'ACCOUNT' | 'KEYWORD' | 'LIST'
          value: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'ACCOUNT' | 'KEYWORD' | 'LIST'
          value: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'ACCOUNT' | 'KEYWORD' | 'LIST'
          value?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      candidate_tweets: {
        Row: {
          id: string
          tweet_id: string
          author_id: string
          author_username: string
          author_name: string
          author_followers: number
          author_image: string | null
          content: string
          created_at: string
          fetched_at: string
          is_thread: boolean
          thread_position: number | null
        }
        Insert: {
          id?: string
          tweet_id: string
          author_id: string
          author_username: string
          author_name: string
          author_followers: number
          author_image?: string | null
          content: string
          created_at: string
          fetched_at?: string
          is_thread?: boolean
          thread_position?: number | null
        }
        Update: {
          id?: string
          tweet_id?: string
          author_id?: string
          author_username?: string
          author_name?: string
          author_followers?: number
          author_image?: string | null
          content?: string
          created_at?: string
          fetched_at?: string
          is_thread?: boolean
          thread_position?: number | null
        }
      }
      scores: {
        Row: {
          id: string
          candidate_tweet_id: string
          velocity_score: number
          velocity_raw: Json
          saturation_score: number
          saturation_raw: Json
          author_fatigue_score: number
          author_fatigue_raw: Json
          audience_overlap_score: number
          audience_overlap_raw: Json
          reply_fit_score: number
          reply_fit_raw: Json
          final_score: number
          computed_at: string
        }
        Insert: {
          id?: string
          candidate_tweet_id: string
          velocity_score: number
          velocity_raw: Json
          saturation_score: number
          saturation_raw: Json
          author_fatigue_score: number
          author_fatigue_raw: Json
          audience_overlap_score: number
          audience_overlap_raw: Json
          reply_fit_score: number
          reply_fit_raw: Json
          final_score: number
          computed_at?: string
        }
        Update: {
          id?: string
          candidate_tweet_id?: string
          velocity_score?: number
          velocity_raw?: Json
          saturation_score?: number
          saturation_raw?: Json
          author_fatigue_score?: number
          author_fatigue_raw?: Json
          audience_overlap_score?: number
          audience_overlap_raw?: Json
          reply_fit_score?: number
          reply_fit_raw?: Json
          final_score?: number
          computed_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          candidate_tweet_id: string
          score: number
          reason: string
          dismissed: boolean
          viewed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          candidate_tweet_id: string
          score: number
          reason: string
          dismissed?: boolean
          viewed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          candidate_tweet_id?: string
          score?: number
          reason?: string
          dismissed?: boolean
          viewed?: boolean
          created_at?: string
        }
      }
      replies: {
        Row: {
          id: string
          user_id: string
          alert_id: string
          tweet_id: string
          reply_tweet_id: string | null
          content: string
          strategy: string
          posted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          alert_id: string
          tweet_id: string
          reply_tweet_id?: string | null
          content: string
          strategy: string
          posted_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          alert_id?: string
          tweet_id?: string
          reply_tweet_id?: string | null
          content?: string
          strategy?: string
          posted_at?: string
        }
      }
      predictions: {
        Row: {
          id: string
          reply_id: string
          expected_impressions_min: number
          expected_impressions_max: number
          prob_author_engagement: number
          prob_profile_clicks: number
          prob_follows: number
          explanation: string
          created_at: string
        }
        Insert: {
          id?: string
          reply_id: string
          expected_impressions_min: number
          expected_impressions_max: number
          prob_author_engagement: number
          prob_profile_clicks: number
          prob_follows: number
          explanation: string
          created_at?: string
        }
        Update: {
          id?: string
          reply_id?: string
          expected_impressions_min?: number
          expected_impressions_max?: number
          prob_author_engagement?: number
          prob_profile_clicks?: number
          prob_follows?: number
          explanation?: string
          created_at?: string
        }
      }
      outcomes: {
        Row: {
          id: string
          reply_id: string
          actual_impressions: number
          author_engaged: boolean
          profile_clicks: number
          follows: number
          label: 'RIGHT' | 'SATURATED' | 'BAD_FIT'
          feedback: string | null
          measured_at: string
        }
        Insert: {
          id?: string
          reply_id: string
          actual_impressions: number
          author_engaged: boolean
          profile_clicks: number
          follows: number
          label: 'RIGHT' | 'SATURATED' | 'BAD_FIT'
          feedback?: string | null
          measured_at?: string
        }
        Update: {
          id?: string
          reply_id?: string
          actual_impressions?: number
          author_engaged?: boolean
          profile_clicks?: number
          follows?: number
          label?: 'RIGHT' | 'SATURATED' | 'BAD_FIT'
          feedback?: string | null
          measured_at?: string
        }
      }
      learning_signals: {
        Row: {
          id: string
          user_id: string
          signal_type: string
          signal_data: Json
          confidence: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          signal_type: string
          signal_data: Json
          confidence: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          signal_type?: string
          signal_data?: Json
          confidence?: number
          created_at?: string
        }
      }
      attention_decay: {
        Row: {
          id: string
          candidate_tweet_id: string
          half_life: number
          active_lifespan: number
          revive_probability: number
          decay_velocity: number
          current_phase: 'GROWTH' | 'PEAK' | 'DECAY' | 'FLATLINE'
          revive_window_start: string | null
          revive_window_end: string | null
          engagement_history: Json
          computed_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          candidate_tweet_id: string
          half_life: number
          active_lifespan: number
          revive_probability: number
          decay_velocity: number
          current_phase?: 'GROWTH' | 'PEAK' | 'DECAY' | 'FLATLINE'
          revive_window_start?: string | null
          revive_window_end?: string | null
          engagement_history: Json
          computed_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          candidate_tweet_id?: string
          half_life?: number
          active_lifespan?: number
          revive_probability?: number
          decay_velocity?: number
          current_phase?: 'GROWTH' | 'PEAK' | 'DECAY' | 'FLATLINE'
          revive_window_start?: string | null
          revive_window_end?: string | null
          engagement_history?: Json
          computed_at?: string
          updated_at?: string
        }
      }
      smart_alerts: {
        Row: {
          id: string
          user_id: string
          candidate_tweet_id: string | null
          type: 'REPLY_NOW' | 'REVIVE_SIGNAL' | 'WINDOW_CLOSING' | 'AUTHOR_ACTIVE' | 'VELOCITY_SPIKE'
          urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM'
          title: string
          message: string
          optimal_window: number | null
          closing_window: number | null
          dismissed: boolean
          acted_on: boolean
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          candidate_tweet_id?: string | null
          type: 'REPLY_NOW' | 'REVIVE_SIGNAL' | 'WINDOW_CLOSING' | 'AUTHOR_ACTIVE' | 'VELOCITY_SPIKE'
          urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM'
          title: string
          message: string
          optimal_window?: number | null
          closing_window?: number | null
          dismissed?: boolean
          acted_on?: boolean
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          candidate_tweet_id?: string | null
          type?: 'REPLY_NOW' | 'REVIVE_SIGNAL' | 'WINDOW_CLOSING' | 'AUTHOR_ACTIVE' | 'VELOCITY_SPIKE'
          urgency?: 'CRITICAL' | 'HIGH' | 'MEDIUM'
          title?: string
          message?: string
          optimal_window?: number | null
          closing_window?: number | null
          dismissed?: boolean
          acted_on?: boolean
          created_at?: string
          expires_at?: string | null
        }
      }
      engagement_snapshots: {
        Row: {
          id: string
          candidate_tweet_id: string
          likes: number
          retweets: number
          replies: number
          quotes: number
          impressions: number | null
          captured_at: string
        }
        Insert: {
          id?: string
          candidate_tweet_id: string
          likes: number
          retweets: number
          replies: number
          quotes?: number
          impressions?: number | null
          captured_at?: string
        }
        Update: {
          id?: string
          candidate_tweet_id?: string
          likes?: number
          retweets?: number
          replies?: number
          quotes?: number
          impressions?: number | null
          captured_at?: string
        }
      }
      user_learning: {
        Row: {
          id: string
          user_id: string
          best_authors: Json
          best_topics: Json
          best_reply_styles: Json
          best_posting_hours: Json
          avg_half_life: number | null
          avg_revival_success: number | null
          total_replies: number
          successful_replies: number
          avg_impressions_gained: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          best_authors?: Json
          best_topics?: Json
          best_reply_styles?: Json
          best_posting_hours?: Json
          avg_half_life?: number | null
          avg_revival_success?: number | null
          total_replies?: number
          successful_replies?: number
          avg_impressions_gained?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          best_authors?: Json
          best_topics?: Json
          best_reply_styles?: Json
          best_posting_hours?: Json
          avg_half_life?: number | null
          avg_revival_success?: number | null
          total_replies?: number
          successful_replies?: number
          avg_impressions_gained?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      target_type: 'ACCOUNT' | 'KEYWORD' | 'LIST'
      decay_phase: 'GROWTH' | 'PEAK' | 'DECAY' | 'FLATLINE'
      alert_type: 'REPLY_NOW' | 'REVIVE_SIGNAL' | 'WINDOW_CLOSING' | 'AUTHOR_ACTIVE' | 'VELOCITY_SPIKE'
      alert_urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM'
      outcome_label: 'RIGHT' | 'SATURATED' | 'BAD_FIT'
    }
  }
}
