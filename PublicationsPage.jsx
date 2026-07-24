import React, { useEffect, useState } from "react";

const palette = {
  ivory: "#FAF9F8",
  linen: "#F6F4F2",
  blush: "#F5E2E7",
  rose: "#EBCFD6",
  mauve: "#D7B6C0",
  charcoal: "#2D2A2A",
  muted: "#6B6663",
  border: "#EFE7E5",
  footer: "#111111",
};

const CATEGORIES = ["Research", "Advocacy", "Education", "Community"];

const Eyebrow = ({ children }) => (
  <div
    style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: "11px",
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color: palette.muted,
      fontWeight: 500,
    }}
  >
    {children}
  </div>
);

const Serif = ({ children, style = {}, as = "h2" }) => {
  const Tag = as;
  return (
    <Tag
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        color: palette.charcoal,
        fontWeight: 500,
        letterSpacing: "-0.01em",
        margin: 0,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
};

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function initial(name) {
  const n = (name || "").trim();
  return n ? n[0].toUpperCase() : "?";
}

const inputStyle = {
  width: "100%",
  border: `1px solid ${palette.border}`,
  borderRadius: "4px",
  padding: "12px 14px",
  fontFamily: "'Inter', sans-serif",
  fontSize: "14px",
  background: palette.ivory,
  color: palette.charcoal,
  outline: "none",
};

function Avatar({ name, size = 34 }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: palette.rose,
        color: "#8A5B67",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        fontSize: `${Math.round(size * 0.4)}px`,
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      {initial(name)}
    </div>
  );
}

/* ---------- New Publication form ---------- */

function NewPublicationForm({ onPublished }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    setError("");
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const post = {
      id,
      title: title.trim(),
      author: author.trim() || "Anonymous",
      category,
      body: body.trim(),
      ts: Date.now(),
    };
    try {
      await window.storage.set(`publications:${id}`, JSON.stringify(post), true);
      const idx = await window.storage.get("publications:index", true);
      const ids = idx ? JSON.parse(idx.value) : [];
      ids.push(id);
      await window.storage.set("publications:index", JSON.stringify(ids), true);
      setTitle("");
      setAuthor("");
      setBody("");
      setCategory(CATEGORIES[0]);
      onPublished(id);
    } catch (e) {
      setError("That didn't save. Try again?");
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        style={{ ...inputStyle, fontFamily: "'Cormorant Garamond', serif", fontSize: "20px" }}
      />
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name"
          style={{ ...inputStyle, flex: 1, minWidth: "160px" }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: "160px" }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your piece..."
        rows={8}
        style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          type="submit"
          disabled={submitting || !title.trim() || !body.trim()}
          style={{
            background: palette.charcoal,
            color: palette.ivory,
            border: "none",
            borderRadius: "999px",
            padding: "12px 28px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
            cursor: submitting ? "default" : "pointer",
            opacity: submitting || !title.trim() || !body.trim() ? 0.5 : 1,
          }}
        >
          {submitting ? "Posting..." : "Publish"}
        </button>
        {error && (
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: "#B3564B" }}>
            {error}
          </span>
        )}
      </div>
    </form>
  );
}

/* ---------- Comments (with one level of replies) ---------- */

function ReplyForm({ onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSubmit(name.trim(), text.trim());
        setName("");
        setText("");
      }}
      style={{ marginTop: "12px", paddingLeft: "44px" }}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name (optional)"
        style={{ ...inputStyle, fontSize: "13px", padding: "8px 12px", marginBottom: "8px" }}
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a reply..."
        rows={2}
        style={{ ...inputStyle, fontSize: "13px", padding: "8px 12px", resize: "vertical" }}
      />
      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
        <button
          type="submit"
          style={{
            background: palette.charcoal,
            color: palette.ivory,
            border: "none",
            borderRadius: "999px",
            padding: "6px 16px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "11.5px",
            cursor: "pointer",
          }}
        >
          Reply
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: "none",
            border: "none",
            color: palette.muted,
            fontFamily: "'Inter', sans-serif",
            fontSize: "11.5px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function CommentThread({ comment, onReply }) {
  const [replying, setReplying] = useState(false);
  return (
    <div style={{ marginTop: "24px" }}>
      <div style={{ display: "flex", gap: "12px" }}>
        <Avatar name={comment.name} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: palette.charcoal, fontWeight: 500 }}>
            {comment.name}
            <span style={{ color: palette.muted, fontWeight: 400, marginLeft: "8px", fontSize: "12px" }}>
              {timeAgo(comment.ts)}
            </span>
          </div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "13.5px", color: palette.muted, marginTop: "4px", lineHeight: 1.6 }}>
            {comment.text}
          </p>
          <button
            onClick={() => setReplying((r) => !r)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              marginTop: "4px",
              color: palette.muted,
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Reply
          </button>

          {(comment.replies || []).map((r, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", marginTop: "16px", paddingLeft: "8px" }}>
              <Avatar name={r.name} size={28} />
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "12.5px", color: palette.charcoal, fontWeight: 500 }}>
                  {r.name}
                  <span style={{ color: palette.muted, fontWeight: 400, marginLeft: "8px", fontSize: "11.5px" }}>
                    {timeAgo(r.ts)}
                  </span>
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "13px", color: palette.muted, marginTop: "4px", lineHeight: 1.6 }}>
                  {r.text}
                </p>
              </div>
            </div>
          ))}

          {replying && (
            <ReplyForm
              onCancel={() => setReplying(false)}
              onSubmit={(name, text) => {
                onReply(comment.id, name, text);
                setReplying(false);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function CommentsSection({ postId }) {
  const [comments, setComments] = useState(null);
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  const load = async () => {
    try {
      const c = await window.storage.get(`comments:${postId}`, true);
      setComments(c ? JSON.parse(c.value) : []);
    } catch (e) {
      setComments([]);
    }
  };

  useEffect(() => {
    load();
  }, [postId]);

  const save = async (next) => {
    setComments(next);
    try {
      await window.storage.set(`comments:${postId}`, JSON.stringify(next), true);
    } catch (e) {}
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim() || "Anonymous reader",
      text: text.trim(),
      ts: Date.now(),
      replies: [],
    };
    save([...(comments || []), entry]);
    setText("");
  };

  const handleReply = (commentId, replyName, replyText) => {
    const next = (comments || []).map((c) =>
      c.id === commentId
        ? {
            ...c,
            replies: [
              ...(c.replies || []),
              {
                name: replyName || "Anonymous reader",
                text: replyText,
                ts: Date.now(),
              },
            ],
          }
        : c
    );
    save(next);
  };

  if (comments === null) {
    return (
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13.5px", color: palette.muted, marginTop: "20px" }}>
        Loading comments...
      </p>
    );
  }

  return (
    <div style={{ marginTop: "56px" }}>
      <Eyebrow>{comments.length} {comments.length === 1 ? "Comment" : "Comments"}</Eyebrow>
      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (optional)"
          style={{ ...inputStyle, marginBottom: "10px" }}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your thoughts..."
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
        <button
          type="submit"
          style={{
            marginTop: "12px",
            background: palette.charcoal,
            color: palette.ivory,
            border: "none",
            borderRadius: "999px",
            padding: "10px 24px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "12.5px",
            cursor: "pointer",
          }}
        >
          Post Comment
        </button>
      </form>

      <div style={{ marginTop: "12px" }}>
        {comments.length === 0 && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13.5px", color: palette.muted, marginTop: "24px" }}>
            Be the first to comment.
          </p>
        )}
        {comments.slice().reverse().map((c) => (
          <CommentThread key={c.id} comment={c} onReply={handleReply} />
        ))}
      </div>
    </div>
  );
}

/* ---------- Post detail ---------- */

function PostDetail({ post, onBack }) {
  return (
    <div>
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "'Inter', sans-serif",
          fontSize: "13px",
          color: palette.muted,
          padding: 0,
          marginBottom: "36px",
        }}
      >
        ← Back to Publications
      </button>

      <Eyebrow>{post.category}</Eyebrow>
      <Serif as="h1" style={{ fontSize: "clamp(30px, 4.5vw, 44px)", marginTop: "14px", lineHeight: 1.15 }}>
        {post.title}
      </Serif>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "26px", paddingBottom: "26px", borderBottom: `1px solid ${palette.border}` }}>
        <Avatar name={post.author} />
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "13px", color: palette.charcoal }}>
          <div>{post.author}</div>
          <div style={{ color: palette.muted, fontSize: "12px" }}>{timeAgo(post.ts)}</div>
        </div>
      </div>

      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 300,
          fontSize: "16px",
          lineHeight: 1.85,
          color: palette.charcoal,
          marginTop: "32px",
          whiteSpace: "pre-wrap",
        }}
      >
        {post.body}
      </p>

      <CommentsSection postId={post.id} />
    </div>
  );
}

/* ---------- List ---------- */

function PostList({ posts, onOpen }) {
  if (posts.length === 0) {
    return (
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13.5px", color: palette.muted, marginTop: "20px" }}>
        Nothing published yet. Be the first.
      </p>
    );
  }
  return (
    <div style={{ marginTop: "24px", display: "flex", flexDirection: "column" }}>
      {posts.map((p) => (
        <div
          key={p.id}
          className="pub-post"
          onClick={() => onOpen(p.id)}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "16px",
            borderBottom: `1px solid ${palette.border}`,
            padding: "22px 16px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          <Avatar name={p.author} />
          <div style={{ flex: 1 }}>
            <Eyebrow>{p.category}</Eyebrow>
            <Serif as="p" style={{ fontSize: "19px", marginTop: "8px" }}>{p.title}</Serif>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "12.5px", color: palette.muted, marginTop: "8px" }}>
              {p.author} · {timeAgo(p.ts)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Page ---------- */

export default function PublicationsPage() {
  const [posts, setPosts] = useState(null);
  const [openId, setOpenId] = useState(null);

  const loadPosts = async () => {
    try {
      const idx = await window.storage.get("publications:index", true);
      const ids = idx ? JSON.parse(idx.value) : [];
      const loaded = [];
      for (const id of ids) {
        try {
          const p = await window.storage.get(`publications:${id}`, true);
          if (p) loaded.push(JSON.parse(p.value));
        } catch (e) {}
      }
      loaded.sort((a, b) => b.ts - a.ts);
      setPosts(loaded);
    } catch (e) {
      setPosts([]);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const openPost = (id) => {
    setOpenId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activePost = posts && posts.find((p) => p.id === openId);

  return (
    <div style={{ background: palette.ivory, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500,600;1,400&family=Inter:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        input::placeholder, textarea::placeholder { color: ${palette.muted}; }
        .pub-post:hover { background: ${palette.linen}; }
      `}</style>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "64px 24px 100px" }}>
        {activePost ? (
          <PostDetail post={activePost} onBack={() => setOpenId(null)} />
        ) : (
          <>
            <Eyebrow>The Journal</Eyebrow>
            <Serif as="h1" style={{ fontSize: "clamp(32px, 5vw, 48px)", marginTop: "16px" }}>
              Publications
            </Serif>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: "15px", color: palette.muted, marginTop: "16px" }}>
              A working newsroom, not a mockup. Publish a piece, and readers
              can comment and reply below it.
            </p>

            <div style={{ marginTop: "40px" }}>
              <NewPublicationForm onPublished={() => loadPosts()} />
            </div>

            <div style={{ marginTop: "72px", paddingTop: "40px", borderTop: `1px solid ${palette.border}` }}>
              <Eyebrow>{posts ? `${posts.length} Published` : "Loading"}</Eyebrow>
              {posts === null ? (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "13.5px", color: palette.muted, marginTop: "20px" }}>
                  Loading publications...
                </p>
              ) : (
                <PostList posts={posts} onOpen={openPost} />
              )}
            </div>
          </>
        )}

        <div style={{ marginTop: "80px", paddingTop: "28px", borderTop: `1px solid ${palette.border}` }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12.5px", color: palette.muted }}>
            Questions about publishing here? Contact{" "}
            <a href="mailto:leaplearningproject@gmail.com" style={{ color: palette.charcoal }}>
              leaplearningproject@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
