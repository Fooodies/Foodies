'use strict';

$('button').on('click',function (event){
    let id = $(this).attr('id');
    let whichButton = isNaN(parseInt(id)); 
    if(!whichButton){
    $(`#commentsSection${id}`).toggle();
    if($(`#${id}`).html() === 'Show comments') {$(`#${id}`).html('hide comments')}
    else{ $(`#${id}`).html('Show comments')}
}
else{
    event.preventDefault();
    let id = $(this).attr('id');
    let regex1 = /[0-9][0-9]?[0-9]?[0-9]?/g;
    let newId = id.match(regex1)
    let comment = $(`#addedComment${newId[0]}`).val();
    $(`#addedComment${newId[0]}`).val('');
    $(`#allComments${newId[0]}`).append(`<div>${comment}</div>`)
    fetch(`/community/${newId[0]}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({comment: comment})
    }).then(data=>{
        console.log('5')
    })
}
});