import React, { useState, useCallback } from 'react';
import { COLOR_OPTIONS } from './constants';
import { ColorOption } from './types';
import { HumaneaLogo } from './components/Icon';
import { generateInitialImage } from './services/geminiService';

const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [mimeString, base64] = result.split(',');
      const mimeType = mimeString.match(/:(.*?);/)?.[1];
      if (base64 && mimeType) {
        resolve({ base64, mimeType });
      } else {
        reject(new Error("La lecture du fichier a échoué."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};


const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
  <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50 backdrop-blur-sm rounded-lg">
    <div className="w-16 h-16 border-4 border-t-[#C51F84] border-gray-200 rounded-full animate-spin"></div>
    <p className="text-gray-800 mt-4 text-lg font-semibold tracking-wide">{message}</p>
  </div>
);

const ROLES = ["Personnel d’accueil", "Personnel administratif", "Vétérinaire", "Auxiliaire spécialisé(e) vétérinaire"];

const App: React.FC = () => {
  const [title, setTitle] = useState<string>(ROLES[0]);
  const [frameColor, setFrameColor] = useState<string>(COLOR_OPTIONS[0].hex);
  const [originalImage, setOriginalImage] = useState<{ file: File; preview: string } | null>(null);
  const [generatedImage, setGeneratedImage] = useState<{ base64: string; mimeType: string } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGeneratedImage(null);
      setOriginalImage({ file, preview: URL.createObjectURL(file) });
    }
  };

  const handleGenerate = async () => {
    if (!originalImage) {
      setError("Veuillez d'abord télécharger une image.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setLoadingMessage("L'IA prépare votre image...");

    try {
      const { base64, mimeType } = await fileToBase64(originalImage.file);
      setLoadingMessage("Mise à jour de l'arrière-plan et de la tenue...");
      const newBase64 = await generateInitialImage(base64, mimeType, title);
      setGeneratedImage({ base64: newBase64, mimeType });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur inconnue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setOriginalImage(null);
    setGeneratedImage(null);
    setError(null);
    setTitle(ROLES[0]);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = `data:${generatedImage.mimeType};base64,${generatedImage.base64}`;
    link.download = `portrait-humanea-${title.toLowerCase().replace(/\s/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const emailSubject = "Découvrez mon portrait professionnel Humanea !";
  const emailBody = "Bonjour,\n\nJ'ai créé ce portrait professionnel avec le générateur de photo d'équipe Humanea.\n\nVous pouvez l'essayer aussi !";


  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#C51F84]">
            Humanea
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto text-xl">
            Faites partie de l'équipe !
          </p>
        </header>

        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-md mb-6 text-center">
                <strong>Erreur :</strong> {error}
            </div>
        )}

        {!generatedImage ? (
          <main className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Colonne de gauche : Contrôles */}
              <div className="border border-gray-200 p-6 rounded-lg space-y-6">
                  <h2 className="text-2xl font-semibold border-b-2 border-[#7C1653] pb-2 text-gray-800">1. Vos informations</h2>
                  <div>
                      <label htmlFor="title-select" className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                      <select
                          id="title-select"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-[#7C1653] focus:border-transparent transition"
                      >
                          {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                      </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Couleur du thème</label>
                    <div className="flex flex-wrap gap-2">
                        {COLOR_OPTIONS.map((color: ColorOption) => (
                            <button
                                key={color.name}
                                onClick={() => setFrameColor(color.hex)}
                                className={`w-10 h-10 rounded-full transition-transform transform hover:scale-110 ${frameColor === color.hex ? 'ring-2 ring-offset-2 ring-offset-white ring-gray-800' : ''}`}
                                style={{ backgroundColor: color.hex }}
                                aria-label={`Sélectionner la couleur ${color.displayName}`}
                            />
                        ))}
                    </div>
                  </div>

                  <h2 className="text-2xl font-semibold border-b-2 border-[#7C1653] pb-2 pt-4 text-gray-800">2. Télécharger votre photo</h2>
                  <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:border-[#7C1653] transition text-center p-2">
                      <input type="file" accept="image/*" onChange={handleFileChange} className="absolute w-full h-full opacity-0 cursor-pointer" />
                      {originalImage ? (
                          <img src={originalImage.preview} alt="Aperçu" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                          <p className="text-gray-500">Cliquez pour télécharger une image sur laquelle votre visage est bien visible (selfie, portrait)</p>
                      )}
                  </div>
                  
                  <button
                      onClick={handleGenerate}
                      disabled={!originalImage || isLoading}
                      className="w-full bg-[#7C1653] hover:bg-[#C51F84] text-white font-bold py-3 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                  >
                      {isLoading && <div className="w-5 h-5 border-2 border-t-white border-white/50 rounded-full animate-spin mr-2"></div>}
                      {isLoading ? 'Génération...' : 'Générer la photo'}
                  </button>
              </div>

              {/* Colonne de droite : Aperçu */}
              <div className="border border-gray-200 p-2 rounded-lg relative min-h-[400px] flex items-center justify-center">
                {isLoading ? <LoadingOverlay message={loadingMessage} /> : (
                  <div className="text-center text-gray-500">
                    <p>Votre photo générée apparaîtra ici.</p>
                  </div>
                )}
              </div>
          </main>
        ) : (
          <main className="flex flex-col items-center text-center mt-8 animate-fade-in">
              <div className="w-full max-w-sm mx-auto rounded-md overflow-hidden relative" style={{border: `8px solid ${frameColor}`}}>
                  <img
                      src={`data:${generatedImage.mimeType};base64,${generatedImage.base64}`}
                      alt="Portrait généré"
                      className="w-full h-auto aspect-[4/5] object-cover"
                  />
                  <div className="absolute bottom-4 left-0 right-0 p-4 flex flex-col items-center">
                      <div className="bg-white py-2 px-6 rounded-md inline-block shadow-lg text-center">
                          <p className="text-sm sm:text-base font-semibold" style={{ color: frameColor }}>HUMANEA</p>
                      </div>
                  </div>
              </div>

              <div className="mt-8 max-w-lg">
                  <h2 className="text-2xl font-semibold text-gray-800">Vous vous imaginez déjà dans la tenue Humanea ?</h2>
                  <p className="text-lg text-gray-600 mt-2">🚀 Il ne reste plus qu’à franchir le pas !</p>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-4 items-center">
                  <a
                      href="https://veterinairebordeaux.notion.site/1cb508df61f780e6afedc5c03e4a5286"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto bg-[#7C1653] hover:bg-[#C51F84] text-white font-bold py-3 px-8 rounded-md transition text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                      Postulez ici
                  </a>
                  <button
                      onClick={handleRestart}
                      className="w-full sm:w-auto bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-md transition text-lg"
                  >
                      Recommencer
                  </button>
              </div>

               <div className="mt-10 w-full max-w-md">
                  <h3 className="text-lg font-semibold text-gray-700">Téléchargez et partagez</h3>
                  <div className="mt-4 flex justify-center gap-6">
                       <button onClick={handleDownload} title="Télécharger la photo" className="text-gray-500 hover:text-[#7C1653] transition">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                       </button>
                      <a href={`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`} title="Partager par email" className="text-gray-500 hover:text-[#7C1653] transition">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </a>
                       <a href="https://www.linkedin.com/" title="Partager sur LinkedIn" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#7C1653] transition">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                      </a>
                       <a href="https://www.facebook.com/" title="Partager sur Facebook" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#7C1653] transition">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                      </a>
                       <a href="https://www.instagram.com/" title="Partager sur Instagram" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#7C1653] transition">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"/></svg>
                      </a>
                  </div>
              </div>

          </main>
        )}

      </div>
    </div>
  );
};

export default App;
