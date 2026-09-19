// Renders schema.org structured data. "<" is escaped so product text can never
// close the <script> tag early.
export default function JsonLd({ data }) {
  if (!data) return null;
  const items = Array.isArray(data) ? data : [data];
  return items.map((item, i) => (
    <script
      key={i}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(item).replace(/</g, "\\u003c"),
      }}
    />
  ));
}
