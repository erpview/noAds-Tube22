export function getDropboxDirectUrl(sharingUrl: string): string {
  try {
    // Convert sharing URL to direct download URL by adding ?dl=1
    return `${sharingUrl}&raw=1`;
  } catch (error) {
    console.error('Invalid Dropbox URL:', error);
    return sharingUrl;
  }
}