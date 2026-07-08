import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPostBySlug } from "@/lib/blog";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      authors: [post.author],
      publishedTime: post.date,
      images: post.image
        ? [
            {
              url: post.image,
              width: 1200,
              height: 675,
              alt: post.imageAlt || post.title,
            },
          ]
        : undefined,
    },
  };
}

export default async function BlogPost(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.description,
      image: post.image ? `https://www.usdentistsdirectory.com${post.image}` : undefined,
      author: {
        "@type": "Organization",
        name: post.author,
      },
      publisher: {
        "@type": "Organization",
        name: "UsDentistsDirectory.com",
        url: "https://www.usdentistsdirectory.com",
      },
      mainEntityOfPage: `https://www.usdentistsdirectory.com/blog/${post.slug}`,
      datePublished: post.date,
    },
    post.faqs?.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null,
  ].filter(Boolean);

  return (
    <div className="bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="text-sm text-slate-500">
          <Link href="/" className="hover:text-blue-700">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/blog" className="hover:text-blue-700">
            Blog
          </Link>{" "}
          / <span className="text-slate-700">{post.category}</span>
        </nav>

        <header className="mt-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">
              {post.category}
            </span>
            <span className="text-slate-500">{post.readTime}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">{post.date}</span>
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-slate-600">{post.description}</p>
          <div className="mt-6 border-b border-blue-100 pb-6">
            <p className="text-sm font-semibold text-slate-900">By {post.author}</p>
          </div>
        </header>

        {post.image && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
            <Image
              src={post.image}
              alt={post.imageAlt || post.title}
              width={1200}
              height={675}
              priority={false}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        <div className="prose-blog mt-8">
          {post.content.map((section, i) => (
            <div key={i} className="mb-6">
              {section.heading && (
                <h2 className="mb-3 text-2xl font-bold text-slate-900">{section.heading}</h2>
              )}
              <p className="text-base leading-relaxed text-slate-700">{section.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-blue-600 p-8 text-white">
          <h2 className="text-2xl font-bold">Ready to find your dentist?</h2>
          <p className="mt-2 text-blue-100">
            Browse our directory of {20}+ verified US dentists by city and specialty.
          </p>
          <Link
            href="/dentists"
            className="mt-5 inline-block rounded-lg bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-sm hover:bg-blue-50"
          >
            Find a Dentist →
          </Link>
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-bold text-slate-900">More from the blog</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="block rounded-xl border border-blue-100 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                >
                  <span className="text-xs font-semibold text-blue-700">{p.category}</span>
                  <h3 className="mt-1 text-base font-bold text-slate-900">{p.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
