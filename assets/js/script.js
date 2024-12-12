function toggleBio() {
  var media = window.matchMedia("(max-width: 779px)");
  const bioElement = document.querySelector('.bio');
  const container = document.querySelector('.container');
  bioElement.classList.toggle('active');
  if (isImageMode && media.matches) {
    switchMode();
  }
  if (container.style.transform = 'translateX(-100%)') {
    container.style.transform = "translateX(0)"
  }
}

let isImageMode = true;
let swiper;
// Then we set the value in the --vh custom property to the root of the document

function switchMode() {
  const images = document.querySelectorAll('.swiper-slide img');
  const contentItems = document.querySelectorAll('.content-item');
  const text = document.getElementById("text");
  const image = document.getElementById("image");
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);

  if (isImageMode) {
    text.style.textDecoration = "underline";
    image.style.textDecoration = "none";

    images.forEach(img => {
      img.style.transition = "filter 0.4s ease-in-out";
      img.style.filter = "opacity(50%) blur(10px)";
      img.style.zIndex = "1";
    });

    contentItems.forEach(content => {
      content.style.transition = "filter 0.4s ease-in-out";
      content.style.zIndex = "999";
      content.style.filter = "blur(0)";
      content.style.opacity = "1";
    });

    isImageMode = false;
  } else {
    text.style.textDecoration = "none";
    image.style.textDecoration = "underline";
    // Switch to Image Mode
    images.forEach(img => {
      img.style.filter = "opacity(1) blur(0)";
      img.style.zIndex = "999";
    });

    contentItems.forEach(content => {
      content.style.zIndex = "1";
      content.style.filter = "blur(3px)";
      content.style.opacity = "0.4";
    });

    isImageMode = true;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const menuDiv = document.querySelector('.menu');
  const contentDiv = document.querySelector('.content');
  const swiperWrapper = document.querySelector('.swiper-wrapper');
  const number = document.querySelector('.number');
  const container = document.querySelector('.container');
  const back = document.querySelector('.back');
  var media = window.matchMedia("(max-width: 779px)");

  media.addEventListener('change', () => {
    location.reload();
});


  function setupImageHover() {
    const Images = document.querySelectorAll('.swiper-slide img');
    const content = document.querySelector(".content-item")
    var mediaQuery = window.matchMedia("(min-width: 779px)");

    if (mediaQuery.matches) {
      Images.forEach(img => {
        img.style.transition = "filter 0.4s ease-in-out";
        img.style.filter = "opacity(50%) blur(10px)";

        img.addEventListener("mouseenter", () => {
          applyFocusStyles(img, content);
        });

        img.addEventListener("mouseleave", () => {
          removeFocusStyles(img, content);
        });
      });
    }

    function applyFocusStyles(img, content) {
      img.style.zIndex = "999";
      img.style.filter = "opacity(1) blur(0)";
      content.style.zIndex = "1";
    }

    function removeFocusStyles(img, content) {
      img.style.zIndex = "1";
      img.style.filter = "opacity(50%) blur(10px)";
      content.style.zIndex = "999";
    }
  }


  function setupSwiperAndNumber() {
    const swiperDivs = document.querySelectorAll('.swiper-slide');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(swiperDivs).indexOf(entry.target);
            number.textContent = `(${index + 1}.)`;
          }
        });
      },
      {
        root: document.querySelector('.swiper'),
        threshold: 1,
      }
    );

    if (swiper) {
      swiper.destroy(true, true); // Fully destroy the previous Swiper instance
    }

    swiperDivs.forEach((div) => observer.observe(div));

    // Reinitialize Swiper and assign it to the global `swiper` variable
    swiper = new Swiper('.swiper', {
      mousewheel: true,
      direction: 'vertical',
      slidesPerView: 1.5,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      loop: true,
      scrollbar: {
        el: '.swiper-scrollbar',
        draggable: true,
      },
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },
    });
  }


  function updateContent(item) {
    contentDiv.querySelector('.title p').textContent = item.title;
    contentDiv.querySelector('.date p').textContent = item.date;
    contentDiv.querySelector('.info p').textContent = item.info;

    swiperWrapper.innerHTML = ''; // Clear current slides

    const imagePromises = item.images.map(imageSrc => {
      return new Promise((resolve) => {
        const slideDiv = document.createElement('div');
        slideDiv.classList.add('swiper-slide');

        const img = document.createElement('img');
        img.src = imageSrc;
        img.onload = () => resolve(slideDiv);

        slideDiv.appendChild(img);
        swiperWrapper.appendChild(slideDiv);
      });
    });

    Promise.all(imagePromises).then(() => {
      setupImageHover();
      setupSwiperAndNumber();
    });
  }

  fetch('data.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      data.forEach((item, index) => {
        const menuItemDiv = document.createElement('div');
        menuItemDiv.classList.add('menu-item');
        menuItemDiv.textContent = item.menuItem;
        menuItemDiv.dataset.index = index;
        menuDiv.appendChild(menuItemDiv);
      });

      menuDiv.addEventListener('click', (event) => {
        if (media.matches) {
          container.style.transform = "translateX(-100%)";
          switchMode();
        }

        if (event.target.classList.contains('menu-item')) {
          // Remove underline from all menu items
          document.querySelectorAll('.menu-item').forEach(item => {
            item.style.textDecoration = "none";
          });

          // Add underline to the selected menu item
          event.target.style.textDecoration = "underline";

          const index = event.target.dataset.index;
          updateContent(data[index]);
        }

        isImageMode = true;
        switchMode();
      });

      updateContent(data[0]);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });

  back.style.zIndex = "999";
  back.addEventListener('click', () => {
    if (container.style.transform === "translateX(-100%)") {
      container.style.transform = "translateX(0)";
    }
  });
});
