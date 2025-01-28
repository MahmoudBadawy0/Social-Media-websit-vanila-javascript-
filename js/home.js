const CreatePostBtn = document.getElementById("CreatePostBtn");
const postTitle = document.getElementById("postTitle");
const postBody = document.getElementById("postBody");
const postImage = document.getElementById("postImage");

const PostModal = new bootstrap.Modal(document.getElementById("PostModal"));

let current_page = 1;
let last_page = 1;

//!display posts logic
async function getPosts(append = true, pageNum = 1) {
  try {
    loading.classList.replace("d-none", "d-flex");
    let res = await fetch(`${baseUrl}/posts?page=${pageNum}`);
    if (res.ok) {
      let response = await res.json();
      last_page = response.meta.last_page;
      console.log(response);
      console.log(response.data);
      displayPosts(response, append);
    } else {
      showAlert("Failed to load posts", "error");
    }
  } catch (error) {
    showAlert("An error occurred while fetching posts.", "error");
    console.log(error);
  } finally {
    loading.classList.replace("d-flex", "d-none");
  }
}

function displayPosts(response, append) {
  if (append) {
    document.getElementById("posts").innerHTML = "";
  }
  let temp = "";
  for (const post of response.data) {
    temp += `<div class="col-8">
            <div class="post ">
              <div  data-postId="${post.id}"  class="card shadow pointCursor">
                <div class="card-header">
                  <img src="${
                    typeof post.author.profile_image == "string"
                      ? post.author.profile_image
                      : "img/user/icons8-user-40.png"
                  }" alt="icons8" class="rounded-circle border border-2 " width="48px" height="48px">
                  <span class="fw-bold mx-2">${post.author.username}</span>
                  <button id="editPostBtn" class="editPostBtn sh btn  float-end ${
                    getCurrentUser() != null &&
                    post.author.id == getCurrentUser().id
                      ? "d-flex"
                      : "d-none"
                  }  ">
                  <i class=" fa fa-edit fs-3 text-secondary p-2" aria-hidden="true"></i>
                  </button>

                    <button id="delPostBtn" class="delPostBtn sh  btn  float-end ${
                      getCurrentUser() != null &&
                      post.author.id == getCurrentUser().id
                        ? "d-flex"
                        : "d-none"
                    }  ">
                    <i class="fa fa-trash fs-3 text-danger p-2" aria-hidden="true"></i>
                  </button>
                </div>
                <div class="card-body">
                  <img src="${
                    typeof post.image == "string"
                      ? post.image
                      : "img/posts/pexels-mikebirdy-1.jpg"
                  }" class="object-fit-contain w-100" alt="mercedes"  >
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

                  <span id="posts-tag-${post.id}" class="ms-2">
                  
                  </span>
                </div>
              </div>
            </div>
          </div>
    `;
    let postTag = "";
    for (const tag of post.tags) {
      postTag += `
                  <button class="btn btn-sm border rounded-pill bg-secondary text-white" >
                    ${tag.name}
                  </button>
      `;
      let postsId = `posts-tag-${post.id}`;
      document.getElementById(postsId).innerHTML += postTag;
    }
  }

  document.getElementById("posts").innerHTML += temp;
}
//!End display posts logic

//!create Post
//const addPost = document.getElementById("addPost");

CreatePostBtn.addEventListener("click", () => {
  CreatePost();
});

async function CreatePost() {
  let postIdEdit = document.getElementById("post-id-input").value;
  let isCreate = postIdEdit === null || postIdEdit === "";

  const data = {
    title: postTitle.value,
    body: postBody.value,
    image: postImage.files[0],
  };

  if (!data.title || !data.body || !data.image) {
    showAlert("All fields are required.", "error");
    return;
  }

  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("body", data.body);
  formData.append("image", data.image);

  try {
    loading.classList.replace("d-none", "d-flex");
    CreatePostBtn.disabled = true;
    let res = "";
    if (isCreate) {
      // create post
      res = await fetch(`${baseUrl}/posts`, {
        method: "post",
        headers: {
          authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
        body: formData,
      });
      showAlert("Post created successfully!", "success");
    } else {
      //edit post
      //(special case ) this special for this api because it made by Laravel(PHP)
      // and it doesn't support put method in api so we use post method and we send _method=put in body to tell the api that we want to update the post not create new one
      formData.append("_method", "put");
      res = await fetch(`${baseUrl}/posts/${postIdEdit}`, {
        method: "post",
        headers: {
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
      showAlert("Post updated successfully!", "success");
    }

    if (res.ok) {
      // if you want start again from page 1 to .... after add post
      current_page = 1;
      await getPosts();
      PostModal.hide();
    } else {
      let response = await res.json();
      showAlert(response.message || "Failed to create the post.", "error");
    }
  } catch (error) {
    console.error("Error during registration:", error);
    showAlert("An error occurred while creating the post.", "error");
  } finally {
    loading.classList.replace("d-flex", "d-none");
    CreatePostBtn.disabled = false;
  }
}
//!create Post end

//! (edit post)
document.getElementById("posts").addEventListener(
  "click",
  (e) => {
    if (e.target.closest(".editPostBtn")) {
      //prevent click to bubble to(.card)  to prevent go to next page
      e.stopPropagation();
      // get post to send it to fun to get data from it
      let post = e.target.closest(".card");
      editPostBtn(post);
    }
  },
  true
);

function editPostBtn(post) {
  PostModal.toggle();
  document.getElementById("PostModalTitle").innerHTML = "Edit Post";
  CreatePostBtn.innerHTML = "Update";
  let postHeadEdit = post.querySelector(".card-body h5")?.textContent.trim();
  let postBodyEdit = post
    .querySelector(".card-body .postBodyContent")
    ?.textContent.trim();
  postTitle.value = postHeadEdit;
  postBody.value = postBodyEdit;
  document.getElementById("post-id-input").value = `${post.dataset.postid}`;
  console.log(post);
}
//! (edit post end)

//! btn modal to (create new post)
function addBtnClick() {
  PostModal.toggle();
  document.getElementById("PostModalTitle").innerHTML = "Create A New Post";
  CreatePostBtn.innerHTML = "Create";
  document.getElementById("post-id-input").value = "";
  postTitle.value = "";
  postBody.value = "";
}
//! btn modal to (create new post end)
//
//
//
//

//!delete post
document.getElementById("posts").addEventListener(
  "click",
  (e) => {
    if (e.target.closest("#delPostBtn")) {
      //prevent click to bubble to(.card)  to prevent go to next page
      e.stopPropagation();
      // get post to send it to fun to get data from it
      let post = e.target.closest(".card");
      confirmDeletePost(post);
    }
  },
  true
);

function confirmDeletePost(post) {
  Swal.fire({
    title: "Are you sure?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes,Delete",
  }).then((result) => {
    if (result.isConfirmed) {
      deletePost(post);
    }
  });
}

async function deletePost(post) {
  let postId = post.dataset.postid;
  try {
    loading.classList.replace("d-none", "d-flex");
    let res = await fetch(`${baseUrl}/posts/${postId}`, {
      method: "delete",
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (res.ok) {
      await getPosts();
      showAlert("Post deleted successfully!", "success");
    } else {
      let response = await res.json();
      showAlert(response.message || "Failed to delete the post.", "error");
    }
  } catch (error) {
    console.error("Error during registration:", error);
    showAlert("An error occurred while deleting the post.", "error");
  } finally {
    loading.classList.replace("d-flex", "d-none");
  }
}

//! delete post end

//!Pagination -> infinite scroll
window.addEventListener("scroll", async function () {
  const endOfPage =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
  if (endOfPage && current_page < last_page) {
    current_page++;
    await getPosts(false, current_page);
  }
});

/* if you user (.card) directly  -> document.querySelector(".card")
you are trying to add an event listener to {dynamically} created cards (or their elements),
but you are doing so before those elements are added to the DOM. Specifically, 
the document.getElementById() or similar methods won't find the target because 
the DOM hasn't yet been updated with the new items.
*/

/*solving it -> 
You attach the event listener to a parent element that already exists in the DOM. 
This allows events to "bubble up" from the dynamically created child elements.
*/

//! move to post clicked details
document.getElementById("posts").addEventListener("click", (e) => {
  if (e.target.closest(".card")) {
    // Ensure the clicked element is within a card ==> {class-> card}

    // get id of post to send to use it to display post in next page
    let postId = e.target.closest(".card").dataset.postid;
    postClick(postId);
  }
});

function postClick(postId) {
  window.location.href = `postDetails.html?postId=${postId}`;
}

//
//

// todo remove value from inputs after finish (new post , register , login)
const clearInputs = (...inputs) => {
  inputs.forEach((input) => (input.value = ""));
};

getPosts();
setupUi();
