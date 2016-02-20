$(document).ready(function() {

  $('#show-menu').sidr({ side: 'right' });
  $("body > .container").click( function() {
    $.sidr('close');
  });


  $('.select-box').customSelect();


});


$(window).resize(function() {
  
});