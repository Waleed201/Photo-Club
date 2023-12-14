// When the document is fully loaded, execute the following function.
$(document).ready(() => {
    fetchFile(); // Call the fetchFile function.
});

// Defines the fetchFile function.
function fetchFile() {
    // Send an AJAX GET request to the '/files' URL.
    $.ajax({
        url: '/files', // URL to fetch files from.
        method: 'GET', // HTTP method used.
        success: function(data) { // Function to call when request is successful.
            $('#fileTableBody').empty(); // Clear any existing content in the file table body.
            data.forEach((file) => { // Iterate over each file in the data array.
                const imageURL = file.url; // Store the URL of the file.
                const isImage = /\.(jpg|jpeg|png|gif)$/i.test(file.name); // Check if the file is an image.
                var encodedFileName = encodeURIComponent(file.name); // Encode the file name for URL usage.
                var imageTd = isImage ? "<td><img src='" + imageURL + "' style='max-width: 100px; max-height: 100px;'></td>" : "<td>Not an image</td>"; // Create an image element or a 'Not an image' text based on file type.
                var row = 
                    "<tr>" +
                    "<td class=imageName>" + file.name + "</td>" + // Display file name.
                    imageTd + // Display image preview or 'Not an image' text.
                    "<td>" +
                    "<a href='/files/" + encodedFileName + "/download' class='btn btn-primary download-button'>Download</a>" + // Add a download button.
                    "<button class='btn btn-danger delete-button' data-name='" + encodedFileName + "'>Delete</button>" + // Add a delete button.
                    "</td>" +
                    "</tr>";
                $('#fileTableBody').append(row); // Append the row to the table body.
            });
            attachDownloadHandlers(); // Attach event handlers to download buttons.
            attachDeleteHandlers(); // Attach event handlers to delete buttons.
        },
        error: function(xhr, status, error) { // Function to call when request fails.
            console.error("Error fetching files: " + error); // Log error to console.
        }
    });
}

// Defines the attachDownloadHandlers function.
function attachDownloadHandlers() {
    // Attach a click event listener to all elements with the 'download-button' class.
    $('.download-button').click(function(e) {
        e.preventDefault() // Prevent default action of the click event.
        var downloadUrl = $(this).attr('href'); // Get the URL from the href attribute of the clicked element.
        downloadFile(downloadUrl); // Call the downloadFile function with the URL.
    });
}

// Defines the downloadFile function.
function downloadFile(url) {
    var link = document.createElement("a"); // Create a new anchor element.
    link.href = url; // Set the href attribute of the anchor to the download URL.
    link.setAttribute("download", ""); // Set the download attribute to initiate a download when clicked.
    document.body.appendChild(link); // Add the anchor to the body of the document.
    link.click(); // Programmatically click the anchor to start the download.
    document.body.removeChild(link); // Remove the anchor from the document body.
}

// Defines the attachDeleteHandlers function.
function attachDeleteHandlers() {
    // Attach a click event listener to all elements with the 'delete-button' class.
    $('.delete-button').click(function() {
        var fileName = $(this).data('name'); // Get the file name stored in the data-name attribute.
        if(confirm("Are you sure you want to delete the file " + fileName + "?")){ // Show a confirmation dialog.
            deleteFile(fileName) // If confirmed, call the deleteFile function with the file name.
        }
    });
}

// Defines the deleteFile function.
function deleteFile(fileName) {
    // Send an AJAX DELETE request to the '/files/[fileName]' URL.
    $.ajax({
        url: '/files/' + fileName, // URL to send the delete request to.
        method: 'DELETE', // HTTP method used.
        success: function() { // Function to call when request is successful.
            fetchFile(); // Refresh the file list.
        },
        error: function(error) { // Function to call when request fails.
            console.error("Error deleting file: " + error); // Log error to console.
        }
    });
}
