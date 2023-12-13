            // Wait for the DOM to be fully loaded
            document.addEventListener('DOMContentLoaded', function() {
                // Check if the element exists
                var errorMessage = document.getElementById('error-message');
                if (errorMessage) {
                    // Set a timeout to hide the message after 3 seconds (3000 milliseconds)
                    setTimeout(function() {
                        errorMessage.style.display = 'none';
                    }, 3000);
                }
            });
