/**
 * @param {string} gsUrl
 */
export function gsToHttp(gsUrl) {
    const baseUrl =
      "https://firebasestorage.googleapis.com/v0/b/addyfitness-db121.appspot.com/o/";
    const filePath = gsUrl.replace("gs://addyfitness-db121.appspot.com/", "");
    const encodedFilePath = encodeURIComponent(filePath);
    return `${baseUrl}${encodedFilePath}?alt=media`;
  }
  
  