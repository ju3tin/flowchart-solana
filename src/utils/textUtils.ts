export function shortenText(text: string, maxLength?: number): string {
    maxLength = maxLength || 30;
    if (text.length <= maxLength) {
      return text;
    }
  
    return text.slice(0, maxLength) + '...';
  }

  export const handleCopy = async (programId: string, setIsCopied: (isCopied: boolean) => void) => {
    try {
      if (programId) {
        await navigator.clipboard.writeText(programId);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1000);
      }
    } catch (error) {
      console.error('Failed to copy Program ID:', error);
    }
};