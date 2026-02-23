export type Travelers = {
  adults: number;
  children: number;
};

export type Status = {
  id: number;
  name: string;
};

export interface Booking {
  id: number;
  created_at: Date;
  fname: string;
  lname: string;
  mail: string;
  phone: string;
  address?: string;
  postal_code?: string;
  city?: string;
  birthdate?: Date;
  no_adults: number;
  no_childs?: number;
  status: Status;
  arrival_date: Date;
  departure_date: Date;
  price: number;
  is_cleaning: boolean;
  is_paid: boolean;
}

export interface BookingInput {
  fname: string;
  lname: string;
  mail: string;
  phone: string;
  address?: string;
  postal_code?: string;
  city?: string;
  birthdate?: string;
  no_adults: number;
  no_childs?: number;
  status: number;
  arrival_date: string;
  departure_date: string;
  price: number;
  is_cleaning: boolean;
}
