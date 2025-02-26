const gallery = document.getElementById('gallery');

const artworks = [
    { title: '4', src: '/images/art4.jpg' },
    { title: '5', src: '/images/art5.jpg' },
    { title: '6', src: '/images/art6.jpg' },
    { title: '7', src: '/images/art7.jpg' },
    { title: '8', src: '/images/art8.jpg' },
    { title: '9', src: '/images/art9.jpg' },
    { title: '10', src: '/images/art10.jpg' },
    { title: '11', src: '/images/art11.jpg' },
    { title: '12', src: '/images/art12.jpg' },
    { title: '13', src: '/images/art13.jpg' },
    { title: '14', src: '/images/art14.jpg' },
    { title: '15', src: '/images/art15.jpg' },
    { title: '16', src: '/images/art16.jpg' },
    { title: '17', src: '/images/art17.jpg' },
    { title: '18', src: '/images/art18.jpg' },
    { title: '19', src: '/images/art19.jpg' },
    { title: '20', src: '/images/art20.jpg' },
    { title: '21', src: '/images/art21.jpg' },
    { title: '22', src: '/images/art22.jpg' },
    { title: '23', src: '/images/art23.jpg' },
    { title: '24', src: '/images/art24.jpg' },
    { title: '25', src: '/images/art25.jpg' },
    { title: '26', src: '/images/art26.jpg' },
    { title: '27', src: '/images/art27.jpg' },
    { title: '28', src: '/images/art28.jpg' },
    { title: '29', src: '/images/art29.jpg' },
    { title: '30', src: '/images/art30.jpg' },
    { title: '31', src: '/images/art31.jpg' },
    { title: '32', src: '/images/art32.jpg' },
    { title: '33', src: '/images/art33.jpg' },
    { title: '34', src: '/images/art34.jpg' },
    { title: '35', src: '/images/art35.jpg' },
    { title: '36', src: '/images/art36.jpg' },
    { title: '37', src: '/images/art37.jpg' },
    { title: '38', src: '/images/art38.jpg' },
    { title: '39', src: '/images/art39.jpg' },
    { title: '40', src: '/images/art40.jpg' },
    { title: '41', src: '/images/art41.jpg' },
    { title: '42', src: '/images/art42.jpg' },
    { title: '43', src: '/images/art43.jpg' },
    { title: '44', src: '/images/art44.jpg' },
    { title: '45', src: '/images/art45.jpg' },
    { title: '46', src: '/images/art46.jpg' },
    { title: '47', src: '/images/art47.jpg' },
    { title: '48', src: '/images/art48.jpg' },
    { title: '49', src: '/images/art49.jpg' },
    { title: '50', src: '/images/art50.jpg' },
    { title: '51', src: '/images/art51.jpg' },
    { title: '52', src: '/images/art52.jpg' },
    { title: '53', src: '/images/art53.jpg' },
    { title: '54', src: '/images/art54.jpg' },
    { title: '55', src: '/images/art55.jpg' },
    { title: '56', src: '/images/art56.jpg' },
    { title: '57', src: '/images/art57.jpg' },
    { title: '58', src: '/images/art58.jpg' },
    { title: '59', src: '/images/art59.jpg' },
    { title: '60', src: '/images/art60.jpg' },
    { title: '61', src: '/images/art61.jpg' },
    { title: '62', src: '/images/art62.jpg' },
    { title: '63', src: '/images/art63.jpg' },
    { title: '64', src: '/images/art64.jpg' },
    { title: '65', src: '/images/art65.jpg' },
    { title: '66', src: '/images/art66.jpg' },
    { title: '67', src: '/images/art67.jpg' },
    { title: '68', src: '/images/art68.jpg' },
    { title: '69', src: '/images/art69.jpg' },
    { title: '70', src: '/images/art70.jpg' },
    { title: '71', src: '/images/art71.jpg' },
    { title: '72', src: '/images/art72.jpg' },
    { title: '73', src: '/images/art73.jpg' },
    { title: '74', src: '/images/art74.jpg' },
    { title: '75', src: '/images/art75.jpg' },
    { title: '76', src: '/images/art76.jpg' },
    { title: '77', src: '/images/art77.jpg' },
    { title: '78', src: '/images/art78.jpg' },
    { title: '79', src: '/images/art79.jpg' },
    { title: '80', src: '/images/art80.jpg' },
    { title: '81', src: '/images/art81.jpg' },
    { title: '82', src: '/images/art82.jpg' },
    { title: '83', src: '/images/art83.jpg' },
    { title: '84', src: '/images/art84.jpg' },
    { title: '85', src: '/images/art85.jpg' },
    { title: '86', src: '/images/art86.jpg' },
    { title: '87', src: '/images/art87.jpg' },
    { title: '88', src: '/images/art88.jpg' },
    { title: '89', src: '/images/art89.jpg' },
    { title: '90', src: '/images/art90.jpg' },
    { title: '91', src: '/images/art91.jpg' },
    { title: '92', src: '/images/art92.jpg' },
    { title: '93', src: '/images/art93.jpg' },
    { title: '94', src: '/images/art94.jpg' },
    { title: '95', src: '/images/art95.jpg' },
    { title: '96', src: '/images/art96.jpg' },
    { title: '97', src: '/images/art97.jpg' },
    { title: '98', src: '/images/art98.jpg' },
    { title: '99', src: '/images/art99.jpg' },
    { title: '100', src: '/images/art100.jpg' },
    { title: '101', src: '/images/art101.jpg' },
    { title: '102', src: '/images/art102.jpg' },
    { title: '103', src: '/images/art103.jpg' },
    { title: '104', src: '/images/art104.jpg' },
    { title: '105', src: '/images/art105.jpg' },
    { title: '106', src: '/images/art106.jpg' },
    { title: '107', src: '/images/art107.jpg' },
    { title: '108', src: '/images/art108.jpg' },
    { title: '109', src: '/images/art109.jpg' },
    { title: '110', src: '/images/art110.jpg' },
    { title: '111', src: '/images/art111.jpg' },
    { title: '112', src: '/images/art112.jpg' },
    { title: '113', src: '/images/art113.jpg' },
    { title: '114', src: '/images/art114.jpg' },
    { title: '115', src: '/images/art115.jpg' },
    { title: '116', src: '/images/art116.jpg' },
    { title: '117', src: '/images/art117.jpg' },
    { title: '118', src: '/images/art118.jpg' },
    { title: '119', src: '/images/art119.jpg' },
    { title: '120', src: '/images/art120.jpg' },
    { title: '121', src: '/images/art121.jpg' },
    { title: '122', src: '/images/art122.jpg' },
    { title: '123', src: '/images/art123.jpg' },
    { title: '124', src: '/images/art124.jpg' },
    { title: '125', src: '/images/art125.jpg' },
    { title: '126', src: '/images/art126.jpg' },
    { title: '127', src: '/images/art127.jpg' },
    { title: '128', src: '/images/art128.jpg' },
    { title: '129', src: '/images/art129.jpg' },
    { title: '130', src: '/images/art130.jpg' },
    { title: '131', src: '/images/art131.jpg' },
    { title: '132', src: '/images/art132.jpg' },
    { title: '133', src: '/images/art133.jpg' },
    { title: '134', src: '/images/art134.jpg' },
    { title: '135', src: '/images/art135.jpg' },
    { title: '136', src: '/images/art136.jpg' },
    { title: '137', src: '/images/art137.jpg' },
    { title: '138', src: '/images/art138.jpg' },
    { title: '139', src: '/images/art139.jpg' },
    { title: '140', src: '/images/art140.jpg' },
    { title: '141', src: '/images/art141.jpg' },
    { title: '142', src: '/images/art142.jpg' },
    { title: '143', src: '/images/art143.jpg' },
    { title: '144', src: '/images/art144.jpg' },
    { title: '145', src: '/images/art145.jpg' },
    { title: '146', src: '/images/art146.jpg' },
    { title: '147', src: '/images/art147.jpg' },
    { title: '148', src: '/images/art148.jpg' },
    { title: '149', src: '/images/art149.jpg' },
    { title: '150', src: '/images/art150.jpg' },
    { title: '151', src: '/images/art151.jpg' },
    { title: '152', src: '/images/art152.jpg' },
    { title: '153', src: '/images/art153.jpg' },
    { title: '154', src: '/images/art154.jpg' },
    { title: '155', src: '/images/art155.jpg' },
    { title: '156', src: '/images/art156.jpg' },
    { title: '157', src: '/images/art157.jpg' },
    { title: '158', src: '/images/art158.jpg' },
    { title: '159', src: '/images/art159.jpg' },
    { title: '160', src: '/images/art160.jpg' },
    { title: '161', src: '/images/art161.jpg' },
    { title: '162', src: '/images/art162.jpg' },
    { title: '163', src: '/images/art163.jpg' },
    { title: '164', src: '/images/art164.jpg' },
    { title: '165', src: '/images/art165.jpg' },
    { title: '166', src: '/images/art166.jpg' },
    { title: '167', src: '/images/art167.jpg' },
    { title: '168', src: '/images/art168.jpg' },
    { title: '169', src: '/images/art169.jpg' },
    { title: '170', src: '/images/art170.jpg' },
    { title: '171', src: '/images/art171.jpg' },
    { title: '172', src: '/images/art172.jpg' },
    { title: '173', src: '/images/art173.jpg' }
];

// artworks.forEach(art => {
//     const section = document.createElement('section');
//     section.style = `background-image: url('${art.src}'); background-size: cover; background-position: center; opacity: 0.75;`;
    
//     const div = document.createElement('div');
//     div.className = 'artwork-info';
//     div.innerHTML = `<h3>${art.title}</h3>`;
    
//     section.appendChild(div);
//     gallery.appendChild(section);
// });

artworks.forEach(art => {
    const section = document.createElement('section');
    section.style = `background-image: url('${art.src}'); background-size: cover; background-position: center; opacity: 0.75;`;
    
    const div = document.createElement('div');
    div.className = 'artwork-info';
    div.innerHTML = `<h5>${art.title}</h5>`;
    
    // Add click handler to open modal
    section.addEventListener('click', () => {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        modalImg.src = art.src;
        modal.style.display = 'block';
    });
    
    section.appendChild(div);
    gallery.appendChild(section);
});

// Add close button functionality
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('imageModal').style.display = 'none';
});

// Close modal when clicking outside the image
document.getElementById('imageModal').addEventListener('click', (e) => {
    if (e.target.id === 'imageModal') {
        document.getElementById('imageModal').style.display = 'none';
    }
});