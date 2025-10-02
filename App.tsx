import React, { useState, useCallback, useMemo } from 'react';
import { generateContentBundle, generateImage } from './services/geminiService';
import type { GeneratedContent, ContentType, SocialMediaPost } from './types';
import { ICONS } from './constants';

const parseSimpleMarkdown = (text: string) => {
  if (!text) return '';
  return text
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-2 text-white/90">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
};

const Header: React.FC = () => (
  <header className="text-center p-4 md:p-6">
    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
      AI Content Creator Studio
    </h1>
    <p className="mt-2 text-lg text-gray-400 max-w-2xl mx-auto">
      Turn your ideas into polished blog posts or podcast scripts in seconds.
    </p>
  </header>
);

interface ContentFormProps {
  isLoading: boolean;
  onSubmit: (topic: string, contentType: ContentType) => void;
}

const ContentForm: React.FC<ContentFormProps> = ({ isLoading, onSubmit }) => {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState<ContentType>('blog');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onSubmit(topic, contentType);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-4">
      <div className="p-4 bg-gray-900/50 border border-white/10 rounded-xl backdrop-blur-lg">
        <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-2">
          Topic or Key Points
        </label>
        <textarea
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., The future of renewable energy, 5 tips for effective remote work..."
          className="w-full h-32 p-3 bg-gray-800/70 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 resize-none"
          required
        />
      </div>
      <div className="flex items-center justify-between p-2 bg-gray-900/50 border border-white/10 rounded-xl backdrop-blur-lg">
        <div className="flex items-center space-x-4 pl-4">
          <span className="text-sm font-medium text-gray-300">Content Type:</span>
          <div className="flex rounded-lg bg-gray-800/70 p-1 border border-gray-700">
            {(['blog', 'podcast'] as ContentType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setContentType(type)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 ${
                  contentType === type
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="flex items-center justify-center py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-xl hover:shadow-purple-600/40"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Create Content ✨'
          )}
        </button>
      </div>
    </form>
  );
};

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [textToCopy]);
    return (
        <button onClick={handleCopy} className="absolute top-3 right-3 p-1.5 bg-gray-900/50 rounded-md hover:bg-gray-700 transition-colors z-10">
            {copied ? (
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-green-400" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                 </svg>
            ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-gray-300" viewBox="0 0 16 16">
                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                 </svg>
            )}
        </button>
    );
};

const GlassCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`relative bg-gray-900/50 border border-white/10 rounded-xl backdrop-blur-lg p-6 ${className}`}>
        {children}
    </div>
);

interface ResultDisplayProps {
  content: GeneratedContent;
  images: (string | null)[];
  imageLoadingStates: boolean[];
  onGenerateImage: (prompt: string, index: number) => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ content, images, imageLoadingStates, onGenerateImage }) => {
    const memoizedMarkdown = useMemo(() => parseSimpleMarkdown(content.script), [content.script]);

    return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in">
        <section className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{content.title}</h2>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
                <GlassCard>
                    <h3 className="text-2xl font-semibold mb-3 text-white">Content Script</h3>
                    <CopyButton textToCopy={content.script} />
                    <div className="prose prose-invert max-w-none max-h-[60vh] overflow-y-auto text-gray-300 pr-4" dangerouslySetInnerHTML={{ __html: memoizedMarkdown }}></div>
                </GlassCard>
            </div>
            <div className="lg:col-span-1 space-y-8">
                <GlassCard>
                    <h3 className="text-2xl font-semibold mb-4 text-white">Image Suggestions</h3>
                    <div className="space-y-4">
                        {content.imageSuggestions.map((suggestion, index) => (
                            <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
                                <div className="relative h-48 bg-gray-700">
                                    {imageLoadingStates[index] && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                                            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        </div>
                                    )}
                                    {images[index] ? (
                                        <img src={images[index]!} alt={suggestion} className="w-full h-full object-cover"/>
                                    ) : (
                                       <div className="w-full h-full bg-gray-900 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <p className="text-gray-300 text-sm mb-3 h-12 overflow-hidden">{suggestion}</p>
                                    <button onClick={() => onGenerateImage(suggestion, index)} disabled={imageLoadingStates[index]} className="w-full text-sm py-2 px-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
                                        {imageLoadingStates[index] ? 'Generating...' : 'Generate Image'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                <GlassCard>
                     <h3 className="text-2xl font-semibold mb-4 text-white">Social Posts</h3>
                    <div className="space-y-4">
                        {content.socialMediaPosts.map((post, index) => (
                            <div key={index} className="relative p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                                <div className="flex items-center gap-3 mb-2 text-gray-400">
                                    {ICONS[post.platform.toLowerCase()] || ICONS.default}
                                    <span className="font-semibold">{post.platform}</span>
                                </div>
                                <p className="text-gray-300 whitespace-pre-line">{post.post}</p>
                                <CopyButton textToCopy={post.post} />
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    </div>
)};

const SkeletonLoader: React.FC = () => (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-pulse">
        <div className="h-10 bg-gray-700 rounded-md w-2/3 mx-auto"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-gray-800/80 rounded-xl p-6 space-y-4">
                    <div className="h-8 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
            </div>
            <div className="lg:col-span-1 space-y-8">
                <div className="bg-gray-800/80 rounded-xl p-6 space-y-4">
                    <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                    <div className="h-40 bg-gray-700 rounded"></div>
                    <div className="h-40 bg-gray-700 rounded"></div>
                </div>
                <div className="bg-gray-800/80 rounded-xl p-6 space-y-4">
                    <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-700 rounded"></div>
                    <div className="h-20 bg-gray-700 rounded"></div>
                </div>
            </div>
        </div>
    </div>
);

const EmptyState: React.FC = () => (
    <div className="text-center text-gray-500 mt-16 animate-fade-in">
        <div className="max-w-md mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-gray-700 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3c-1.1 0-2 .9-2 2v2h4V5c0-1.1-.9-2-2-2z"/>
                <path d="M18.89 9.11a10 10 0 1 0-13.78 0"/>
                <path d="M22 12c0 4.42-3.58 8-8 8s-8-3.58-8-8"/>
                <path d="M12 12v4m0 0h-2m2 0h2"/>
            </svg>
            <h3 className="text-xl font-semibold text-gray-400">Ready to Create?</h3>
            <p className="mt-2">Enter a topic above, choose your content type, and let the AI bring your ideas to life. Your generated content package will appear here.</p>
        </div>
    </div>
);

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  
  const [images, setImages] = useState<(string | null)[]>([null, null, null]);
  const [imageLoadingStates, setImageLoadingStates] = useState<boolean[]>([false, false, false]);

  const handleFormSubmit = useCallback(async (topic: string, contentType: ContentType) => {
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);
    setImages([null, null, null]);
    try {
      const result = await generateContentBundle(topic, contentType);
      setGeneratedContent(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleGenerateImage = useCallback(async (prompt: string, index: number) => {
    setImageLoadingStates(prev => {
        const newStates = [...prev];
        newStates[index] = true;
        return newStates;
    });
    try {
        const imageUrl = await generateImage(prompt);
        setImages(prev => {
            const newImages = [...prev];
            newImages[index] = imageUrl;
            return newImages;
        });
    } catch (err) {
        // Optionally, set an error state for this specific image
        console.error(`Failed to generate image ${index}:`, err);
    } finally {
        setImageLoadingStates(prev => {
            const newStates = [...prev];
            newStates[index] = false;
            return newStates;
        });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <div 
        className="absolute inset-0 -z-10 h-full w-full bg-cover bg-center"
        style={{backgroundImage: 'url(https://www.transparenttextures.com/patterns/cubes.png), radial-gradient(circle, rgba(23,23,35,1) 0%, rgba(15,15,23,1) 100%)', backgroundBlendMode: 'overlay', opacity: 0.3}}
      ></div>
      <main className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        <Header />
        <div className="mt-8">
          <ContentForm isLoading={isLoading} onSubmit={handleFormSubmit} />
        </div>

        <div className="mt-12">
          {error && (
            <div className="max-w-2xl mx-auto p-4 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-center">
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}

          {isLoading && <SkeletonLoader />}
          {generatedContent && !isLoading && <ResultDisplay content={generatedContent} images={images} imageLoadingStates={imageLoadingStates} onGenerateImage={handleGenerateImage} />}
          {!isLoading && !generatedContent && !error && <EmptyState />}
        </div>
      </main>
       <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
          /* Custom scrollbar for script content */
          .prose::-webkit-scrollbar {
            width: 8px;
          }
          .prose::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }
          .prose::-webkit-scrollbar-thumb {
            background: rgba(139, 92, 246, 0.6); /* Purple-500 with opacity */
            border-radius: 10px;
          }
          .prose::-webkit-scrollbar-thumb:hover {
            background: rgba(139, 92, 246, 0.8);
          }
        `}</style>
    </div>
  );
}

export default App;
