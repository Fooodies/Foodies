'use strict';

$('button').on('click',function (event){
    let id = $(this).attr('id');
    let whichButton = isNaN(parseInt(id)); 
    if(!whichButton){
    $(`#commentsSection${id}`).toggle();
    if($(`#${id}`).html() === 'view comments') {$(`#${id}`).html('hide comments')}
    else{ $(`#${id}`).html('view comments')}
}
else{
    event.preventDefault();
    let id = $(this).attr('id');
    let regex1 = /[0-9][0-9]?[0-9]?[0-9]?/g;
    let newId = id.match(regex1)
    let comment = $(`#addedComment${newId[0]}`).val();
    let name=$(`#addedname${newId[0]}`).val();
    $(`#allComments${newId[0]}`).append(`<div class='viewDiv'><h2>${name}</h2><h3>${comment}</h3></div>`)
    $(`#addedComment${newId[0]}`).val('');
    $(`#addedname${newId[0]}`).val('');

    fetch(`/community/${newId[0]}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({comment: comment,name:name})
    }).then(data=>{
        console.log('5')
    })
}
});



{/* <div id='viewDiv'>
<h2>
    <%= comments[`${item.id}`][i] %> 
</h2>
<h3>
    <%= comments[`${item.id}`][i+1]%>
</h3>
</div> */}