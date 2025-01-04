import mammoth from 'mammoth';

export function useDocumentPreview() {
  const previewWordDocument = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result;
          const result = await mammoth.convertToHtml({ 
            arrayBuffer,
            options: {
              styleMap: [
                "p[style-name='Title'] => h1:fresh",
                "p[style-name='Heading 1'] => h2:fresh",
                "p[style-name='Heading 2'] => h3:fresh",
                "p[style-name='Heading 3'] => h4:fresh"
              ]
            }
          });
          resolve(result.value);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  return { previewWordDocument };
}

