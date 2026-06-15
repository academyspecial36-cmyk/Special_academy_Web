export interface MediaFolder {
  id: string;
  name: string;
  parent_id: string | null;
  created_by: string;
  created_at: string;
}

export interface MediaFile {
  id: string;
  name: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  url: string;
  thumbnail_url: string | null;
  folder_id: string | null;
  alt_text: string | null;
  width: number | null;
  height: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}
