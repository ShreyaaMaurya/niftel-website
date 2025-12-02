document.addEventListener("DOMContentLoaded", () => {

  // Load Header Automatically
  fetch("/main/base/header.html")
    .then(res => res.text())
    .then(data => {
      document.body.insertAdjacentHTML("afterbegin", data);
    })
    .catch(err => console.error("Header Load Error:", err));


  // Load Footer Automatically
  fetch("/main/base/footer.html")
    .then(res => res.text())
    .then(data => {
      document.body.insertAdjacentHTML("beforeend", data);
    })
    .catch(err => console.error("Footer Load Error:", err));

});
