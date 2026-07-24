export const verificationService = {
  async verifyDocuments(documents: File[]): Promise<{ profileVerified: boolean; documents: string[] }> {
    // Simulate network latency
    await new Promise((res) => setTimeout(res, 800));
    // Return mock IDs for uploaded docs
    const docIds = documents.map((_, i) => `doc_${Date.now()}_${i}`);
    return { profileVerified: true, documents: docIds };
  },
};
