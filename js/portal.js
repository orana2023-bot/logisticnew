/* portal.js - SATTAR EXIM LLP Portal Logic */

document.addEventListener('DOMContentLoaded', () => {
    const sectionHeaders = document.querySelectorAll('.section-header');
    const navLinks = document.querySelectorAll('.nav-link');
    const portalFrame = document.getElementById('portal-frame');
    const loadingOverlay = document.getElementById('loading-overlay');

    // --- Sidebar Section Toggling ---
    sectionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isOpen = content.classList.contains('open');

            // Optional: Close other sections (Accordion style)
            // document.querySelectorAll('.section-content').forEach(c => c.classList.remove('open'));

            if (isOpen) {
                content.classList.remove('open');
            } else {
                content.classList.add('open');
            }
        });
    });

    // --- Navigation Logic ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const url = link.getAttribute('data-url');
            const tab = link.getAttribute('data-tab');
            
            // Handle Active state
            navLinks.forEach(nl => nl.classList.remove('active'));
            link.classList.add('active');

            // Open the parent section if it's closed
            const parentContent = link.closest('.section-content');
            if (parentContent && !parentContent.classList.contains('open')) {
                parentContent.classList.add('open');
            }

            // Construct target URL with fragment or query param for tab
            const targetUrl = `${url}?portal=true&tab=${tab}`;
            
            // Show loader and update iframe
            showLoader();
            portalFrame.src = targetUrl;
        });
    });

    // --- Iframe Loading Management ---
    portalFrame.addEventListener('load', () => {
        hideLoader();
        
        // Inject CSS into iframe to hide its own sidebar
        try {
            const iframeDoc = portalFrame.contentDocument || portalFrame.contentWindow.document;
            const style = iframeDoc.createElement('style');
            style.textContent = `
                /* Hide sidebar and back links when inside portal iframe */
                .sidebar, .sidebar-footer, .back-link, .exit-link { 
                    display: none !important; 
                }
                .hub-container {
                    display: block !important; /* Remove flex which was used for sidebar */
                }
                .main-workspace {
                    width: 100% !important;
                    height: 100vh !important;
                    overflow-y: auto !important;
                }
                /* Optional: Hide header if we want a shared header in portal later */
                /* .master-header { display: none !important; } */
            `;
            iframeDoc.head.appendChild(style);

            // Handle internal tab switching if the page uses data-tab
            const urlParams = new URLSearchParams(portalFrame.contentWindow.location.search);
            const targetTab = urlParams.get('tab');
            if (targetTab) {
                // Many of our pages use similar logic with .nav-item[data-tab="..."]
                const tabElement = iframeDoc.querySelector(`.nav-item[data-tab="${targetTab}"]`);
                if (tabElement) {
                    tabElement.click();
                }
            }

        } catch (e) {
            console.warn("Could not inject style into iframe - likely cross-origin or same-origin policy issue.", e);
        }
    });

    function showLoader() {
        loadingOverlay.style.display = 'flex';
    }

    function hideLoader() {
        loadingOverlay.style.display = 'none';
    }

    // --- Mobile Sidebar Toggle & Overlay Interaction ---
    const mobileToggle = document.getElementById('mobile-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
            overlay.classList.toggle('active');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
        });
    }

    // Auto-close sidebar on mobile when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('mobile-open');
                overlay.classList.remove('active');
            }
        });
    });
});
