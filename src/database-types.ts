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
      car_services: {
        Row: {
          id: string
          name: string
          phone: string
          car_brand: string
          car_number: string
          mileage: number
          next_service_date: string
          service_date: string
          work_types: string[]
          additional_work: string | null
          created_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          phone: string
          car_brand: string
          car_number: string
          mileage: number
          next_service_date: string
          service_date: string
          work_types: string[]
          additional_work?: string | null
          created_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          car_brand?: string
          car_number?: string
          mileage?: number
          next_service_date?: string
          service_date?: string
          work_types?: string[]
          additional_work?: string | null
          created_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_services_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
