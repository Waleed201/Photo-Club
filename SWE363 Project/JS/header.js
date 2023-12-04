// Create header content
const headerContent = `
    <img src="./photo-club-icon.ico" alt="KFUPM Photo club icon">
    <span>
        <h1>KFUPM</h1>
        <h2>PHOTOCLUB</h2>
    </span>
    <svg id="menuIcon" xmlns="http://www.w3.org/2000/svg" width="46" height="38" viewBox="0 0 46 38" fill="none">
        <rect x="6" y="6" width="35" height="6" rx="3" fill="#E8E8E8" />
        <rect x="6" y="16" width="35" height="6" rx="3" fill="#E8E8E8" />
        <rect x="6" y="26" width="35" height="6" rx="3" fill="#E8E8E8" />
    </svg>
    <div class="menu" id="dropdownMenu">
        <i id="xIcon" class="bi bi-x-circle-fill"></i>
        <i class="bi bi-person-circle"></i>
        <a href="#">Home</a>
        <a href="#">Events</a>
        <a href="#">News</a>
        <a href="#">About Photo Club</a>
        <a href="#">Join Photo Club</a>
    </div>
`;

// Get the header element
const headerElement = document.querySelector('header');

// Append the generated content to the header
headerElement.innerHTML = headerContent;

// Add event listeners (assuming you have a function toggleMenu defined)
document.getElementById('menuIcon').addEventListener('click', toggleMenu);
document.getElementById('xIcon').addEventListener('click', toggleMenu);

// Function to toggle the menu (you can customize this)
function toggleMenu() {
    const menu = document.getElementById('dropdownMenu');
    menu.classList.toggle('fade-in');
}

