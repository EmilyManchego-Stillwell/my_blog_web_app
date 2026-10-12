document.querySelector(".button-edit").addEventListener("click", editClick);

const editButton = document.getElementsByClassName("button-edit");
const editContainer = document.getElementById("blog-edit-container");

function editClick () {
  if (editButton) {
    editContainer.style.visibility = "visible";
  } else {
  console.error(`Element with ID "${editContainer}" not found.`);
  }
} 