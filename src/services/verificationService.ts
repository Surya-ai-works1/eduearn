// src/services/verificationService.ts

export const verificationService = {
  async verifyDocuments(documents: File[]): Promise<{ profileVerified: boolean; documents: string[] }> {
    const docIds = documents.map((_, i) => `doc_${Date.now()}_${i}`);
    return { profileVerified: true, documents: docIds };
  },

  async validateId(idNumber: string, idType: string = "Government ID"): Promise<{ success: boolean; message: string; idNumber?: string }> {
    const res = await fetch("/api/tutor/validate-id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idNumber, idType }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "ID validation failed.");
    }
    return data;
  },
};
