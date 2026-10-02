#!/usr/bin/env node
/**
 * Build-time prerendering for AI crawlers and non-JS consumers.
 *
 * WHY THIS EXISTS
 * ---------------
 * This app is a client-rendered Vite SPA: `dist/index.html` ships an empty
 * `<div id="root"></div>` and every title, description, heading and link comes
 * from React + react-helmet-async at runtime.
 *
 * Googlebot executes JavaScript, so classic search mostly copes. The AI answer
 * engines largely do not — GPTBot, ClaudeBot, PerplexityBot and the retrieval
 * fetchers behind chat answers read the raw HTML. To them all 8 routes are one
 * identical empty shell, so nothing here can be read, summarised or cited.
 * Social scrapers (LinkedIn, Slack) behave the same way.
 *
 * This writes `dist/<route>/index.html` per public route: the real built shell
 * with route-correct head tags and genuine readable Arabic content in `#root`.
 *
 * WHY IT NEEDS NO NGINX CHANGE
 * ----------------------------
 * `deploy/remote-setup.sh` writes the vhost with `try_files $uri $uri/ /index.html`.
 * A request for `/suggestion` resolves `/suggestion` (not a file) -> `/suggestion/`
 * (a directory) -> `/suggestion/index.html`, which is exactly what this emits.
 * Routes with no prerendered file fall through to the SPA shell as before.
 *
 * WHY IT IS SAFE FOR THE CLIENT
 * -----------------------------
 * `src/main.tsx` mounts with `createRoot(...).render(...)`, not `hydrateRoot`, so
 * React discards whatever is inside `#root` and renders from scratch. Prerendered
 * markup therefore cannot cause a hydration mismatch. If this ever moves to
 * `hydrateRoot`, this script must become real SSR or be removed.
 *
 * `/track` is deliberately NOT prerendered: it renders user ticket reference
 * numbers and is `noindex` for that reason.
 *
 * USAGE
 *   node scripts/prerender.mjs   # after `vite build`
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const SITE_URL = (process.env.SITE_URL || 'https://feedback.tomoh.io').replace(/\/+$/, '');
const PLATFORM_URL = 'https://tomoh.io';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const INTRO =
  'مركز صوت طموح هو القناة الرسمية لملاحظات مجتمع منصة طموح التعليمية: تُبلّغ عن مشكلة، تقترح تحسيناً، ترشّح دورة، تصوّت على ميزة، وتتابع طلبك برقم مرجعي فوري.';

/**
 * One entry per public route. Each opens with a definitional sentence and states
 * concrete facts, because that is the shape an answer engine can quote.
 * Content is grounded in what each page component actually does.
 */
const ROUTES = [
  {
    route: '/',
    title: 'مركز صوت طموح | شاركنا رأيك',
    description:
      'مركز صوت طموح: أبلغ عن مشكلة، اقترح تحسيناً، رشّح دورة، صوّت على الميزات، وتابع طلبك برقم مرجعي فوري.',
    h1: 'رأيك يبني طموح',
    body: [
      INTRO,
      'كل طلب تُرسله يحصل على رقم مرجعي فوري تتابع به حالته، دون الحاجة إلى حساب أو انتظار رد بالبريد.',
    ],
    links: [
      ['/service-request', 'طلب خدمة / كورس'],
      ['/bug-report', 'الإبلاغ عن مشكلة'],
      ['/suggestion', 'اقتراح تحسين'],
      ['/course-request', 'ترشيح دورة'],
      ['/satisfaction', 'استبيان الرضا'],
      ['/features', 'التصويت على الميزات'],
      ['/roadmap', 'خارطة الطريق'],
    ],
  },
  {
    route: '/bug-report',
    title: 'الإبلاغ عن مشكلة تقنية',
    description:
      'أبلغ عن خطأ أو مشكلة تقنية في منصة طموح: حدّد الصفحة ونوع المشكلة وأرفق لقطة شاشة، واحصل على رقم مرجعي لمتابعة الإصلاح.',
    h1: 'الإبلاغ عن مشكلة تقنية',
    body: [
      'استخدم هذه الصفحة للإبلاغ عن خطأ أو خلل تقني في منصة طموح — صفحة لا تفتح، زر لا يعمل، درس لا يُحمّل، أو أي سلوك غير متوقّع.',
      'يطلب النموذج الصفحة التي ظهرت فيها المشكلة، نوعها، ووصفاً لما حدث، مع إمكانية إرفاق لقطة شاشة. بعد الإرسال تحصل على رقم مرجعي فوري لمتابعة حالة الإصلاح.',
    ],
    links: [
      ['/suggestion', 'اقتراح تحسين بدلاً من الإبلاغ'],
      ['/', 'مركز صوت طموح'],
    ],
  },
  {
    route: '/suggestion',
    title: 'اقتراح تحسين على المنصة',
    description:
      'اقترح تحسيناً على منصة طموح في التصميم أو السرعة أو الدورات أو الاختبارات أو المجتمع، وتابع اقتراحك برقم مرجعي.',
    h1: 'اقتراح تحسين',
    body: [
      'هذه الصفحة لاقتراح تحسين على منصة طموح — لا للإبلاغ عن خطأ، بل لفكرة تجعل التجربة أفضل.',
      'يمكنك تحديد مجال الاقتراح: التصميم وواجهة الاستخدام، سرعة المنصة وأدائها، محتوى الدورات، الاختبارات والتقييم، المجتمع والتفاعل، الشهادات، أو مجال آخر. بعد الإرسال تحصل على رقم مرجعي لمتابعة الاقتراح.',
    ],
    links: [
      ['/features', 'صوّت على الميزات المقترحة'],
      ['/bug-report', 'الإبلاغ عن مشكلة بدلاً من ذلك'],
      ['/', 'مركز صوت طموح'],
    ],
  },
  {
    route: '/course-request',
    title: 'ترشيح دورة تدريبية',
    description:
      'رشّح دورة تريد إضافتها إلى منصة طموح — Flutter، React Native، الذكاء الاصطناعي، AWS، DevOps، Python وغيرها — وحدّد مستواك.',
    h1: 'ترشيح دورة تدريبية',
    body: [
      'هذه الصفحة لترشيح دورة أو تقنية تريد أن تتوفّر على منصة طموح. الترشيحات تُستخدم فعلياً في ترتيب أولويات المحتوى القادم.',
      'تشمل المجالات المقترحة تطوير تطبيقات الموبايل بـ Flutter و React Native و Kotlin، الذكاء الاصطناعي وتعلّم الآلة، الحوسبة السحابية و AWS، DevOps، تطوير الويب و Python، وتصميم تجربة وواجهة المستخدم UI/UX. يمكنك تحديد مستواك الحالي حتى يكون المحتوى مناسباً.',
    ],
    links: [
      [`${PLATFORM_URL}/courses`, 'استعرض الدورات المتاحة حالياً'],
      ['/', 'مركز صوت طموح'],
    ],
  },
  {
    route: '/service-request',
    title: 'طلب خدمة أو كورس',
    description:
      'اطلب من طموح كورساً تريد تعلّمه أو خدمة تقنية مثل تطوير موقع أو تطبيق أو نظام — في أقل من دقيقة ودون إنشاء حساب.',
    h1: 'طلب خدمة / كورس',
    body: [
      'هذه الصفحة لإخبار طموح بما تحتاجه: كورس في مجال مثل البرمجة أو الذكاء الاصطناعي أو الأمن السيبراني أو التصميم، أو خدمة تقنية مثل تطوير موقع إلكتروني أو تطبيق جوال أو نظام إداري.',
      'تختار نوع الطلب والمجال فقط، والتفاصيل ووسيلة التواصل اختيارية. لا يلزم تسجيل الدخول؛ وبعد الإرسال يمكنك إنشاء حساب لمتابعة حالة طلبك.',
    ],
    links: [
      ['/course-request', 'ترشيح دورة بتفاصيل أكثر'],
      ['/', 'مركز صوت طموح'],
    ],
  },
  {
    route: '/satisfaction',
    title: 'استبيان رضا المتعلّمين',
    description: 'شارك تقييمك لتجربتك على منصة طموح: المحتوى والمنصة والدعم، وما الذي يمكن تحسينه.',
    h1: 'استبيان الرضا',
    body: [
      'استبيان قصير لقياس رضاك عن تجربتك على منصة طموح: جودة المحتوى التعليمي، سهولة استخدام المنصة، ومستوى الدعم.',
      'الاستبيان مجهول إن رغبت، ونتائجه تُقرأ فعلياً عند التخطيط للتحسينات القادمة.',
    ],
    links: [
      ['/suggestion', 'اقترح تحسيناً محدداً'],
      ['/', 'مركز صوت طموح'],
    ],
  },
  {
    route: '/features',
    title: 'التصويت على الميزات المقترحة',
    description:
      'صوّت على الميزات المقترحة لمنصة طموح وشاهد ما يطلبه المجتمع أكثر، وما يجري العمل عليه الآن.',
    h1: 'التصويت على الميزات',
    body: [
      'هذه الصفحة تعرض الميزات التي اقترحها مجتمع طموح، ويمكنك التصويت لما تريده أكثر. الترتيب يعكس طلب المجتمع الفعلي.',
      'التصويت يساعد الفريق على معرفة ما يستحق الأولوية قبل بناء أي شيء، وما يُنجز منها ينتقل إلى خارطة الطريق.',
    ],
    links: [
      ['/roadmap', 'خارطة الطريق'],
      ['/suggestion', 'اقترح ميزة جديدة'],
      ['/', 'مركز صوت طموح'],
    ],
  },
  {
    route: '/roadmap',
    title: 'خارطة طريق منصة طموح',
    description:
      'خارطة طريق منصة طموح: ما هو مخطّط، وما يجري تنفيذه الآن، وما تم إطلاقه بالفعل — لوحة شفافة ومحدّثة.',
    h1: 'خارطة الطريق',
    body: [
      'خارطة طريق علنية لما يجري بناؤه في منصة طموح، معروضة في ثلاث مراحل: مخطّط، جارٍ التنفيذ، وتم الإطلاق.',
      'الهدف الشفافية: أن يرى المجتمع أين وصلت الأفكار التي اقترحها وصوّت عليها، بدل انتظار إعلان مفاجئ.',
    ],
    links: [
      ['/features', 'صوّت على الميزات المقترحة'],
      ['/', 'مركز صوت طموح'],
    ],
  },
];

function renderShell({ h1, body = [], links = [] }) {
  const parts = [`<h1>${esc(h1)}</h1>`];
  for (const p of body) parts.push(`<p>${esc(p)}</p>`);
  if (links.length) {
    parts.push('<h2>روابط</h2>', '<ul>');
    for (const [href, label] of links) parts.push(`<li><a href="${esc(href)}">${esc(label)}</a></li>`);
    parts.push('</ul>');
  }
  return parts.join('\n      ');
}

/**
 * Rewrite the shell's head for one route and fill `#root`.
 *
 * Tags replaced here carry `data-rh="true"`, which is how react-helmet-async 2.x
 * adopts and replaces a pre-existing tag rather than appending a duplicate.
 */
function buildPage(template, { route, title, description, jsonLd, shellHtml }) {
  const canonical = SITE_URL + (route === '/' ? '/' : route);
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);

  const setMeta = (attr, name, value) => {
    const re = new RegExp(`<meta([^>]*?)${attr}="${name}"([^>]*?)>`);
    if (re.test(html)) {
      html = html.replace(re, `<meta data-rh="true" ${attr}="${name}" content="${esc(value)}">`);
    } else {
      html = html.replace(
        '</head>',
        `  <meta data-rh="true" ${attr}="${name}" content="${esc(value)}">\n  </head>`
      );
    }
  };

  setMeta('name', 'description', description);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', canonical);
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);

  // The shell ships no static canonical on purpose (PageMeta emits one per route
  // at runtime). On a prerendered page a static canonical is correct, and is the
  // only one a non-JS consumer will ever see.
  if (!/rel="canonical"/.test(html)) {
    html = html.replace(
      '</head>',
      `  <link data-rh="true" rel="canonical" href="${esc(canonical)}">\n  </head>`
    );
  }

  html = html.replace(
    '</head>',
    `  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n  </head>`
  );

  // createRoot (not hydrateRoot) discards this on mount — see the file header.
  html = html.replace(/<div id="root"><\/div>/, `<div id="root">\n      ${shellHtml}\n    </div>`);

  return html;
}

async function main() {
  let template;
  try {
    template = await fs.readFile(path.join(DIST, 'index.html'), 'utf8');
  } catch {
    console.error('[prerender] dist/index.html not found — run `vite build` first.');
    process.exit(1);
  }

  if (!/<div id="root"><\/div>/.test(template)) {
    const rerun = /<div id="root">\s*\n?\s*<h1>/.test(template);
    console.error(
      rerun
        ? '[prerender] dist/index.html is already prerendered. Re-run `npm run build` first — ' +
            'this script needs the pristine shell as its template.'
        : '[prerender] dist/index.html has no empty <div id="root"></div> and does not look ' +
            'prerendered either — the build shell changed shape. Fix this script rather than ' +
            'shipping unprerendered HTML.'
    );
    process.exit(1);
  }

  for (const r of ROUTES) {
    const url = SITE_URL + (r.route === '/' ? '/' : r.route);
    // ContactPage is the honest type for the four feedback forms; the rest are
    // plain WebPages. The shell's @graph already declares the org and WebSite,
    // so these only reference them by @id.
    const isForm = ['/bug-report', '/suggestion', '/course-request', '/satisfaction'].includes(r.route);
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': isForm ? 'ContactPage' : 'WebPage',
      name: r.title,
      description: r.description,
      url,
      inLanguage: 'ar',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      publisher: { '@id': `${PLATFORM_URL}/#org` },
    };

    const rel = r.route === '/' ? 'index.html' : path.join(r.route.replace(/^\//, ''), 'index.html');
    const dest = path.join(DIST, rel);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(
      dest,
      buildPage(template, {
        route: r.route,
        title: r.title,
        description: r.description,
        jsonLd,
        shellHtml: renderShell(r),
      }),
      'utf8'
    );
    console.log(`[prerender] ${r.route} -> dist/${rel.replace(/\\/g, '/')}`);
  }

  console.log(
    `[prerender] wrote ${ROUTES.length} page(s). /track is excluded on purpose (noindex — it ` +
      'renders user ticket references).'
  );
  console.log('[prerender] served by the existing `try_files $uri $uri/ /index.html` rewrite.');
}

await main();
