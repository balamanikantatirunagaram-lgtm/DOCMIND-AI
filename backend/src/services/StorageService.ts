import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class StorageService {
  private supabase: SupabaseClient;
  private bucketName = 'docmind-documents';

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || '';
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  public async uploadFile(file: Express.Multer.File, path: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload file to Supabase: ${error.message}`);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  }

  public async deleteFile(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete file from Supabase: ${error.message}`);
    }
  }
}
