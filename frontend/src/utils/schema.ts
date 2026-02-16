// Schema.org structured data generators

export const generateRadioStationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'RadioStation',
  name: 'Resistance Radio',
  description: 'A justice-oriented radio station amplifying truth, courage, and community across Zimbabwe and the diaspora',
  url: 'https://resistanceradio.org',
  logo: 'https://resistanceradio.org/logo.jpeg',
  sameAs: [
    'https://twitter.com/ResistanceRadio',
    'https://facebook.com/ResistanceRadio'
  ]
});

export const generateShowSchema = (show: {
  title: string;
  description: string;
  slug: string;
  image_url?: string;
  host?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'RadioSeries',
  name: show.title,
  description: show.description,
  url: `https://resistanceradio.org/shows/${show.slug}`,
  image: show.image_url || 'https://resistanceradio.org/logo.jpeg',
  ...(show.host && { author: { '@type': 'Person', name: show.host } })
});

export const generateEpisodeSchema = (episode: {
  title: string;
  description: string;
  slug: string;
  audio_url?: string;
  published_at: string;
  duration?: number;
  show?: { title: string; slug: string };
}) => ({
  '@context': 'https://schema.org',
  '@type': 'RadioEpisode',
  name: episode.title,
  description: episode.description,
  url: `https://resistanceradio.org/episodes/${episode.slug}`,
  datePublished: episode.published_at,
  ...(episode.audio_url && {
    associatedMedia: {
      '@type': 'AudioObject',
      contentUrl: episode.audio_url,
      ...(episode.duration && { duration: `PT${episode.duration}S` })
    }
  }),
  ...(episode.show && {
    partOfSeries: {
      '@type': 'RadioSeries',
      name: episode.show.title,
      url: `https://resistanceradio.org/shows/${episode.show.slug}`
    }
  })
});

export const generateArticleSchema = (article: {
  title: string;
  content: string;
  slug: string;
  author?: string;
  published_at: string;
  updated_at?: string;
  image_url?: string;
  category?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.title,
  articleBody: article.content,
  url: `https://resistanceradio.org/news/${article.slug}`,
  datePublished: article.published_at,
  ...(article.updated_at && { dateModified: article.updated_at }),
  ...(article.author && {
    author: {
      '@type': 'Person',
      name: article.author
    }
  }),
  publisher: {
    '@type': 'Organization',
    name: 'Resistance Radio',
    logo: {
      '@type': 'ImageObject',
      url: 'https://resistanceradio.org/logo.jpeg'
    }
  },
  ...(article.image_url && {
    image: article.image_url
  }),
  ...(article.category && {
    articleSection: article.category
  })
});

export const generateEventSchema = (event: {
  title: string;
  description: string;
  slug: string;
  event_date: string;
  end_date?: string;
  location?: string;
  event_type?: string;
  image_url?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: event.title,
  description: event.description,
  url: `https://resistanceradio.org/events/${event.slug}`,
  startDate: event.event_date,
  ...(event.end_date && { endDate: event.end_date }),
  ...(event.location && {
    location: {
      '@type': 'Place',
      name: event.location
    }
  }),
  ...(event.image_url && { image: event.image_url }),
  organizer: {
    '@type': 'Organization',
    name: 'Resistance Radio',
    url: 'https://resistanceradio.org'
  }
});

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `https://resistanceradio.org${item.url}`
  }))
});
