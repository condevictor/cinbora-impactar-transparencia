declare module 'mime' {
    export function getType(path: string): string | null;
    export function getExtension(type: string): string | null;
    
    const mime: {
      getType: typeof getType;
      getExtension: typeof getExtension;
    };
    
    export default mime;
  }