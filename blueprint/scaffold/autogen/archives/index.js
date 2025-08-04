document.addEventListener('DOMContentLoaded', function () {
    // Copy Link Button logic
    const copyLinkButton = document.getElementById('copyLinkButton');
    if (copyLinkButton) {
        copyLinkButton.addEventListener('click', function () {
            const currentUrl = window.location.href;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(currentUrl)
                    .then(() => showCopyFeedback())
                    .catch(err => {
                        console.error('Failed to copy: ', err);
                        alert('Failed to copy the link. Please try again or copy manually.');
                    });
            } else {
                // Fallback for older browsers
                const textArea = document.createElement("textarea");
                textArea.value = currentUrl;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    showCopyFeedback();
                } catch (err) {
                    console.error('Fallback: Failed to copy: ', err);
                    alert('Failed to copy the link. Your browser may not support automatic copying. Please copy manually: ' + currentUrl);
                } finally {
                    document.body.removeChild(textArea);
                }
            }
        });
    }

    function showCopyFeedback() {
        const feedbackDiv = document.getElementById('copyFeedback');
        if (feedbackDiv) {
            feedbackDiv.classList.add('show');
            setTimeout(() => {
                feedbackDiv.classList.remove('show');
            }, 2000);
        }
    }

    // Search input logic
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            // Implement search/filter logic here
            console.log('Search input changed:', this.value);
        });
    }

    // Filter dropdown logic
    const filterDropdown = document.getElementById('filterDropdown');
    if (filterDropdown) {
        filterDropdown.addEventListener('change', function () {
            // Implement filter logic here
            console.log('Filter selected:', this.value);
        });
    }
});