import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.scss";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImage: null,
    location: ""
  });
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: name === "profileImage" ? files[0] : value,
    });
  };

  useEffect(() => {
    setPasswordMatch(
      formData.password === formData.confirmPassword ||
      formData.confirmPassword === ""
    );
  }, [formData.password, formData.confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.profileImage) {
      setImageError(true);
      return;
    } else {
      setImageError(false);
    }

    try {
      const registerForm = new FormData();
      for (const key in formData) registerForm.append(key, formData[key]);

      const response = await fetch("https://stayhub-backend-ezhs.onrender.com/auth/register", {
        method: "POST",
        body: registerForm,
      });

      const data = await response.json();
      if (response.ok) {
        alert("Registered successfully!");
        navigate("/login");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.log(err);
      alert("Registration failed: " + err.message);
    }
  };

  return (
    <div className="register">
      <div className="register_content">
        <form className="register_content_form" onSubmit={handleSubmit}>
          <input placeholder="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
          <input placeholder="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
          <input placeholder="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          <input placeholder="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
          <input placeholder="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
          {!passwordMatch && <p style={{ color: "red" }}>Passwords do not match!</p>}


          <input id="image" type="file" name="profileImage" accept="image/*" style={{ display: "none" }} onChange={handleChange} />


          <label htmlFor="image">
            <img src="/assets/addImage.png" alt="Add" />
            <p>Upload Your Photo</p>
          </label>

          {imageError && <p style={{ color: "red" }}>Please upload a profile image</p>}
          {formData.profileImage && <img src={URL.createObjectURL(formData.profileImage)} alt={formData.profileImage.name} style={{ maxWidth: "80px" }} />}
          <button type="submit" disabled={!passwordMatch || !formData.profileImage}>REGISTER</button>
        </form>
        <a href="/login">Already have an account? Log In Here</a>
      </div>
    </div>
  );
};

export default RegisterPage;
