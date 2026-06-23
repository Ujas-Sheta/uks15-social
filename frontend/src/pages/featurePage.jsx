/* eslint-disable react/prop-types */
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../axios";
import { uploadUrl } from "../utils/upload";

const config = {
  community: {
    title: "Communities",
    subtitle: "Discover and create focused circles around shared interests.",
    cta: "Create community post",
    metaPlaceholder: "Members or topic",
    filters: ["All", "Builders", "Local", "Design", "Career"],
  },
  market: {
    title: "Uks15 Market",
    subtitle: "Post local listings and discover useful items from your circle.",
    cta: "Create listing",
    metaPlaceholder: "Price, category, location",
    filters: ["All", "Tech", "Home", "Creator", "Local"],
  },
  clip: {
    title: "Clips",
    subtitle: "Share short visual updates, reels, and media-first posts.",
    cta: "Add clip",
    metaPlaceholder: "Duration",
    filters: ["All", "Video", "Image"],
  },
  event: {
    title: "Events",
    subtitle: "Create events and share upcoming plans with your circle.",
    cta: "Create event",
    metaPlaceholder: "Date, time, location",
    filters: ["All", "Today", "Weekend", "Online", "Local"],
  },
};

const FeaturePage = ({ type }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    media: "",
    mediaType: "image",
    meta: "",
  });
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const queryClient = useQueryClient();
  const page = config[type];
  const isClipPage = type === "clip";

  const { data = [], isPending } = useQuery({
    queryKey: ["features", type],
    queryFn: () => makeRequest.get(`/features/${type}`).then((res) => res.data),
  });

  const mutation = useMutation({
    mutationFn: (payload) => makeRequest.post(`/features/${type}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["features", type] });
      setForm({ title: "", description: "", media: "", mediaType: "image", meta: "" });
      setFile(null);
    },
  });

  const mediaSource = (media) =>
    media?.startsWith("http") ? media : uploadUrl(media);

  const uploadFeatureMedia = async () => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await makeRequest.post("/upload", formData);
    return res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const payload = { ...form };
    if (file) {
      const uploaded = await uploadFeatureMedia();
      payload.media = uploaded.filename;
      payload.mediaType = uploaded.mediaType;
    } else if (!payload.media) {
      payload.mediaType = "image";
    }

    mutation.mutate(payload);
  };

  const filteredData = data.filter((item) => {
    const haystack = `${item.title} ${item.description || ""} ${item.meta || ""}`.toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    const matchesFilter =
      activeFilter === "All" ||
      haystack.includes(activeFilter.toLowerCase()) ||
      (activeFilter === "Video" && item.mediaType === "video") ||
      (activeFilter === "Image" && item.mediaType !== "video");
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="uks-feature-page">
      <section className="uks-card uks-feature-hero">
        <h1>{page.title}</h1>
        <p>{page.subtitle}</p>
      </section>

      <section className="uks-feature-toolbar">
        <input
          type="search"
          placeholder={`Search ${page.title.toLowerCase()}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div>
          {page.filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={activeFilter === filter ? "is-active" : ""}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="uks-card uks-feature-form">
        <h2>{page.cta}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            type="text"
            placeholder={isClipPage ? "Video URL, image URL, or upload a video below" : "Image filename or URL"}
            value={form.media}
            onChange={(e) => setForm({ ...form, media: e.target.value })}
          />
          <input
            type="file"
            accept={isClipPage ? "video/*,image/*" : "image/*"}
            onChange={(e) => {
              const nextFile = e.target.files[0];
              setFile(nextFile);
              setForm({
                ...form,
                mediaType: nextFile?.type.startsWith("video/") ? "video" : "image",
              });
            }}
          />
          {isClipPage && (
            <select
              value={form.mediaType}
              onChange={(e) => setForm({ ...form, mediaType: e.target.value })}
            >
              <option value="video">Video clip</option>
              <option value="image">Image clip</option>
            </select>
          )}
          <input
            type="text"
            placeholder={page.metaPlaceholder}
            value={form.meta}
            onChange={(e) => setForm({ ...form, meta: e.target.value })}
          />
          <button className="uks-primary-btn" type="submit">
            Publish
          </button>
        </form>
      </section>

      <section className="uks-feature-grid">
        {isPending ? (
          <div className="uks-card uks-empty">Loading...</div>
        ) : filteredData.length === 0 ? (
          <div className="uks-card uks-instagram-empty">
            <h3>No matching content</h3>
            <p>Try another filter or create the first item for this section.</p>
          </div>
        ) : (
          filteredData.map((item) => (
            <article key={item.id} className="uks-card uks-feature-card">
              {item.media && (
                item.mediaType === "video" ? (
                  <video
                    src={mediaSource(item.media)}
                    controls
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img src={mediaSource(item.media)} alt={item.title} />
                )
              )}
              <div>
                {item.meta && <span>{item.meta}</span>}
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <small>By {item.name || item.username}</small>
                <footer>
                  <button type="button">{type === "event" ? "Interested" : "View"}</button>
                  <button type="button">{type === "market" ? "Message seller" : "Share"}</button>
                </footer>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
};

export default FeaturePage;
