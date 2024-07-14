document.addEventListener("DOMContentLoaded", () => {
  fetch('Kafka%E5%9F%BA%E7%A1%80%E6%A6%82%E5%BF%B5%E7%A7%91%E6%99%AE.md')
    .then(response => response.text())
    .then(text => {
      const content = document.getElementById('content');
      content.innerHTML = marked.parse(text);
    })
    .catch(error => {
      console.error('Error fetching the Markdown file:', error);
    });
});
