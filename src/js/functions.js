jQuery(document).ready(function ($) {
    $('#nav-toggle').on('click', function () {
        $('.overlay').toggleClass('open');
        $('#nav-toggle').toggleClass('open');
    });

    $('.close-menu').on('click', function () {
        $('.overlay').toggleClass('open');
        $('#nav-toggle').toggleClass('open');
    });
});
