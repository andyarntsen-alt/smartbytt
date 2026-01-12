export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          postal_code: string | null;
          subscription_tier: "free" | "pro";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          postal_code?: string | null;
          subscription_tier?: "free" | "pro";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          postal_code?: string | null;
          subscription_tier?: "free" | "pro";
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      providers: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          website_url: string | null;
          is_partner: boolean;
          affiliate_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          website_url?: string | null;
          is_partner?: boolean;
          affiliate_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          website_url?: string | null;
          is_partner?: boolean;
          affiliate_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      offers: {
        Row: {
          id: string;
          provider_id: string;
          name: string;
          price_type: "spot" | "fixed" | "variable";
          monthly_fee: number;
          price_per_unit: number | null;
          markup_ore_kwh: number | null;
          data_amount_gb: number | null;
          speed_mbps: number | null;
          binding_months: number;
          is_active: boolean;
          valid_from: string;
          valid_until: string | null;
          price_area: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          name: string;
          price_type: "spot" | "fixed" | "variable";
          monthly_fee: number;
          price_per_unit?: number | null;
          markup_ore_kwh?: number | null;
          data_amount_gb?: number | null;
          speed_mbps?: number | null;
          binding_months?: number;
          is_active?: boolean;
          valid_from?: string;
          valid_until?: string | null;
          price_area?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          name?: string;
          price_type?: "spot" | "fixed" | "variable";
          monthly_fee?: number;
          price_per_unit?: number | null;
          markup_ore_kwh?: number | null;
          data_amount_gb?: number | null;
          speed_mbps?: number | null;
          binding_months?: number;
          is_active?: boolean;
          valid_from?: string;
          valid_until?: string | null;
          price_area?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_contracts: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          provider_id: string | null;
          provider_name: string | null;
          price_type: "spot" | "fixed" | "variable" | null;
          monthly_cost: number | null;
          yearly_consumption_kwh: number | null;
          data_amount_gb: number | null;
          speed_mbps: number | null;
          postal_code: string | null;
          price_area: string | null;
          binding_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          provider_id?: string | null;
          provider_name?: string | null;
          price_type?: "spot" | "fixed" | "variable" | null;
          monthly_cost?: number | null;
          yearly_consumption_kwh?: number | null;
          data_amount_gb?: number | null;
          speed_mbps?: number | null;
          postal_code?: string | null;
          price_area?: string | null;
          binding_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          provider_id?: string | null;
          provider_name?: string | null;
          price_type?: "spot" | "fixed" | "variable" | null;
          monthly_cost?: number | null;
          yearly_consumption_kwh?: number | null;
          data_amount_gb?: number | null;
          speed_mbps?: number | null;
          postal_code?: string | null;
          price_area?: string | null;
          binding_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          user_contract_id: string | null;
          file_path: string;
          file_type: string;
          original_filename: string;
          extracted_data: Json | null;
          ocr_status: "pending" | "processing" | "completed" | "failed";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_contract_id?: string | null;
          file_path: string;
          file_type: string;
          original_filename: string;
          extracted_data?: Json | null;
          ocr_status?: "pending" | "processing" | "completed" | "failed";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_contract_id?: string | null;
          file_path?: string;
          file_type?: string;
          original_filename?: string;
          extracted_data?: Json | null;
          ocr_status?: "pending" | "processing" | "completed" | "failed";
          created_at?: string;
        };
      };
      recommendations: {
        Row: {
          id: string;
          user_id: string;
          user_contract_id: string;
          offer_id: string;
          current_monthly_cost: number;
          recommended_monthly_cost: number;
          monthly_savings: number;
          yearly_savings: number;
          urgency: "low" | "medium" | "high";
          reasons: string[];
          is_dismissed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_contract_id: string;
          offer_id: string;
          current_monthly_cost: number;
          recommended_monthly_cost: number;
          monthly_savings: number;
          yearly_savings: number;
          urgency?: "low" | "medium" | "high";
          reasons?: string[];
          is_dismissed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_contract_id?: string;
          offer_id?: string;
          current_monthly_cost?: number;
          recommended_monthly_cost?: number;
          monthly_savings?: number;
          yearly_savings?: number;
          urgency?: "low" | "medium" | "high";
          reasons?: string[];
          is_dismissed?: boolean;
          created_at?: string;
        };
      };
      switches: {
        Row: {
          id: string;
          user_id: string;
          recommendation_id: string;
          from_provider_id: string | null;
          to_provider_id: string;
          to_offer_id: string;
          status: "initiated" | "pending" | "completed" | "cancelled" | "failed";
          affiliate_click_id: string | null;
          estimated_savings: number;
          confirmed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recommendation_id: string;
          from_provider_id?: string | null;
          to_provider_id: string;
          to_offer_id: string;
          status?: "initiated" | "pending" | "completed" | "cancelled" | "failed";
          affiliate_click_id?: string | null;
          estimated_savings: number;
          confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recommendation_id?: string;
          from_provider_id?: string | null;
          to_provider_id?: string;
          to_offer_id?: string;
          status?: "initiated" | "pending" | "completed" | "cancelled" | "failed";
          affiliate_click_id?: string | null;
          estimated_savings?: number;
          confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "savings_alert" | "switch_completed" | "price_change" | "system";
          title: string;
          message: string;
          data: Json | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "savings_alert" | "switch_completed" | "price_change" | "system";
          title: string;
          message: string;
          data?: Json | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "savings_alert" | "switch_completed" | "price_change" | "system";
          title?: string;
          message?: string;
          data?: Json | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      waitlist: {
        Row: {
          id: string;
          email: string;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          source?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          source?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

// Helper types for easier use
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Provider = Database["public"]["Tables"]["providers"]["Row"];
export type Offer = Database["public"]["Tables"]["offers"]["Row"];
export type UserContract = Database["public"]["Tables"]["user_contracts"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type Recommendation = Database["public"]["Tables"]["recommendations"]["Row"];
export type Switch = Database["public"]["Tables"]["switches"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type WaitlistEntry = Database["public"]["Tables"]["waitlist"]["Row"];
