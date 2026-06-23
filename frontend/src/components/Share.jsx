import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../axios";
import { useContext, useMemo, useState } from "react";
import { Image, Public, Send } from "@mui/icons-material";
import { AuthContext } from "../context/AuthContext";
import { profileUrl } from "../utils/upload";

const Share = () => {
  const { currentUser } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [feeling, setFeeling] = useState("");
  const [audience, setAudience] = useState("Public");
  const queryClient = useQueryClient();

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  const upload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await makeRequest.post("/upload", formData);
    return res.data.filename || res.data;
  };

  const mutation = useMutation({
    mutationFn: (newPost) => makeRequest.post("/posts", newPost),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleShare = async (e) => {
    e.preventDefault();
    let imgUrl = "";
    if (file) imgUrl = await upload();
    const feelingText = feeling ? `Feeling ${feeling}\n\n` : "";
    mutation.mutate({ desc: `${feelingText}${desc}`, img: imgUrl });
    setFile(null);
    setDesc("");
    setFeeling("");
  };

  return (
    <section className="uks-card uks-composer">
      <div className="uks-composer__top">
        <img
          src={profileUrl(currentUser.profilePic)}
          alt={`${currentUser.username} profile`}
        />
        <textarea
          placeholder="Share something with your circle"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>

      {previewUrl && (
        <div className="uks-composer__preview">
          <img src={previewUrl} alt="Selected upload preview" />
          <button onClick={() => setFile(null)}>Remove</button>
        </div>
      )}

      <div className="uks-composer__actions">
        <select
          className="uks-composer__select"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          aria-label="Post audience"
        >
          <option>Public</option>
          <option>Connections</option>
          <option>Only me</option>
        </select>
        <label className="uks-composer__action">
          <Image />
          Photo
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>
        <select
          className="uks-composer__select"
          value={feeling}
          onChange={(e) => setFeeling(e.target.value)}
          aria-label="Feeling"
        >
          <option value="">Feeling</option>
          <option value="excited">Excited</option>
          <option value="focused">Focused</option>
          <option value="creative">Creative</option>
          <option value="grateful">Grateful</option>
        </select>
        <button
          type="button"
          className="uks-primary-btn"
          onClick={handleShare}
          disabled={!file && !desc.trim()}
        >
          {audience === "Public" ? <Public fontSize="small" /> : <Send fontSize="small" />}
          Post
        </button>
      </div>
    </section>
  );
};

export default Share;
