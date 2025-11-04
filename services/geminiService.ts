import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

// FIX: Initialize GoogleGenAI with a non-null assertion for the API key, assuming it's always provided as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// FIX: Removed corrupted and unused constants that were causing compilation errors.

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

// FIX: Added explicit GenerateContentResponse type for better type safety.
const getBase64FromResult = (response: GenerateContentResponse): string | null => {
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
        for (const part of parts) {
            if (part.inlineData?.data) {
                return part.inlineData.data;
            }
        }
    }
    return null;
}


export const generateInitialImage = async (base64Image: string, mimeType: string, title: string): Promise<string> => {
    let prompt: string;
    const userImagePart = fileToGenerativePart(base64Image, mimeType);
    const parts: any[] = [userImagePart];

    switch (title) {
        case "Personnel d’accueil":
            prompt = `Analyse de manière critique l'image fournie par l'utilisateur. Ta tâche est de la modifier tout en préservant parfaitement l'identité et les traits du visage de la personne.
1. **Pose et environnement :** Place la personne debout derrière un bureau d'accueil dans un environnement de réception de clinique moderne. La personne doit regarder vers l'objectif avec un sourire chaleureux et professionnel, même si ce n'est pas le cas sur l'image originale.
2. **Arrière-plan :** L'arrière-plan doit être un intérieur de réception de clinique moderne, lumineux, dans des tons clairs, professionnel et légèrement flouté. La décoration doit comporter quelques touches subtiles de rose et de violet, les couleurs de la marque Humanea.
3. **Vêtements :** Change les vêtements de la personne pour une tenue de ville élégante mais sobre, constituée d'une seule couche de vêtement pour le haut du corps (par exemple, un chemisier pour une femme, une chemise pour un homme). Évite les superpositions. La personne ne doit porter aucun vêtement ou équipement médical. Le résultat doit être photoréaliste et de haute qualité.
N'ajoute aucun texte, logo ou cadre. Renvoie uniquement l'image modifiée.`;
            parts.push({ text: prompt });
            break;
            
        case "Personnel administratif":
            prompt = `Analyse de manière critique l'image fournie par l'utilisateur. Ta tâche est de la modifier tout en préservant parfaitement l'identité et les traits du visage de la personne.
1. **Pose et environnement :** Place la personne assise à un bureau dans un environnement de bureau moderne ou de clinique. Un ordinateur portable doit être visible sur le bureau. La personne doit regarder vers l'objectif avec un sourire chaleureux et professionnel, même si ce n'est pas le cas sur l'image originale.
2. **Arrière-plan :** L'arrière-plan doit être un intérieur de bureau lumineux, dans des tons clairs, professionnel et légèrement flouté. La décoration doit comporter quelques touches subtiles de rose et de violet, les couleurs de la marque Humanea.
3. **Vêtements :** Change les vêtements de la personne pour une tenue de ville élégante mais sobre, constituée d'une seule couche de vêtement pour le haut du corps (par exemple, une chemise pour un homme, un chemisier pour une femme). Évite les superpositions comme une chemise sous un pull. La personne ne doit porter aucun vêtement ou équipement médical. Le résultat doit être photoréaliste et de haute qualité.
N'ajoute aucun texte, logo ou cadre. Renvoie uniquement l'image modifiée.`;
            parts.push({ text: prompt });
            break;

        case "Vétérinaire":
            prompt = `Analyse de manière critique l'image fournie par l'utilisateur. Ta tâche est d'effectuer plusieurs modifications spécifiques tout en préservant parfaitement l'identité et les traits du visage de la personne.
1. **Cadrage, Pose et Expression :** Ajuste le cadrage pour que la personne soit visible jusqu'aux hanches. La personne doit se tenir debout, les bras croisés, et regarder la caméra depuis un angle de 3/4. Il est impératif que la personne ait un sourire chaleureux et professionnel, même si ce n'est pas le cas sur l'image originale.
2. **Remplacer l'arrière-plan :** Supprime l'arrière-plan existant et remplace-le par l'intérieur d'une clinique médicale ou d'un hôpital, lumineux, dans des tons clairs (blanc, gris), professionnel et légèrement flouté. L'éclairage doit être net et accueillant. L'arrière-plan ne doit contenir aucun élément écrit (lettre, phrase). Si des éléments de décoration colorés sont présents, ils doivent subtilement intégrer les couleurs rose et violet de la marque Humanea.
3. **Changer les vêtements et ajouter un accessoire :** Identifie le vêtement principal du haut du corps de la personne. Transforme-le en une blouse médicale (scrub) de couleur violet profond et professionnel (proche de #7C1653) avec un col en V. Ajoute un stéthoscope professionnel autour du cou de la personne. Assure-toi que la texture et les plis du vêtement paraissent naturels.
N'ajoute aucun texte, logo ou cadre. Renvoie uniquement l'image modifiée.`;
            parts.push({ text: prompt });
            break;

        case "Auxiliaire spécialisé(e) vétérinaire":
            prompt = `Analyse de manière critique l'image fournie par l'utilisateur. Ta tâche est de la modifier tout en préservant parfaitement l'identité et les traits du visage de la personne.
1. **Cadrage, Pose et Expression :** Ajuste le cadrage pour que la personne soit visible jusqu'aux hanches. La personne doit se tenir debout, tenant dans une main un porte-bloc avec une fiche accrochée dessus. Elle doit avoir un sourire chaleureux et professionnel, même si ce n'est pas le cas sur l'image originale.
2. **Arrière-plan :** Remplace l'arrière-plan existant par l'intérieur d'une clinique médicale ou d'un hôpital, lumineux, dans des tons clairs (blanc, gris), professionnel et légèrement flouté. L'éclairage doit être net et accueillant. L'arrière-plan ne doit contenir aucun élément écrit (lettre, phrase). Si des éléments de décoration colorés sont présents, ils doivent subtilement intégrer les couleurs rose et violet de la marque Humanea.
3. **Vêtements :** Transforme le vêtement du haut du corps en une blouse médicale (scrub) de couleur violet profond et professionnel (proche de #7C1653) avec un col en V. Assure-toi que la texture et les plis du vêtement paraissent naturels.
N'ajoute aucun texte, logo ou cadre. Renvoie uniquement l'image modifiée.`;
            parts.push({ text: prompt });
            break;
        
        default:
             // Fallback to a generic prompt if title doesn't match
            prompt = `Analyse de manière critique l'image fournie par l'utilisateur. Ta tâche est d'effectuer plusieurs modifications spécifiques tout en préservant parfaitement l'identité et les traits du visage de la personne.
1. **Cadrage, Pose et Expression :** Ajuste le cadrage pour que la personne soit visible jusqu'aux hanches. La personne doit se tenir debout, les bras croisés, et regarder la caméra depuis un angle de 3/4. Il est impératif que la personne ait un sourire chaleureux et professionnel, même si ce n'est pas le cas sur l'image originale.
2. **Remplacer l'arrière-plan :** Supprime l'arrière-plan existant et remplace-le par l'intérieur d'une clinique médicale ou d'un hôpital, lumineux, dans des tons clairs, professionnel et légèrement flouté. L'éclairage doit être net et accueillant.
3. **Changer les vêtements :** Identifie le vêtement principal du haut du corps de la personne. Transforme-le en une blouse médicale (scrub) de couleur violet profond et professionnel (proche de #7C1653) avec un col en V. Assure-toi que la texture et les plis du vêtement paraissent naturels après le changement.
N'ajoute aucun texte, logo ou cadre. Renvoie uniquement l'image modifiée.`;
            parts.push({ text: prompt });
    }


  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const newBase64 = getBase64FromResult(response);
    if (newBase64) {
        return newBase64;
    } else {
        throw new Error("Échec de l'extraction de l'image de la réponse de Gemini.");
    }
  } catch (error) {
    console.error("Error in generateInitialImage:", error);
    throw new Error("Le modèle d'IA n'a pas réussi à traiter l'image initiale.");
  }
};