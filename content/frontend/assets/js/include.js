function loadComponent(id, file) {
  fetch(file)
    .then(response => response.text())
    .then(data => {
      const container = document.getElementById(id);
      // Insert the HTML
      container.innerHTML = data;

      // Execute any scripts that were part of the fetched HTML
      // (inserting via innerHTML doesn't run them).
      const scripts = Array.from(container.querySelectorAll('script'));
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        // Copy attributes
        for (let i = 0; i < oldScript.attributes.length; i++) {
          const attr = oldScript.attributes[i];
          newScript.setAttribute(attr.name, attr.value);
        }
        // Inline script: copy text
        if (oldScript.textContent) {
          newScript.textContent = oldScript.textContent;
        }
        // Replace the old script with the new one so it executes
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
        // Notify listeners that a component was loaded
        try {
          window.dispatchEvent(new CustomEvent('componentLoaded', { detail: { id } }));
        } catch (e) {
          // ignore if CustomEvent isn't supported
          var evt = document.createEvent('HTMLEvents');
          evt.initEvent('componentLoaded', true, false);
          evt.detail = { id: id };
          window.dispatchEvent(evt);
        }
    })
    .catch(error => console.error("Error loading component:", error));
}

document.addEventListener("DOMContentLoaded", function() {
    const currentPage = window.location.pathname.split("/").pop();

    document.querySelectorAll("nav a").forEach(link => {
        const linkPage = link.getAttribute("href").split("/").pop();

        if (linkPage === currentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
});