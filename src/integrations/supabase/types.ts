export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          date: string
          employee_id: string | null
          id: string
          status: string | null
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          date?: string
          employee_id?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          date?: string
          employee_id?: string | null
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          created_at: string
          customer_contact: string | null
          customer_name: string | null
          gst: number | null
          id: string
          invoice_number: string
          items: Json | null
          payment_method: string | null
          shop_id: string | null
          subtotal: number | null
          total: number | null
        }
        Insert: {
          created_at?: string
          customer_contact?: string | null
          customer_name?: string | null
          gst?: number | null
          id?: string
          invoice_number?: string
          items?: Json | null
          payment_method?: string | null
          shop_id?: string | null
          subtotal?: number | null
          total?: number | null
        }
        Update: {
          created_at?: string
          customer_contact?: string | null
          customer_name?: string | null
          gst?: number | null
          id?: string
          invoice_number?: string
          items?: Json | null
          payment_method?: string | null
          shop_id?: string | null
          subtotal?: number | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bills_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          contact: string | null
          created_at: string
          customer_name: string | null
          id: string
          message: string
          rating: number | null
          status: string | null
          subject: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          customer_name?: string | null
          id?: string
          message: string
          rating?: number | null
          status?: string | null
          subject: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          customer_name?: string | null
          id?: string
          message?: string
          rating?: number | null
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          active: boolean | null
          created_at: string
          department: string
          email: string | null
          full_name: string
          hired_at: string | null
          id: string
          phone: string | null
          salary: number | null
          shift: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          department?: string
          email?: string | null
          full_name: string
          hired_at?: string | null
          id?: string
          phone?: string | null
          salary?: number | null
          shift?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          department?: string
          email?: string | null
          full_name?: string
          hired_at?: string | null
          id?: string
          phone?: string | null
          salary?: number | null
          shift?: string | null
        }
        Relationships: []
      }
      food_orders: {
        Row: {
          created_at: string
          id: string
          items: Json | null
          restaurant_id: string | null
          status: string | null
          table_number: number | null
          total: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json | null
          restaurant_id?: string | null
          status?: string | null
          table_number?: number | null
          total?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json | null
          restaurant_id?: string | null
          status?: string | null
          table_number?: number | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "food_orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      parking: {
        Row: {
          entry_time: string
          exit_time: string | null
          fee: number | null
          id: string
          slot_number: string | null
          ticket_code: string | null
          vehicle_number: string
          vehicle_type: string
        }
        Insert: {
          entry_time?: string
          exit_time?: string | null
          fee?: number | null
          id?: string
          slot_number?: string | null
          ticket_code?: string | null
          vehicle_number: string
          vehicle_type?: string
        }
        Update: {
          entry_time?: string
          exit_time?: string | null
          fee?: number | null
          id?: string
          slot_number?: string | null
          ticket_code?: string | null
          vehicle_number?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          expiry_date: string | null
          id: string
          low_stock_threshold: number | null
          price: number | null
          product_name: string
          quantity: number | null
          shop_id: string | null
          supplier_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          low_stock_threshold?: number | null
          price?: number | null
          product_name: string
          quantity?: number | null
          shop_id?: string | null
          supplier_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          low_stock_threshold?: number | null
          price?: number | null
          product_name?: string
          quantity?: number | null
          shop_id?: string | null
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          created_at: string
          cuisine: string | null
          id: string
          name: string
          revenue: number | null
          tables_occupied: number | null
          tables_total: number | null
        }
        Insert: {
          created_at?: string
          cuisine?: string | null
          id?: string
          name: string
          revenue?: number | null
          tables_occupied?: number | null
          tables_total?: number | null
        }
        Update: {
          created_at?: string
          cuisine?: string | null
          id?: string
          name?: string
          revenue?: number | null
          tables_occupied?: number | null
          tables_total?: number | null
        }
        Relationships: []
      }
      shops: {
        Row: {
          category: string | null
          contact: string | null
          created_at: string
          floor_number: number | null
          id: string
          owner_name: string
          rent_amount: number | null
          shop_name: string
          status: string | null
        }
        Insert: {
          category?: string | null
          contact?: string | null
          created_at?: string
          floor_number?: number | null
          id?: string
          owner_name: string
          rent_amount?: number | null
          shop_name: string
          status?: string | null
        }
        Update: {
          category?: string | null
          contact?: string | null
          created_at?: string
          floor_number?: number | null
          id?: string
          owner_name?: string
          rent_amount?: number | null
          shop_name?: string
          status?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          contact: string | null
          created_at: string
          email: string | null
          id: string
          name: string
        }
        Insert: {
          address?: string | null
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
        }
        Update: {
          address?: string | null
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "manager" | "employee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "employee"],
    },
  },
} as const
