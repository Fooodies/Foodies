'use strict'
$('.hideforms').hide();
// hide and show the forms using jquery
$('#mainselect').on('change', function () {
    let selected = this.value;
    console.log(selected)
    $('.hideforms').hide();
    $(`.${selected}`).show();
})

