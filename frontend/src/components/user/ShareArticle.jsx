// src/components/user/ShareArticleManager.jsx
import React, { useEffect, useState } from "react";
import FileService from "../../services/file.service";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Container,
  Input,
  Row,
  Col,
} from "reactstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ShareArticleManager = () => {
  const [files, setFiles] = useState([]); // fichiers uploadés
  const [newFile, setNewFile] = useState(null);
  const [title, setTitle] = useState("");

  // Récupérer les fichiers déjà uploadés
  const fetchFiles = async () => {
    try {
      // Remplace par ton endpoint qui liste les fichiers
      const response = await FileService.getAllFiles();
      setFiles(response);
    } catch (err) {
      console.error("Erreur en chargeant les fichiers:", err);
      toast.error("Impossible de charger les fichiers.");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Upload d'un nouveau fichier
  const handleUpload = async () => {
    if (!newFile || !title) {
      toast.error("Fichier et titre sont requis !");
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem("user")) || {
        username: "anonymous",
      };
      const metadata = {
        title,
        uploadedBy: currentUser.username,
      };

      const uploaded = await FileService.uploadFile(newFile, metadata);
      toast.success(`Fichier "${title}" uploadé avec succès !`);
      setFiles((prev) => [...prev, uploaded]);
      setNewFile(null);
      setTitle("");
    } catch (err) {
      console.error("Erreur upload:", err);
      toast.error("Erreur lors de l'upload.");
    }
  };

  return (
    <Container className="my-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2>Upload & Manage Files</h2>

      {/* Formulaire Upload */}
      <Card className="my-3 p-3">
        <CardTitle tag="h5">Upload New File</CardTitle>
        <Row className="align-items-center">
          <Col md={4}>
            <Input
              type="text"
              placeholder="Titre du fichier"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Input
              type="file"
              onChange={(e) => setNewFile(e.target.files[0])}
            />
          </Col>
          <Col md={4}>
            <Button color="success" onClick={handleUpload}>
              Upload
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Liste des fichiers */}
      <Row>
        {files.length === 0 && <p>Aucun fichier uploadé pour le moment.</p>}
        {files.map((file, idx) => (
          <Col md={4} key={idx} className="mb-3">
            <Card>
              <CardBody>
                <CardTitle tag="h6">{file.title || file.key}</CardTitle>

                {/* Preview si image */}
                {file.contentType?.startsWith("image") ? (
                  <img
                    src={`${process.env.REACT_APP_API_URL}/files/${file.key}`}
                    alt={file.title || file.key}
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <CardText>Fichier: {file.key}</CardText>
                )}

                {/* Buttons */}
                <Button
                  color="primary"
                  className="me-2"
                  onClick={() => FileService.getFile(file.key, true)}
                >
                  Download
                </Button>
                <Button
                  color="secondary"
                  onClick={() =>
                    window.open(
                      `${process.env.REACT_APP_API_URL}/files/${file.key}`,
                      "_blank"
                    )
                  }
                >
                  View
                </Button>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ShareArticleManager;
