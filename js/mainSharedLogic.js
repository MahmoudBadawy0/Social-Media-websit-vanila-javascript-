const loading = document.getElementById("loading");

const topBtn = document.getElementById("topBtn");

const navRegister = document.getElementById("navRegister");
const navLogin = document.getElementById("navLogin");
const navLogout = document.getElementById("navLogout");
const navUserDetails = document.getElementById("navUserDetails");
const navUserName = document.getElementById("navUserName");
const navUserImg = document.getElementById("navUserImg");

const loginBtn = document.getElementById("loginBtn");
const recipientName = document.getElementById("recipient-name");
const recipientPassword = document.getElementById("recipient-password");

const RegisterBtn = document.getElementById("RegisterBtn");
const registerName = document.getElementById("registerName");
const registerUserName = document.getElementById("registerUserName");
const registerPassword = document.getElementById("registerPassword");
const registerImage = document.getElementById("registerImage");

let baseUrl = "https://tarmeezacademy.com/api/v1";

// Show the button when the user scrolls down 800px from the top
window.addEventListener("scroll", () => {
  if (window.scrollY > 200) {
    topBtn.style.display = "block";
  } else {
    topBtn.style.display = "none";
  }
});

// Scroll to the top when the button is clicked
topBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

//! edit ui
function setupUi() {
  const addPost = document.getElementById("addPost");
  const commentGroup = document.getElementById("commentGroup");

  const token = localStorage.getItem("token");
  if (token == null) {
    //no token guest user
    if (addPost != null) {
      addPost.style.display = "none";
    }

    // commentGroup.style.display = "none";

    navLogin.style.display = "inline";
    navRegister.style.display = "inline";
    navLogout.style.display = "none";
    navUserDetails.style.display = "none";
  } else {
    //  user logged in
    if (addPost != null) {
      addPost.style.display = "inline";
    }

    // commentGroup.style.display = "block";

    navLogout.style.display = "inline";
    navUserDetails.style.display = "flex";
    navLogin.style.display = "none";
    navRegister.style.display = "none";

    let user = getCurrentUser();
    navUserName.innerHTML = user.username;
    //set default img if no img
    navUserImg.setAttribute(
      "src",
      typeof user.profile_image == "string"
        ? user.profile_image
        : "img/user/icons8-user-40.png"
    );
  }
}

function getCurrentUser() {
  let user = null;
  let localUser = JSON.parse(localStorage.getItem("user"));
  if (localUser != null) {
    user = localUser;
  }
  return user;
}

//! edit ui end

//!login logic
loginBtn.addEventListener("click", () => {
  login();
});

async function login() {
  const data = {
    username: recipientName.value.trim(),
    password: recipientPassword.value.trim(),
  };

  if (!data.username || !data.password) {
    showAlert("All fields are required.", "error");
    return;
  }

  try {
    loading.classList.replace("d-none", "d-flex");
    loginBtn.disabled = true;
    let res = await fetch(`${baseUrl}/login`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      let response = await res.json();
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      bootstrap.Modal.getInstance(document.getElementById("loginModal")).hide();
      // loginModal.hide();
      showAlert("logged in successfully", "success");
      setupUi();
    } else {
      let response = await res.json();
      showAlert(response.message, "error");
      console.log(response.message);
    }
  } catch (error) {
    console.error("Error during registration:", error);
  } finally {
    loading.classList.replace("d-flex", "d-none");
    loginBtn.disabled = false;
  }
}
//!end login logic

//!alert massage
function showAlert(str, msg) {
  const Toast = Swal.mixin({
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  Toast.fire({
    icon: msg,
    title: str,
  });
}

//! register logic
RegisterBtn.addEventListener("click", () => {
  register();
});

async function register() {
  const data = {
    name: registerName.value,
    username: registerUserName.value,
    password: registerPassword.value,
    image: registerImage.files[0],
  };

  if (!data.username || !data.password || !data.name || !data.image) {
    showAlert("All fields are required.", "error");
    console.log("All fields are required.");
    return;
  }

  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("username", data.username);
  formData.append("password", data.password);
  formData.append("image", data.image);

  try {
    loading.classList.replace("d-none", "d-flex");
    RegisterBtn.disabled = true;
    let res = await fetch(`${baseUrl}/register`, {
      method: "post",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });
    // Check if response is OK
    if (res.ok) {
      let response = await res.json();

      console.log(response);
      console.log(res);

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      bootstrap.Modal.getInstance(
        document.getElementById("registerModal")
      ).hide();

      // registerModal.hide();
      showAlert("Registered Successfully", "success");
      setupUi();
    } else {
      let response = await res.json();
      showAlert(response.message, "error");
      console.log(response.message);
    }
  } catch (error) {
    console.error("Error during registration:", error);
  } finally {
    loading.classList.replace("d-flex", "d-none");
    RegisterBtn.disabled = false;
  }
}
//! register logic end

//!logout  logic
navLogout.addEventListener("click", () => {
  logout();
});

function logout() {
  Swal.fire({
    title: "Are you sure?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Logout",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setupUi();
      showAlert("logged out successfully", "success");
    }
  });
}
//!logout  logic end
