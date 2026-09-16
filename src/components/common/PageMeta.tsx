import { useMemo } from "react";
import type { FC } from "react";
import { Helmet } from "react-helmet-async";

const SITE_NAME = "صوت طموح";
/** `og:site_name` stays the parent brand so it agrees with index.html. */
const OG_SITE_NAME = "طموح";
const SITE_URL = "https://feedback.tomoh.io";
const DEFAULT_TITLE = "مركز صوت طموح";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_DESCRIPTION =
  "مركز صوت طموح لاستقبال ملاحظات مجتمع طموح التعليمي: أبلغ عن مشكلة، اقترح تحسيناً، رشّح دورة، وتابع طلبك برقم مرجعي فوري.";
const TWITTER_HANDLE = "@tomoh_center";

export interface PageMetaProps {
  /**
   * Document title. The component appends "| صوت طموح" only when the title does
   * not already carry the brand, so passing either "الإبلاغ عن مشكلة" or
   * "الإبلاغ عن مشكلة | مركز صوت طموح" yields a single, correct suffix.
   */
  title: string;
  description?: string;
  /** Path-only canonical (e.g. `/bug-report`) or full URL. Auto-derived from `window.location.pathname` when omitted. */
  url?: string;
  /** Absolute or root-relative image URL. Defaults to the 1200x630 share card. */
  image?: string;
  /** OG content type. Defaults to `website`. */
  type?: "website" | "article" | "profile" | "video.other";
  /** When true, emits `<meta name="robots" content="noindex,nofollow">`. */
  noIndex?: boolean;
  /**
   * Accepted for parity with the platform's PageMeta, but intentionally NOT
   * rendered — `<meta name="keywords">` is ignored by every major engine.
   */
  keywords?: string[];
  /** OG locale override. Defaults to `ar_AR` (this app is Arabic-only). */
  locale?: string;
  /** Article-only metadata. Ignored when `type !== 'article'`. */
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  /** A JSON-LD object (or array of objects) to embed for structured data. */
  jsonLd?: object | object[];
}

const absoluteUrl = (input?: string): string => {
  if (!input) {
    // Deliberately excludes `window.location.search` — query strings are
    // tracking noise here and would split one page across many canonicals.
    if (typeof window !== "undefined") {
      return SITE_URL + window.location.pathname;
    }
    return `${SITE_URL}/`;
  }
  if (/^https?:\/\//i.test(input)) return input;
  return SITE_URL + (input.startsWith("/") ? input : `/${input}`);
};

const PageMeta: FC<PageMetaProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  url,
  image,
  type = "website",
  noIndex = false,
  locale,
  publishedTime,
  modifiedTime,
  author,
  jsonLd,
}) => {
  const effectiveLocale = locale ?? "ar_AR";
  const fullTitle = useMemo(() => {
    if (!title) return DEFAULT_TITLE;
    return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  }, [title]);
  const canonical = useMemo(() => absoluteUrl(url), [url]);
  const ogImage = useMemo(() => absoluteUrl(image ?? DEFAULT_OG_IMAGE), [image]);
  // The default card really is 1200x630; a caller-supplied image may be any
  // shape, so only declare dimensions when we know them to be true.
  const declareImageSize = !image;

  const jsonLdArray = useMemo(() => {
    if (!jsonLd) return [];
    return Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  }, [jsonLd]);

  return (
    <Helmet>
      <html lang="ar" dir="rtl" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="author" content={author || "فريق طموح"} />
      <meta
        name="robots"
        content={noIndex ? "noindex,nofollow" : "index, follow"}
      />
      <meta name="theme-color" content="#923333" />

      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:site_name" content={OG_SITE_NAME} />
      <meta property="og:locale" content={effectiveLocale} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      {declareImageSize && <meta property="og:image:width" content="1200" />}
      {declareImageSize && <meta property="og:image:height" content="630" />}
      <meta property="og:image:alt" content={fullTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Article-specific */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}

      {/* iOS / Android polish */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      {/* JSON-LD structured data */}
      {jsonLdArray.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
};

export default PageMeta;
