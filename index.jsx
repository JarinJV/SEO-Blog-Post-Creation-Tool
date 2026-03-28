import { useState, useCallback } from "react";

const STEPS = ["Scrape Products", "SEO Keywords", "Generate Blog", "Publish"];

const MOCK_PRODUCTS = [
  { id: 1, title: "Anker 65W USB-C Charger, PowerPort III Pod Lite", price: "$18.99", rating: "4.7★", reviews: "42,301", category: "Electronics", badge: "Best Seller", asin: "B09C3KDRD3" },
  { id: 2, title: "COSRX Advanced Snail 96 Mucin Power Essence", price: "$21.95", rating: "4.6★", reviews: "85,120", category: "Beauty", badge: "Trending", asin: "B07NBCG4X7" },
  { id: 3, title: "Kindle Paperwhite (16 GB) — Adjustable Warm Light", price: "$139.99", rating: "4.7★", reviews: "91,430", category: "Electronics", badge: "Best Seller", asin: "B09TMF2N3M" },
  { id: 4, title: "LANEIGE Lip Sleeping Mask — Berry (0.7 oz)", price: "$24.00", rating: "4.6★", reviews: "63,218", category: "Beauty", badge: "Trending", asin: "B07N3P1MFJ" },
  { id: 5, title: "Hydro Flask 32 oz Wide Mouth Water Bottle", price: "$44.95", rating: "4.8★", reviews: "59,874", category: "Sports", badge: "Best Seller", asin: "B075JJN7K8" },
  { id: 6, title: "Instant Pot Duo 7-in-1 Electric Pressure Cooker, 6 Qt", price: "$89.95", rating: "4.7★", reviews: "143,000", category: "Kitchen", badge: "Best Seller", asin: "B00FLYWNYQ" },
];

const MOCK_KEYWORDS = {
  "Anker 65W USB-C Charger, PowerPort III Pod Lite": [
    { keyword: "best usb-c charger 2025", volume: "22,000", difficulty: 42, intent: "Commercial" },
    { keyword: "fast charging adapter compact", volume: "14,500", difficulty: 35, intent: "Transactional" },
    { keyword: "anker charger review", volume: "8,100", difficulty: 28, intent: "Informational" },
    { keyword: "65w gan charger portable", volume: "5,400", difficulty: 31, intent: "Commercial" },
  ],
  "COSRX Advanced Snail 96 Mucin Power Essence": [
    { keyword: "snail mucin essence benefits", volume: "18,000", difficulty: 38, intent: "Informational" },
    { keyword: "best korean skincare essence", volume: "25,000", difficulty: 55, intent: "Commercial" },
    { keyword: "cosrx snail 96 review", volume: "12,300", difficulty: 29, intent: "Informational" },
    { keyword: "hydrating serum for dry skin", volume: "31,000", difficulty: 62, intent: "Commercial" },
  ],
  "Kindle Paperwhite (16 GB) — Adjustable Warm Light": [
    { keyword: "best e-reader 2025", volume: "29,000", difficulty: 48, intent: "Commercial" },
    { keyword: "kindle paperwhite review", volume: "22,400", difficulty: 34, intent: "Informational" },
    { keyword: "waterproof e-reader warm light", volume: "9,800", difficulty: 31, intent: "Commercial" },
    { keyword: "kindle vs kobo 2025", volume: "7,200", difficulty: 40, intent: "Informational" },
  ],
  "LANEIGE Lip Sleeping Mask — Berry (0.7 oz)": [
    { keyword: "best lip sleeping mask", volume: "16,500", difficulty: 36, intent: "Commercial" },
    { keyword: "laneige lip mask review", volume: "11,000", difficulty: 27, intent: "Informational" },
    { keyword: "overnight lip treatment hydrating", volume: "8,700", difficulty: 33, intent: "Commercial" },
    { keyword: "k-beauty lip care routine", volume: "6,300", difficulty: 29, intent: "Informational" },
  ],
  "Hydro Flask 32 oz Wide Mouth Water Bottle": [
    { keyword: "best insulated water bottle", volume: "35,000", difficulty: 58, intent: "Commercial" },
    { keyword: "hydro flask 32oz review", volume: "14,200", difficulty: 31, intent: "Informational" },
    { keyword: "stainless steel water bottle 2025", volume: "19,800", difficulty: 45, intent: "Commercial" },
    { keyword: "keep drinks cold 24 hours bottle", volume: "7,600", difficulty: 28, intent: "Transactional" },
  ],
  "Instant Pot Duo 7-in-1 Electric Pressure Cooker, 6 Qt": [
    { keyword: "best electric pressure cooker 2025", volume: "41,000", difficulty: 61, intent: "Commercial" },
    { keyword: "instant pot duo review", volume: "27,500", difficulty: 39, intent: "Informational" },
    { keyword: "multi-cooker slow cooker air fryer", volume: "15,300", difficulty: 44, intent: "Commercial" },
    { keyword: "instant pot beginner recipes", volume: "33,000", difficulty: 36, intent: "Informational" },
  ],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const diffColor = (d) => {
  if (d < 35) return { bg: "var(--color-background-success)", color: "var(--color-text-success)" };
  if (d < 50) return { bg: "var(--color-background-warning)", color: "var(--color-text-warning)" };
  return { bg: "var(--color-background-danger)", color: "var(--color-text-danger)" };
};

const intentColor = (i) => {
  if (i === "Commercial") return { bg: "var(--color-background-info)", color: "var(--color-text-info)" };
  if (i === "Transactional") return { bg: "#EAF3DE", color: "#3B6D11" };
  return { bg: "var(--color-background-secondary)", color: "var(--color-text-secondary)" };
};

const Badge = ({ label, style = {} }) => (
  <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 99, border: "0.5px solid var(--color-border-secondary)", ...style }}>
    {label}
  </span>
);

const Pill = ({ label, bg, color }) => (
  <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 99, background: bg, color }}>{label}</span>
);

const StepIndicator = ({ current }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: "2rem" }}>
    {STEPS.map((s, i) => (
      <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 500,
            background: i < current ? "var(--color-text-primary)" : i === current ? "var(--color-background-info)" : "var(--color-background-secondary)",
            color: i < current ? "var(--color-background-primary)" : i === current ? "var(--color-text-info)" : "var(--color-text-tertiary)",
            border: i === current ? "1.5px solid var(--color-border-info)" : "0.5px solid var(--color-border-secondary)",
          }}>
            {i < current ? "✓" : i + 1}
          </div>
          <span style={{ fontSize: 10, color: i === current ? "var(--color-text-primary)" : "var(--color-text-tertiary)", fontWeight: i === current ? 500 : 400, whiteSpace: "nowrap" }}>{s}</span>
        </div>
        {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: i < current ? "var(--color-text-primary)" : "var(--color-border-tertiary)", margin: "0 6px", marginBottom: 18 }} />}
      </div>
    ))}
  </div>
);

const LoadingDots = ({ label }) => {
  const [dots, setDots] = useState(".");
  useState(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 400);
    return () => clearInterval(t);
  });
  return <span style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>{label}{dots}</span>;
};

function Step1({ onNext }) {
  const [source, setSource] = useState("amazon");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);

  const scrape = async () => {
    setLoading(true);
    setProducts([]);
    await sleep(1800);
    const filtered = category === "all" ? MOCK_PRODUCTS : MOCK_PRODUCTS.filter(p => p.category.toLowerCase() === category);
    setProducts(filtered);
    setLoading(false);
  };

  const toggle = (id) => setSelected(s => s === id ? null : id);

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Scrape trending products</h2>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>Select a source and product category to identify best-selling or trending items.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1rem" }}>
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Source</label>
          <select value={source} onChange={e => setSource(e.target.value)} style={{ width: "100%" }}>
            <option value="amazon">Amazon Best Sellers</option>
            <option value="ebay">eBay Trending</option>
            <option value="flipkart">Flipkart Top Picks</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: "100%" }}>
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="beauty">Beauty</option>
            <option value="kitchen">Kitchen</option>
            <option value="sports">Sports</option>
          </select>
        </div>
      </div>

      <button onClick={scrape} style={{ marginBottom: "1.5rem" }} disabled={loading}>
        {loading ? "Scraping…" : "Scrape products →"}
      </button>

      {loading && <div style={{ padding: "2rem 0", textAlign: "center" }}><LoadingDots label="Fetching products from Amazon" /></div>}

      {products.length > 0 && (
        <div>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: "0.75rem" }}>{products.length} products found — select one to continue</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {products.map(p => (
              <div key={p.id} onClick={() => toggle(p.id)}
                style={{
                  padding: "12px 14px", borderRadius: "var(--border-radius-lg)", cursor: "pointer",
                  background: selected === p.id ? "var(--color-background-info)" : "var(--color-background-primary)",
                  border: selected === p.id ? "1.5px solid var(--color-border-info)" : "0.5px solid var(--color-border-tertiary)",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {p.category === "Electronics" ? "⚡" : p.category === "Beauty" ? "✨" : p.category === "Kitchen" ? "🍳" : "💧"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: selected === p.id ? "var(--color-text-info)" : "var(--color-text-primary)" }}>{p.title}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{p.price}</span>
                    <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{p.rating} ({p.reviews.toLocaleString()} reviews)</span>
                    <Pill label={p.badge} bg={p.badge === "Best Seller" ? "#FAEEDA" : "#EAF3DE"} color={p.badge === "Best Seller" ? "#854F0B" : "#3B6D11"} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "1.5rem" }}>
            <button onClick={() => onNext(products.find(p => p.id === selected))} disabled={!selected}>
              Continue with selected product →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Step2({ product, onNext, onBack }) {
  const [tool, setTool] = useState("ubersuggest");
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [selected, setSelected] = useState([]);

  const research = async () => {
    setLoading(true);
    setKeywords([]);
    setSelected([]);
    await sleep(2100);
    const kws = MOCK_KEYWORDS[product.title] || MOCK_KEYWORDS["Anker 65W USB-C Charger, PowerPort III Pod Lite"];
    setKeywords(kws);
    setSelected(kws.slice(0, 3).map(k => k.keyword));
    setLoading(false);
  };

  const toggle = (kw) => setSelected(s => s.includes(kw) ? s.filter(x => x !== kw) : s.length < 4 ? [...s, kw] : s);

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Research SEO keywords</h2>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>Product: <strong style={{ fontWeight: 500 }}>{product.title}</strong>. Select 3–4 keywords to target.</p>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Keyword tool</label>
        <select value={tool} onChange={e => setTool(e.target.value)} style={{ width: "100%", maxWidth: 280 }}>
          <option value="ubersuggest">Ubersuggest</option>
          <option value="gkp">Google Keyword Planner</option>
          <option value="ahrefs">Ahrefs (simulated)</option>
          <option value="semrush">SEMrush (simulated)</option>
        </select>
      </div>

      <button onClick={research} disabled={loading} style={{ marginBottom: "1.5rem" }}>
        {loading ? "Researching…" : "Research keywords →"}
      </button>

      {loading && <div style={{ padding: "2rem 0", textAlign: "center" }}><LoadingDots label="Analyzing search data" /></div>}

      {keywords.length > 0 && (
        <div>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: "0.75rem" }}>Select 3–4 keywords ({selected.length}/4 selected)</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {keywords.map(k => {
              const dc = diffColor(k.difficulty);
              const ic = intentColor(k.intent);
              const isSelected = selected.includes(k.keyword);
              return (
                <div key={k.keyword} onClick={() => toggle(k.keyword)}
                  style={{
                    padding: "10px 14px", borderRadius: "var(--border-radius-md)", cursor: "pointer",
                    background: isSelected ? "var(--color-background-info)" : "var(--color-background-primary)",
                    border: isSelected ? "1.5px solid var(--color-border-info)" : "0.5px solid var(--color-border-tertiary)",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: isSelected ? "none" : "1px solid var(--color-border-secondary)", background: isSelected ? "var(--color-text-info)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", flexShrink: 0 }}>
                    {isSelected && "✓"}
                  </div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: isSelected ? "var(--color-text-info)" : "var(--color-text-primary)" }}>{k.keyword}</span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{parseInt(k.volume).toLocaleString()} / mo</span>
                    <Pill label={`KD ${k.difficulty}`} bg={dc.bg} color={dc.color} />
                    <Pill label={k.intent} bg={ic.bg} color={ic.color} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: "1.5rem", display: "flex", gap: 8 }}>
            <button onClick={onBack} style={{ background: "transparent" }}>← Back</button>
            <button onClick={() => onNext(selected)} disabled={selected.length < 3}>
              Generate blog with {selected.length} keywords →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Step3({ product, keywords, onNext, onBack }) {
  const [tone, setTone] = useState("informative");
  const [loading, setLoading] = useState(false);
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState(null);
  const [wordCount, setWordCount] = useState(0);

  const generate = useCallback(async () => {
    setLoading(true);
    setBlog(null);
    setError(null);
    try {
      const prompt = `You are an SEO content writer. Write a blog post about the product below. Follow these rules strictly:
- Length: 150–200 words only
- Tone: ${tone}
- Naturally include ALL of these exact keywords (lowercase): ${keywords.join(", ")}
- Start with a compelling title (H1)
- No markdown formatting — just the title on its own line, then the content paragraph(s)
- No fluff, no bullet lists — flowing prose only
- End with a brief call-to-action

Product: "${product.title}"
Price: ${product.price}
Rating: ${product.rating} based on ${product.reviews} reviews
Category: ${product.category}`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("\n").trim();
      if (!text) throw new Error("Empty response");
      setBlog(text);
      setWordCount(text.split(/\s+/).filter(Boolean).length);
    } catch (e) {
      setError("Could not generate blog post. Please try again.");
    }
    setLoading(false);
  }, [product, keywords, tone]);

  const lines = blog ? blog.split("\n").filter(Boolean) : [];
  const title = lines[0] || "";
  const body = lines.slice(1).join("\n\n");

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Generate blog post</h2>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
        AI will write a 150–200 word SEO blog post naturally incorporating your keywords.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1rem" }}>
        {keywords.map(k => <Pill key={k} label={k} bg="var(--color-background-info)" color="var(--color-text-info)" />)}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Tone</label>
        <select value={tone} onChange={e => setTone(e.target.value)} style={{ width: "100%", maxWidth: 240 }}>
          <option value="informative">Informative</option>
          <option value="conversational">Conversational</option>
          <option value="enthusiastic">Enthusiastic</option>
          <option value="professional">Professional</option>
        </select>
      </div>

      <button onClick={generate} disabled={loading} style={{ marginBottom: "1.5rem" }}>
        {loading ? "Writing…" : blog ? "Regenerate ↻" : "Generate blog post →"}
      </button>

      {loading && <div style={{ padding: "2rem 0", textAlign: "center" }}><LoadingDots label="Claude is writing your blog post" /></div>}
      {error && <p style={{ color: "var(--color-text-danger)", fontSize: 13 }}>{error}</p>}

      {blog && (
        <div>
          <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.5rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: 17, fontWeight: 500, margin: 0, flex: 1, lineHeight: 1.4 }}>{title}</h3>
              <Pill label={`${wordCount} words`} bg={wordCount >= 150 && wordCount <= 200 ? "var(--color-background-success)" : "var(--color-background-warning)"} color={wordCount >= 150 && wordCount <= 200 ? "var(--color-text-success)" : "var(--color-text-warning)"} />
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--color-text-secondary)", margin: 0, whiteSpace: "pre-wrap" }}>{body}</p>
            <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "0.5px solid var(--color-border-tertiary)", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {keywords.map(k => {
                const found = blog.toLowerCase().includes(k.toLowerCase());
                return <Pill key={k} label={`${found ? "✓" : "✗"} ${k}`} bg={found ? "var(--color-background-success)" : "var(--color-background-danger)"} color={found ? "var(--color-text-success)" : "var(--color-text-danger)"} />;
              })}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onBack} style={{ background: "transparent" }}>← Back</button>
            <button onClick={() => onNext(blog, title)}>Continue to publish →</button>
          </div>
        </div>
      )}
      {!blog && !loading && (
        <button onClick={onBack} style={{ background: "transparent" }}>← Back</button>
      )}
    </div>
  );
}

function Step4({ product, keywords, blog, title }) {
  const [platform, setPlatform] = useState("medium");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const PLATFORMS = {
    medium: { name: "Medium", url: "https://medium.com/new-story", icon: "M" },
    wordpress: { name: "WordPress", url: "https://wordpress.com/post/new", icon: "W" },
    hashnode: { name: "Hashnode", url: "https://hashnode.com/new", icon: "H" },
    devto: { name: "Dev.to", url: "https://dev.to/new", icon: "D" },
  };

  const publish = async () => {
    setLoading(true);
    await sleep(1500);
    setLoading(false);
    setPublished(true);
  };

  const copy = () => {
    navigator.clipboard.writeText(blog);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const slugTitle = title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 50);
  const mockUrl = `https://${platform}.com/@seo-tool/${slugTitle}-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Publish your blog post</h2>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>Choose a platform and publish your optimized blog post.</p>

      {!published ? (
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 8 }}>Publishing platform</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: "1.5rem" }}>
            {Object.entries(PLATFORMS).map(([key, p]) => (
              <div key={key} onClick={() => setPlatform(key)}
                style={{
                  padding: "10px 14px", borderRadius: "var(--border-radius-md)", cursor: "pointer",
                  background: platform === key ? "var(--color-background-info)" : "var(--color-background-primary)",
                  border: platform === key ? "1.5px solid var(--color-border-info)" : "0.5px solid var(--color-border-tertiary)",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: platform === key ? "var(--color-text-info)" : "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, color: platform === key ? "#fff" : "var(--color-text-secondary)" }}>{p.icon}</div>
                <span style={{ fontSize: 13, fontWeight: 500, color: platform === key ? "var(--color-text-info)" : "var(--color-text-primary)" }}>{p.name}</span>
              </div>
            ))}
          </div>

          <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "0.75rem 1rem", marginBottom: "1.5rem", fontSize: 12, color: "var(--color-text-secondary)" }}>
            <p style={{ margin: "0 0 4px", fontWeight: 500, color: "var(--color-text-primary)", fontSize: 13 }}>Post summary</p>
            <p style={{ margin: 0 }}>Title: {title}</p>
            <p style={{ margin: 0 }}>Keywords: {keywords.join(", ")}</p>
            <p style={{ margin: 0 }}>Platform: {PLATFORMS[platform].name}</p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={copy} style={{ background: "transparent" }}>{copied ? "Copied!" : "Copy to clipboard"}</button>
            <a href={PLATFORMS[platform].url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <button style={{ background: "transparent" }}>Open {PLATFORMS[platform].name} ↗</button>
            </a>
            <button onClick={publish} disabled={loading}>
              {loading ? "Publishing…" : `Publish to ${PLATFORMS[platform].name} →`}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ background: "var(--color-background-success)", border: "0.5px solid var(--color-border-success)", borderRadius: "var(--border-radius-lg)", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 6px", color: "var(--color-text-success)" }}>Blog post published successfully!</p>
            <p style={{ fontSize: 12, color: "var(--color-text-success)", margin: "0 0 12px" }}>Your optimized blog post is live on {PLATFORMS[platform].name}.</p>
            <div style={{ background: "var(--color-background-primary)", borderRadius: "var(--border-radius-md)", padding: "8px 12px", fontSize: 12, color: "var(--color-text-info)", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
              {mockUrl}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: "1.5rem" }}>
            {[
              { label: "SEO score", value: "91 / 100", color: "var(--color-text-success)" },
              { label: "Readability", value: "Grade 9", color: "var(--color-text-info)" },
              { label: "Word count", value: `${blog.split(/\s+/).length} words`, color: "var(--color-text-primary)" },
              { label: "Keywords used", value: `${keywords.length} / ${keywords.length}`, color: "var(--color-text-success)" },
            ].map(m => (
              <div key={m.label} style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "0.75rem 1rem" }}>
                <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 2px" }}>{m.label}</p>
                <p style={{ fontSize: 18, fontWeight: 500, margin: 0, color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={copy} style={{ background: "transparent" }}>{copied ? "Copied!" : "Copy blog text"}</button>
            <a href={mockUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <button>View published post ↗</button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(0);
  const [product, setProduct] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [blog, setBlog] = useState("");
  const [title, setTitle] = useState("");

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "1.5rem 1rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--color-background-info)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "var(--color-text-info)", fontWeight: 500 }}>S</div>
          <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>SEO Blog Post Creator</h1>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
          Scrape trending products → research keywords → generate AI blog posts → publish.
        </p>
      </div>

      <StepIndicator current={step} />

      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.5rem" }}>
        {step === 0 && <Step1 onNext={(p) => { setProduct(p); setStep(1); }} />}
        {step === 1 && <Step2 product={product} onNext={(kw) => { setKeywords(kw); setStep(2); }} onBack={() => setStep(0)} />}
        {step === 2 && <Step3 product={product} keywords={keywords} onNext={(b, t) => { setBlog(b); setTitle(t); setStep(3); }} onBack={() => setStep(1)} />}
        {step === 3 && <Step4 product={product} keywords={keywords} blog={blog} title={title} />}
      </div>
    </div>
  );
}
