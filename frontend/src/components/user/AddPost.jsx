import React, { useState, useEffect } from "react";
import Base from "../Base";
import {
  Form,
  FormGroup,
  Label,
  Input,
  Container,
  Button,
  Alert,
} from "reactstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ArticleService from "../../services/article.service";

const AddPost = () => {
  const [postDetails, setPostDetails] = useState({
    title: "",
    body: "",
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");

  // Load current user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  // Submit the article
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!currentUser) {
      toast.error("You must be logged in to publish an article.");
      return;
    }

    const articleData = {
      article: {
        title: postDetails.title,
        description: postDetails.body.substring(0, 120), // short summary
        body: postDetails.body,
        tagList: [], // always empty to avoid errors
      },
    };

    try {
      await ArticleService.createArticle(articleData);
      toast.success("Article published successfully ");
      setPostDetails({ title: "", body: "" });
    } catch (err) {
      console.error("Backend error:", err.response?.data || err);

      const message =
        err.response?.data?.message?.[0] || "Error while creating the article";

      setError(message);
      toast.error(message);
    }
  };

  return (
    <Base>
      <ToastContainer position="top-right" autoClose={3000} />

      <Container className="my-4 p-4 border rounded shadow-sm">
        <h2 className="mb-4 text-center">Create New Article</h2>

        {error && <Alert color="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          {/* TITLE */}
          <FormGroup>
            <Label for="title">Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Article title"
              value={postDetails.title}
              onChange={(e) =>
                setPostDetails({ ...postDetails, title: e.target.value })
              }
              required
            />
          </FormGroup>

          {/* BODY */}
          <FormGroup className="mt-3">
            <Label for="body">Content</Label>
            <Input
              type="textarea"
              id="body"
              rows="8"
              placeholder="Write your article..."
              value={postDetails.body}
              onChange={(e) =>
                setPostDetails({ ...postDetails, body: e.target.value })
              }
              required
            />
          </FormGroup>

          {/* BUTTONS */}
          <div className="text-center mt-4">
            <Button color="success">Publish Article</Button>
            <Button
              color="danger"
              className="ms-2"
              type="button"
              onClick={() => setPostDetails({ title: "", body: "" })}
            >
              Reset
            </Button>
          </div>
        </Form>
      </Container>
    </Base>
  );
};

export default AddPost;
