import {
  Form,
  FormGroup,
  Label,
  Card,
  Input,
  Button,
  Container,
  CardHeader,
  CardBody,
  Alert,
  Spinner,
} from "reactstrap";
import Base from "./Base";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserService from "../services/user.service";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // nécessaire pour le style

const Signup = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    about: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e, field) => {
    setData({ ...data, [field]: e.target.value });
  };

  const resetForm = () => {
    setData({
      username: "",
      email: "",
      password: "",
      about: "",
    });
    setError("");
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      username: data.username,
      email: data.email,
      password: data.password,
      bio: data.about,
    };

    console.log("Sending payload to backend:", payload);

    try {
      const user = await UserService.register(payload);
      console.log("Registration successful:", user);

      toast.success("Registration successful!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Redirection après un petit délai pour que l’utilisateur voie le toast
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Registration error:", err.response?.data || err);
      setError(
        err.response?.data?.message
          ? Array.isArray(err.response.data.message)
            ? err.response.data.message.join(", ")
            : err.response.data.message
          : "Une erreur est survenue"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Base>
      <Container className="d-flex justify-content-center mt-5">
        <Card
          style={{
            width: "100%",
            maxWidth: "500px",
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <CardHeader
            className="text-center bg-white"
            style={{ fontSize: "1.5rem", fontWeight: "600" }}
          >
            Create an Account
          </CardHeader>
          <CardBody style={{ padding: "2rem" }}>
            {error && <Alert color="danger">{error}</Alert>}

            <Form onSubmit={submitForm}>
              <FormGroup>
                <Label for="username">Full Name</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Enter your full name"
                  type="text"
                  value={data.username}
                  onChange={(e) => handleChange(e, "username")}
                  required
                />
              </FormGroup>

              <FormGroup className="mt-3">
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  type="email"
                  value={data.email}
                  onChange={(e) => handleChange(e, "email")}
                  required
                />
              </FormGroup>

              <FormGroup className="mt-3">
                <Label for="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  type="password"
                  value={data.password}
                  onChange={(e) => handleChange(e, "password")}
                  required
                />
              </FormGroup>

              <FormGroup className="mt-3">
                <Label for="about">Bio</Label>
                <Input
                  id="about"
                  name="about"
                  type="textarea"
                  placeholder="Write a short bio"
                  value={data.about}
                  onChange={(e) => handleChange(e, "about")}
                />
              </FormGroup>

              <Container className="text-center mt-4">
                <Button color="primary" disabled={loading}>
                  {loading ? <Spinner size="sm" /> : "Sign Up"}
                </Button>
                <Button
                  className="ms-2"
                  type="button"
                  color="secondary"
                  onClick={resetForm}
                >
                  Reset
                </Button>
              </Container>
            </Form>
          </CardBody>
        </Card>

        {/*  Container du toast */}
        <ToastContainer />
      </Container>
    </Base>
  );
};

export default Signup;
