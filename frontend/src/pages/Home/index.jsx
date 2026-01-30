import React, { useState, useEffect } from "react";
import {
  Container,
  Spinner,
  Alert,
  Badge,
  Card,
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import Base from "../../components/Base";
import homeCover from "../../config/homeCover.jpg";
import ArticleService from "../../services/article.service";

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const fetchArticles = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await ArticleService.getArticles();
      setBlogs(data.articles);
    } catch (err) {
      console.error(err);
      setError("Impossible de récupérer les articles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    handleSearchResults();
  };

  const handleSearchResults = () => {
    const filteredBlogs = blogs.filter((blog) =>
      blog.tagList?.some((tag) =>
        tag.toLowerCase().includes(searchKey.toLowerCase().trim())
      )
    );
    setBlogs(filteredBlogs);
  };

  const clearSearchBar = () => {
    setSearchKey("");
    fetchArticles();
  };

  const openModal = (article) => {
    setSelectedArticle(article);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedArticle(null);
    setModalOpen(false);
  };

  return (
    <Base>
      <img
        alt="home-cover"
        src={homeCover}
        style={{ height: "500px", width: "100%", objectFit: "cover" }}
      />

      <Container className="-">
        {loading ? (
          <div className="text-center my-5">
            <Spinner color="primary" />
          </div>
        ) : error ? (
          <Alert color="danger">{error}</Alert>
        ) : blogs.length === 0 ? (
          <Alert color="info">Aucun article trouvé.</Alert>
        ) : (
          <div className="row g-4 mt-2">
            {blogs.map((blog) => (
              <div key={blog.id} className="col-12 col-md-6 col-lg-4">
                <Card
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "transform 0.2s",
                  }}
                  className="hover-scale"
                >
                  <CardBody className="d-flex flex-column">
                    <h5 className="mb-2">{blog.title || "Untitled Article"}</h5>
                    <div
                      className="mb-2 text-muted"
                      style={{ fontSize: "0.85rem" }}
                    >
                      By <strong>{blog.author.username}</strong> •{" "}
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </div>
                    {blog.tagList?.length > 0 && (
                      <div className="mb-2">
                        {blog.tagList.map((tag, idx) => (
                          <Badge
                            key={idx}
                            color="secondary"
                            className="me-1"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p style={{ flexGrow: 1, overflow: "hidden" }}>
                      {blog.description || blog.body?.slice(0, 100) + "..."}
                    </p>
                    <span
                      onClick={() => openModal(blog)}
                      style={{
                        fontWeight: "500",
                        color: "#0d6efd",
                        cursor: "pointer",
                      }}
                    >
                      Read more →
                    </span>
                  </CardBody>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Modal for article */}
        {selectedArticle && (
          <Modal
            isOpen={modalOpen}
            toggle={closeModal}
            size="lg"
            className="modal-dialog-scrollable"
          >
            <ModalHeader toggle={closeModal}>
              {selectedArticle.title}
            </ModalHeader>
            <ModalBody style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <p className="text-muted">
                By <strong>{selectedArticle.author.username}</strong> •{" "}
                {new Date(selectedArticle.createdAt).toLocaleDateString()}
              </p>
              <div className="mb-2">
                {selectedArticle.tagList?.map((tag, idx) => (
                  <Badge key={idx} color="secondary" className="me-1">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p>{selectedArticle.body || selectedArticle.description}</p>
            </ModalBody>
          </Modal>
        )}
      </Container>
    </Base>
  );
};

export default Home;
