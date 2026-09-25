export interface CarDocument {
  id: string;
  carId: string;
  originalName: string;
  mimeType: string;
  size: number;
  documentType: string;
  title: string;
  description: string;
  uploadedAt: string;
  persisted: boolean;
  downloadUrl: string;
  message: string;
}
export interface UploadCarDocumentDto {
  documentType: string;
  title: string;
  description?: string;
}
