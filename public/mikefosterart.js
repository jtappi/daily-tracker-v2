document.addEventListener('DOMContentLoaded', () => {
// #####################
// The commented code below is what we want to enable eventually so that we can fetch images from the server.  
// It may need manipulation but until then we can just use the Status images array
// #####################

//    let images = [];

// // Function to fetch images from the server
// async function loadImages() {
//   try {
//     const response = await fetch('images/');
//     const text = await response.text();
    
//     // Create a temporary DOM element to parse the directory listing
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(text, 'text/html');
    
//     // Get all links that end with image extensions
//     const imageLinks = Array.from(doc.querySelectorAll('a'))
//       .filter(link => link.href.match(/\.(jpg|jpeg|png|gif)$/i))
//       .map(link => 'images/' + link.textContent.trim());
    
//     images = imageLinks;
//     renderGallery(currentPage);
//   } catch (error) {
//     console.error('Error loading images:', error);
//   }
// }

// // Call loadImages when the page loads
// loadImages();

    // Sample images from the 'images' folder
    const images = [
      'images/art7.jpg',
      'images/art13.jpg',
      'images/art20.jpg',
      'images/art37.jpg',
      'images/art49.jpg',
      'images/art63.jpg',
      'images/art83.jpg',
      'images/art88.jpg',
      'images/art90.jpg',
      'images/art96.jpg',
      'images/art97.jpg',
      'images/art103.jpg',
      'images/art105.jpg',
      'images/art113.jpg',
      'images/art124.jpg',
      'images/art129.jpg',
      'images/art131.jpg',
      'images/art143.jpg',
      'images/art147.jpg',
      'images/art155.jpg'
    ];

    const gallery = document.getElementById('gallery');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let currentPage = 1; 
    const pageSize = 6; // number of images to show per page (2 rows of 3)

    function renderGallery(page) {
      gallery.innerHTML = '';
      const startIndex = (page - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, images.length);
      for (let i = startIndex; i < endIndex; i++) {
        const img = document.createElement('img');
        img.src = images[i];
        img.loading = 'lazy';
        gallery.appendChild(img);
      }
    }

    function updatePage(page) {
      currentPage = page;
      renderGallery(currentPage);
    }

    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        updatePage(currentPage - 1);
      }
    });

    nextBtn.addEventListener('click', () => {
      if (currentPage * pageSize < images.length) {
        updatePage(currentPage + 1);
      }
    });

    // Initial load
    renderGallery(currentPage);
});