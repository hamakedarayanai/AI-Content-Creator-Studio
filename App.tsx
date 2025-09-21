
import React, { useState, useCallback } from 'react';
import { generateContentBundle } from './services/geminiService';
import type { GeneratedContent, ContentType, SocialMediaPost } from './types';
import { ICONS } from './constants';

// --- Helper Components (Defined outside App to prevent re-creation on re-renders) ---

const Header: React.FC = () => (
  <header className="text-center p-4 md:p-6">
    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
      AI Content Creator Studio
    </h1>
    <p className="mt-2 text-lg text-gray-300 max-w-2xl mx-auto">
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
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-1">
          Topic or Key Points
        </label>
        <textarea
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., The future of renewable energy, 5 tips for effective remote work..."
          className="w-full h-32 p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 resize-none"
          required
        />
      </div>
      <div className="flex items-center justify-center space-x-4">
        <span className="text-sm font-medium text-gray-300">Content Type:</span>
        <div className="flex rounded-lg bg-gray-800/50 p-1 border border-gray-700">
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
        className="w-full flex items-center justify-center py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          'Create Content ✨'
        )}
      </button>
    </form>
  );
};

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 bg-gray-700/50 rounded-md hover:bg-gray-600 transition-colors">
            {copied ? (
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-green-400" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                 </svg>
            ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-gray-300" viewBox="0 0 16 16">
                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                 </svg>
            )}
        </button>
    );
};

interface ResultDisplayProps {
  content: GeneratedContent;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ content }) => (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Title */}
        <section className="text-center">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{content.title}</h2>
        </section>

        {/* Script/Article */}
        <section className="relative p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-gray-200">Content Script</h3>
            <CopyButton textToCopy={content.script} />
            <div className="prose prose-invert max-w-none max-h-96 overflow-y-auto text-gray-300" dangerouslySetInnerHTML={{ __html: content.script.replace(/\n/g, '<br />').replace(/##(.*?)(<br \/>)/g, '<h2 class="text-lg font-bold mt-4 mb-2">$1</h2>') }}></div>
        </section>

        {/* Image Suggestions */}
        <section>
            <h3 className="text-xl font-semibold mb-3 text-gray-200">Image Suggestions</h3>
            <div className="grid md:grid-cols-3 gap-4">
                {content.imageSuggestions.map((suggestion, index) => (
                    <div key={index} className="relative group bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
                        <img src={`https://picsum.photos/seed/${suggestion.slice(0,10)}${index}/400/300`} alt={suggestion} className="w-full h-40 object-cover"/>
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                           <p className="text-white text-center text-sm">{suggestion}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
        
        {/* Social Media */}
        <section>
            <h3 className="text-xl font-semibold mb-3 text-gray-200">Promotional Social Media Posts</h3>
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
        </section>
    </div>
);


// --- Main App Component ---

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  const handleFormSubmit = useCallback(async (topic: string, contentType: ContentType) => {
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);
    try {
      const result = await generateContentBundle(topic, contentType);
      setGeneratedContent(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <div 
        className="absolute inset-0 -z-10 h-full w-full bg-gray-900 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20"
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

          {generatedContent && <ResultDisplay content={generatedContent} />}

          {!isLoading && !generatedContent && !error && (
            <div className="text-center text-gray-500 mt-16 animate-fade-in">
              <p>Your generated content will appear here.</p>
            </div>
          )}
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
        `}</style>
    </div>
  );
}

export default App;
