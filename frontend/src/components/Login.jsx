import {
  Form,
  FormGroup,
  Label,
  Input,
  Card,
  CardBody,
  CardHeader,
  Container,
  Button,
  Spinner,
  Alert,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import Base from "./Base";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import UserService from "../services/user.service";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const navigate = useNavigate();

  const [loginDetails, setLoginDetails] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setLoginDetails({ ...loginDetails, [e.target.name]: e.target.value });
  };

  const loginUser = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call login API
      const response = await UserService.login(
        loginDetails.email,
        loginDetails.password
      );

      // Save user and token in localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response));

      // Show success toast
      toast.success("Login successful! Redirecting...");

      // Redirect immediately after toast
      setTimeout(() => {
        navigate("/user/dashboard", { replace: true });
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Email ou mot de passe incorrect"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Base>
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: "450px",
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <CardHeader
            className="text-center bg-white"
            style={{ fontSize: "1.5rem", fontWeight: "600" }}
          >
            Welcome Back
          </CardHeader>

          <CardBody style={{ padding: "2rem" }}>
            {error && <Alert color="danger">{error}</Alert>}

            <Form onSubmit={loginUser}>
              <FormGroup>
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginDetails.email}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup className="mt-3">
                <Label for="password">Password</Label>
                <InputGroup>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginDetails.password}
                    onChange={handleChange}
                    required
                  />
                  <InputGroupText
                    style={{ cursor: "pointer", background: "#fff" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </InputGroupText>
                </InputGroup>
              </FormGroup>

              <Button
                color="dark"
                block
                className="mt-4"
                disabled={loading}
                style={{
                  borderRadius: "8px",
                  padding: "10px",
                  fontWeight: "500",
                }}
              >
                {loading ? <Spinner size="sm" /> : "Login"}
              </Button>
            </Form>

            <ToastContainer position="top-right" autoClose={1500} />
          </CardBody>
        </Card>
      </Container>
    </Base>
  );
};

export default Login;
