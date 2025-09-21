
export interface SocialMediaPost {
  platform: string;
  post: string;
}

export interface GeneratedContent {
  title: string;
  script: string;
  imageSuggestions: string[];
  socialMediaPosts: SocialMediaPost[];
}

export type ContentType = 'blog' | 'podcast';
