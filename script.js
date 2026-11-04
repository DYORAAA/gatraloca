
// FUNGSI MEMBACA FOTO
function readFiles(files, callback) {
  [...files].forEach(file => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();

    reader.onload = event => {
      callback(event.target.result);
    };

    reader.readAsDataURL(file);
  });
}

// FOTO UTAMA ANGKATAN
const heroUpload = document.getElementById("heroUpload");

heroUpload.addEventListener("change", event => {
  readFiles(event.target.files, src => {
    const image = document.getElementById("heroImage");

    image.src = src;
    image.hidden = false;

    document.getElementById("heroPlaceholder").style.display = "none";
  });
});

// GALERI DOKUMENTASI JURUSAN
const modal = document.getElementById("galleryModal");

document.getElementById("closeModal").addEventListener("click", () => {
  modal.classList.remove("open");
});

modal.addEventListener("click", event => {
  if (event.target === modal) {
    modal.classList.remove("open");
  }
});

document.querySelectorAll(".class-card").forEach(card => {

  const photos = [];

  const input = card.querySelector('input[type="file"]');
  const image = card.querySelector(".card-image img");

  input.addEventListener("change", event => {

    readFiles(event.target.files, src => {
      photos.push(src);

      if (image.hidden) {
        image.src = src;
        image.hidden = false;
      }
    });

    input.value = "";
  });

  card.querySelector(".view-gallery").addEventListener("click", () => {

    const title = card.querySelector("h3").textContent;

    document.getElementById("modalTitle").textContent =
      title + " — Dokumentasi";

    const gallery = document.getElementById("modalGallery");

    gallery.innerHTML = "";

    if (photos.length > 0) {

      photos.forEach(src => {
        const img = document.createElement("img");

        img.src = src;
        img.alt = "Foto dokumentasi jurusan";

        gallery.appendChild(img);
      });

    } else {
      gallery.textContent = "Belum ada foto dokumentasi.";
    }

    modal.classList.add("open");
  });

});

// FOTO DOKUMENTASI FILM
const filmInput = document.getElementById("filmPhotos");
const filmGallery = document.getElementById("filmGallery");

filmInput.addEventListener("change", event => {

  readFiles(event.target.files, src => {
    const img = document.createElement("img");

    img.src = src;
    img.alt = "Dokumentasi film angkatan";

    filmGallery.appendChild(img);
  });

  filmInput.value = "";
});

// LINK FILM ANGKATAN
const filmLink = document.getElementById("filmLink");
const watchFilm = document.getElementById("watchFilm");

filmLink.addEventListener("input", () => {

  const url = filmLink.value.trim();

  if (/^https?:\/\//i.test(url)) {
    watchFilm.href = url;
    watchFilm.style.opacity = "1";
  } else {
    watchFilm.href = "#";
    watchFilm.style.opacity = ".5";
  }

});

watchFilm.addEventListener("click", event => {

  if (!/^https?:\/\//i.test(filmLink.value.trim())) {
    event.preventDefault();

    alert("Masukkan link film terlebih dahulu!");
  }

});

// FOTO FLASHMOB
const flashUpload = document.getElementById("flashUpload");

flashUpload.addEventListener("change", event => {

  readFiles(event.target.files, src => {

    const tile = document.createElement("div");
    tile.className = "flash-tile";

    const img = document.createElement("img");

    img.src = src;
    img.alt = "Dokumentasi flashmob";

    tile.appendChild(img);

    document.getElementById("flashGrid").appendChild(tile);

  });

  flashUpload.value = "";

});

// MENU NAVIGASI HP
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("show");
  });
});
