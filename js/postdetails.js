let postId;
setupUi();

function getQueryParameter() {
  // Example URL: http://xyz.com/postDetails.html?postId=35684
  const url = new URL(window.location.href); // Use `window.location.href` for the current page URL
  // Get query parameters
  const params = new URLSearchParams(url.search);
  // Retrieve specific parameters
  postId = params.get("postId"); // "35684"
  console.log(postId);
}
getQueryParameter();

async function getPost(id) {
  try {
    loading.classList.replace("d-none", "d-flex");
    let res = await fetch(`${baseUrl}/posts/${id}`);
    if (res.ok) {
      let response = await res.json();
      displayPost(response);
    } else {
      showAlert("Failed to load post", "error");
    }
  } catch (error) {
    showAlert("An error occurred while fetching posts.", "error");
    console.log(error);
  } finally {
    loading.classList.replace("d-flex", "d-none");
  }
}

function displayPost(response) {
  document.getElementById("userPostDetails").innerHTML = "";
  let temp = "";
  let commentContent = "";
  let post = response.data;
  let comments = post.comments;

  for (const comment of comments) {
    commentContent += `
                    <div class=" bg-body-secondary">
                  <div class="commentHead d-flex align-items-center">
                    <img src="${comment.author.profile_image}" alt="" class="rounded-circle border border-1 me-1" width="38px"
                      height="38px">
                    <b>${comment.author.username}</b>
                  </div>
                  <div class="commentBody">
                    <p class="text-muted ps-2 my-1">${comment.body}</p>
                    <hr class="my-0">
                  </div>
                </div>`;
  }

  temp = `            
            <div class="userPost mb-3 ">
              <h1>
                <span>${post.author.username}'s</span>
                Post
              </h1>
            </div>

            <div class="card shadow">
              <div class="card-header">
                <img src="${
                  typeof post.author.profile_image == "string"
                    ? post.author.profile_image
                    : "img/user/icons8-user-40.png"
                }" alt="icons8" class="rounded-circle border border-2 " width="48px"
                  height="48px">
                <span class="fw-bold mx-2">${post.author.username}</span>
              </div>
              <div class="card-body">
                <img src="${
                  typeof post.image == "string"
                    ? post.image
                    : "img/posts/pexels-mikebirdy-1.jpg"
                }" class="object-fit-contain w-100" alt="mercedes">
                <p class="card-text mt-1 text-body-secondary">${
                  post.created_at
                }</p>
                  <h5>${
                    post.title != null
                      ? post.title
                      : "Test Null header(no title)"
                  }</h5>
                  <p class="postBodyContent">${post.body}</p>
              </div>
              <div class=" card-footer text-body-secondary bg-transparent">
                <i class="fa-solid fa-comments"></i>
                  <span>
                    (${post.comments_count}) comments
                  </span>
              </div>
              
                <div id="comments" class="p-2">
                ${commentContent}
              </div>
              <div id="commentGroup" class="input-group px-1 mb-1">
                <input id="commentInput" type="text" class="commentInput form-control " placeholder="Add Your comment...">
                <button  class="btn btn-outline-info addComment">Send</button>
              </div>
            </div>
    `;
  document.getElementById("userPostDetails").innerHTML = temp;
}
//!add comment
document.getElementById("userPostDetails").addEventListener("click", (e) => {
  if (e.target.closest(".addComment")) {
    addComment();
  }
});

async function addComment() {
  let commentInput = document.getElementById("commentInput").value;
  if (!commentInput) {
    showAlert("All fields are required.", "error");
    return;
  }

  try {
    loading.classList.replace("d-none", "d-flex");
    let res = await fetch(`${baseUrl}/posts/${postId}/comments`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        body: commentInput,
      }),
    });
    if (res.ok) {
      getPost(postId);
      showAlert("Comment Added successfully!", "success");
    } else {
      let response = await res.json();

      showAlert(response.message || "Failed to create the comment.", "error");
    }
  } catch (error) {
    console.error("Error during registration:", error);
    showAlert("An error occurred while creating the comment.", "error");
  } finally {
    loading.classList.replace("d-flex", "d-none");
  }
}

getPost(postId);
