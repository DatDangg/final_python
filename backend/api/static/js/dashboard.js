function showContent(sectionId) {
    var sections = document.querySelectorAll('.content');
    sections.forEach(function(section) {
        section.classList.remove('active');
    });
    var activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
    }
}
