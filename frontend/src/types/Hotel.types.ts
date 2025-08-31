export interface Hotel {
  _id: string;
  title: string;
  description?: string; // Указываем, что description может быть undefined
  images: string[];
}