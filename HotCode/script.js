document.getElementById('postButton').addEventListener('click', function() {
    const content = document.getElementById('postContent').value;
    if (content) {
        createPost(content);
        document.getElementById('postContent').value = '';
    }
});

function createPost(content) {
    const postTemplate = document.getElementById('postTemplate');
    const newPost = postTemplate.cloneNode(true);
    newPost.id = '';
    newPost.querySelector('.post-content').textContent = content;
    newPost.querySelector('.like-button').addEventListener('click', function() {
        alert('Liked!');
    });
    newPost.querySelector('.comment-button').addEventListener('click', function() {
        const comment = prompt('Enter your comment:');
        if (comment) {
            addComment(newPost, comment);
        }
    });
    document.querySelector('.posts').appendChild(newPost);
}

function addComment(postElement, comment) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.textContent = comment;
    postElement.querySelector('.comments-section').appendChild(commentElement);
}
