

(function () {
    "use strict";
    const communityPhotos = [];

    // ---- Element references ----
    const uploadForm = document.getElementById("uploadForm");
    const uploadDropzone = document.getElementById("uploadDropzone");
    const uploadDropzonePlaceholder = document.getElementById("uploadDropzonePlaceholder");
    const uploadFileInput = document.getElementById("uploadFileInput");
    const uploadPreviewImage = document.getElementById("uploadPreviewImage");
    const uploadNameInput = document.getElementById("uploadNameInput");
    const uploadCaptionInput = document.getElementById("uploadCaptionInput");
    const uploadErrorMessage = document.getElementById("uploadErrorMessage");

    const communityGallery = document.getElementById("communityGallery");
    const communityEmptyMessage = document.getElementById("communityEmptyMessage");
    const communityPhotoCount = document.getElementById("communityPhotoCount");

    let selectedImageDataUrl = null;

    // ---- Upload: dropzone click / keyboard opens file picker ----
    uploadDropzone.addEventListener("click", () => uploadFileInput.click());
    uploadDropzone.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            uploadFileInput.click();
        }
    });

    // ---- Upload: drag-and-drop support ----
    ["dragenter", "dragover"].forEach((eventName) => {
        uploadDropzone.addEventListener(eventName, (event) => {
            event.preventDefault();
            uploadDropzone.classList.add("upload-dropzone-active");
        });
    });
    ["dragleave", "drop"].forEach((eventName) => {
        uploadDropzone.addEventListener(eventName, (event) => {
            event.preventDefault();
            uploadDropzone.classList.remove("upload-dropzone-active");
        });
    });
    uploadDropzone.addEventListener("drop", (event) => {
        const droppedFile = event.dataTransfer.files && event.dataTransfer.files[0];
        if (droppedFile) {
            uploadFileInput.files = event.dataTransfer.files;
            handleSelectedFile(droppedFile);
        }
    });

    uploadFileInput.addEventListener("change", () => {
        const chosenFile = uploadFileInput.files[0];
        if (chosenFile) handleSelectedFile(chosenFile);
    });

    function handleSelectedFile(file) {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = () => {
            selectedImageDataUrl = reader.result;
            uploadPreviewImage.src = selectedImageDataUrl;
            uploadPreviewImage.classList.remove("d-none");
            uploadDropzonePlaceholder.classList.add("d-none");
        };
        reader.readAsDataURL(file);
    }

    // ---- Upload: form submit ----
    uploadForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const authorName = uploadNameInput.value.trim();
        const caption = uploadCaptionInput.value.trim();

        if (!selectedImageDataUrl || !authorName || !caption) {
            uploadErrorMessage.classList.remove("d-none");
            return;
        }
        uploadErrorMessage.classList.add("d-none");

        const newPhoto = {
            id: "photo-" + Date.now(),
            imageDataUrl: selectedImageDataUrl,
            authorName,
            caption,
            likeCount: 0,
            isLikedByViewer: false,
            comments: [],
        };
        communityPhotos.unshift(newPhoto);
        renderCommunityGallery();
        resetUploadForm();
    });

    function resetUploadForm() {
        uploadForm.reset();
        selectedImageDataUrl = null;
        uploadPreviewImage.classList.add("d-none");
        uploadPreviewImage.src = "";
        uploadDropzonePlaceholder.classList.remove("d-none");
    }

    // ---- Gallery rendering ----
    function renderCommunityGallery() {
        communityGallery.innerHTML = "";

        communityPhotoCount.textContent =
            communityPhotos.length + (communityPhotos.length === 1 ? " photo" : " photos");

        if (communityPhotos.length === 0) {
            communityEmptyMessage.classList.remove("d-none");
            return;
        }
        communityEmptyMessage.classList.add("d-none");

        communityPhotos.forEach((photo) => {
            communityGallery.appendChild(buildPhotoCard(photo));
        });
    }

    function buildPhotoCard(photo) {
        const photoCard = document.createElement("article");
        photoCard.className = "photo-card";
        photoCard.dataset.photoId = photo.id;

        photoCard.innerHTML = `
            <div class="photo-card-image-wrap">
                <img class="photo-card-image" src="${photo.imageDataUrl}" alt="${escapeHtml(photo.caption)}">
            </div>
            <div class="photo-card-body">
                <div class="photo-card-meta">
                    <span class="photo-card-author">${escapeHtml(photo.authorName)}</span>
                    <span class="photo-card-caption">${escapeHtml(photo.caption)}</span>
                </div>
                <div class="photo-card-actions">
                    <button type="button" class="like-btn${photo.isLikedByViewer ? " like-btn-active" : ""}" aria-pressed="${photo.isLikedByViewer}">
                        <i class="fa-regular fa-heart like-icon"></i>
                        <span class="like-count">${photo.likeCount}</span>
                    </button>
                    <button type="button" class="comment-toggle-btn">
                        <i class="fa-regular fa-comment comment-icon"></i>
                        <span class="comment-count">${photo.comments.length}</span>
                    </button>
                </div>
                <div class="comment-section d-none">
                    <ul class="comment-list"></ul>
                    <form class="comment-form">
                        <input type="text" class="comment-input" placeholder="Add a comment..." maxlength="200">
                        <button type="submit" class="comment-submit-btn">Post</button>
                    </form>
                </div>
            </div>
        `;

        // Like button
        const likeButton = photoCard.querySelector(".like-btn");
        const likeCountLabel = photoCard.querySelector(".like-count");
        likeButton.addEventListener("click", () => {
            photo.isLikedByViewer = !photo.isLikedByViewer;
            photo.likeCount += photo.isLikedByViewer ? 1 : -1;
            likeButton.classList.toggle("like-btn-active", photo.isLikedByViewer);
            likeButton.setAttribute("aria-pressed", String(photo.isLikedByViewer));
            likeCountLabel.textContent = photo.likeCount;
        });

        // Comment toggle
        const commentToggleButton = photoCard.querySelector(".comment-toggle-btn");
        const commentSection = photoCard.querySelector(".comment-section");
        commentToggleButton.addEventListener("click", () => {
            commentSection.classList.toggle("d-none");
        });

        // Comment list + form
        const commentList = photoCard.querySelector(".comment-list");
        renderCommentList(commentList, photo);

        const commentForm = photoCard.querySelector(".comment-form");
        const commentInput = photoCard.querySelector(".comment-input");
        const commentCountLabel = photoCard.querySelector(".comment-count");

        commentForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const commentText = commentInput.value.trim();
            if (!commentText) return;

            photo.comments.push({ authorName: "Guest", text: commentText });
            renderCommentList(commentList, photo);
            commentCountLabel.textContent = photo.comments.length;
            commentInput.value = "";
        });

        return photoCard;
    }

    function renderCommentList(commentListElement, photo) {
        commentListElement.innerHTML = "";

        if (photo.comments.length === 0) {
            const emptyText = document.createElement("p");
            emptyText.className = "comment-empty-text";
            emptyText.textContent = "No comments yet.";
            commentListElement.appendChild(emptyText);
            return;
        }

        photo.comments.forEach((comment) => {
            const commentItem = document.createElement("li");
            commentItem.className = "comment-item";
            commentItem.innerHTML = `<span class="comment-author">${escapeHtml(comment.authorName)}:</span><span class="comment-text">${escapeHtml(comment.text)}</span>`;
            commentListElement.appendChild(commentItem);
        });
    }

    function escapeHtml(rawText) {
        const div = document.createElement("div");
        div.textContent = rawText;
        return div.innerHTML;
    }

    // Initial render (shows the empty state)
    renderCommunityGallery();
})();
