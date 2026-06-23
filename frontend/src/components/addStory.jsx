import PropTypes from "prop-types";
import { AddPhotoAlternate, Close, Send } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { makeRequest } from "../axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const AddStory = ({ setAddStory }) => {
  const [file, setFile] = useState(null);
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
    mutationFn: (newStory) => makeRequest.post("/stories", newStory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      setFile(null);
      setAddStory(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || mutation.isPending) return;
    const imgUrl = await upload();
    mutation.mutate({ img: imgUrl });
  };

  return (
    <div className="uks-story-uploader" role="dialog" aria-modal="true">
      <form className="uks-story-uploader__card" onSubmit={handleSubmit}>
        <div className="uks-story-uploader__header">
          <div>
            <span className="uks-kicker">
              <AddPhotoAlternate fontSize="small" />
              New story
            </span>
            <h2>Create a story</h2>
          </div>
          <button type="button" onClick={() => setAddStory(false)} title="Close">
            <Close />
          </button>
        </div>

        <label className={`uks-story-dropzone ${previewUrl ? "has-preview" : ""}`}>
          {previewUrl ? (
            <img src={previewUrl} alt="Selected story preview" />
          ) : (
            <span>
              <AddPhotoAlternate />
              Choose a photo
              <small>Make it vertical for the best story view.</small>
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        <div className="uks-story-uploader__actions">
          <button
            type="button"
            className="uks-secondary-btn"
            onClick={() => setFile(null)}
            disabled={!file || mutation.isPending}
          >
            Clear
          </button>
          <button
            type="submit"
            className="uks-primary-btn"
            disabled={!file || mutation.isPending}
          >
            <Send fontSize="small" />
            {mutation.isPending ? "Publishing" : "Publish story"}
          </button>
        </div>
      </form>
    </div>
  );
};

AddStory.propTypes = {
  setAddStory: PropTypes.func.isRequired,
};

export default AddStory;
