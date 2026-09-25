/**
 * Compresses an image file client-side to a lightweight base64 string
 * suitable for LocalStorage caching (typically 30KB - 60KB).
 */
export function compressImageFile(file, maxWidth = 800, maxHeight = 800, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      return reject(new Error('INVALID_TYPE'));
    }

    if (file.size > 8 * 1024 * 1024) {
      return reject(new Error('FILE_TOO_LARGE'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('READ_ERROR'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('IMAGE_LOAD_ERROR'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve({
            dataUrl,
            fileName: file.name,
            fileSizeKb: Math.round((dataUrl.length * 3) / 4 / 1024),
          });
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
