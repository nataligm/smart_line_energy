$(document).ready(function() {
    $(document).on("click", ".scroll-to-top", function (e) {
        e.preventDefault();
        $("html, body").animate({ scrollTop: 0 }, 1000);
    })
});
var burgerBtn = document.querySelector('.burger-btn');
var headerTop = document.querySelector('.header-top');

burgerBtn.addEventListener('click', crossFunction);
function crossFunction(){
    headerTop.classList.toggle("menu-open");
}