const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const getImageUrl = (imagePath?: string | null, updatedAt?: string): string | undefined => {
    if (!imagePath) return undefined;

    const timestamp = updatedAt ? `?t=${updatedAt}` : '';
    
    if (imagePath.startsWith('http')) {
      return `${imagePath}${timestamp}`;
    }
    
    return `${baseUrl}/${imagePath}${timestamp}`;
  };
