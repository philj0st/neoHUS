/**
*   1.GUI Core functions
*/
function drawView(){
    $('#content').empty();
    populate(structure);
}

//if nested level needs to be known for further development we could add a counter
function populate(structure){

    for (var item in structure) {
        if ($.isArray(structure[item])) {
            //if it's an array go deeper
            populate(structure[item]);
        }else{
            //local variable lifetime: Local variables are deleted when the function is completed. does it count for else{}?
            //add it's index as id property
            var obj = items[structure[item]];
            obj.id = structure[item];
            $('#content').append($("<div/>", obj));
        }
    };
}

function clear(){
    items = [];
    structure = [];
    drawView();
}

/**
*   1.1 Menu Click-Eventhandler
*/
$('.addItem').on('click', function(){
    addStructure(2, addItem($(this).attr('id')), structure);
});

/**
*   1.2 Other GUI
*/

//alert
// types = {success, warning, info, danger}
function displayAlert(message, type) {
    $('<div/>', {
        "class": "alert alert-" + type,
            "role": "alert"
    }).appendTo('#alertBox');
    $('.alert').html('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + message + '</div>');
}

/**
*   2. Model manipulation
*/

/*
*   returns index of added object
*/
function addItem(type){
    //add new item at the end of array
    items[items.length] = {
        "text":"",
        "type":type
    }
    //return its index
    return (items.length -1);
}

/*
*   returns true if added successful
*/
function addStructure(predecessor, idToAdd, structure){
    for (var i = 0; i < structure.length; i++) {
        if (structure[i] == predecessor) {
            //add idToAdd after predecessor
            structure.splice(predecessor+1,0,idToAdd);
            return true;
        }else if ($.isArray(structure[i])) {
            addStructure(predecessor, idToAdd, structure[i]);
        };
    };
    return false;
}

//data structure
items = [
    {
        "text":"Hardcoded Datastructure until we can import from file",
        "type":"sequence"
    },{
        "text":"only sequences for the beginning",
        "type":"sequence"
    },{
        "text":"let's do an initial commit",
        "type":"sequence"
    },{
        "text":"enough dummy data now",
        "type":"sequence"
    }
]

structure = [0,[1,2],3];