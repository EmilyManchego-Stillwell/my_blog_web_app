document.addEventListener("DOMContentLoaded", () => {
  // Check if deletion occurred
  const urlParams = new URLSearchParams(window.location.search);
  // Pop-up alert if it was deleted.
  if (urlParams.get("alert") === "blog-deleted") {
    alert("Your blog post has been sucessfully deleted!");
    history.replaceState(null, "", window.location.pathname);
  }

  const deleteButtons = document.querySelectorAll(".button-delete");

  deleteButtons.forEach(button => {
    button.addEventListener("click", handleDelete);
  });

  function handleDelete(event) {
    const confirmationMessage = confirm(`Are you sure you want to delete this blog`);

    if (!confirmationMessage) {
      event.preventDefault();
      alert("Your blog has not been deleted.");
    } 
  }
});