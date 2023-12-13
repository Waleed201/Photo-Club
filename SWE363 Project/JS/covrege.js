document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('addButton').addEventListener('click', function () {
        document.getElementById('fileInput').click();
    });

    document.getElementById('fileInput').addEventListener('change', function (event) {
        var files = event.target.files;
        if (files) {
            var gallery = document.getElementById('gallery');
            if (!gallery) {
                console.error('Gallery element not found!');
                return;
            }

            for (var i = 0; i < files.length; i++) {
                if (files[i].type.match('image.*')) { // Check if the file is an image
                    var reader = new FileReader();

                    reader.onload = (function (file) {
                        return function (e) {
                            var newPhotoDiv = document.createElement('div');
                            newPhotoDiv.className = 'photo';

                            var newImage = document.createElement('img');
                            newImage.src = e.target.result;
                            newImage.alt = file.name; // Use the file's name as the alt text

                            var iconsSpan = document.createElement('span');
                            iconsSpan.innerHTML = '<i class="bi bi-cloud-download"></i><i class="bi bi-eye"></i>';

                            newPhotoDiv.appendChild(newImage);
                            newPhotoDiv.appendChild(iconsSpan);
                            gallery.appendChild(newPhotoDiv);
                        };
                    })(files[i]);

                    reader.readAsDataURL(files[i]);
                }
            }
        }
    });
});
