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

$('.new_view').on('click', function(){
    drawView();
});

$('.clear_view').on('click', function(){
    clear();
});

$('#openFile').on('click', function(){
    $('#openFileDialog').click();
});

$('#openFileDialog').on('change', handleFileSelect);
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
    };
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
];

structure = [0,[1,2],3];


/**
 * All functions related to the STG Parser
 */

function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var byte_result = [];
    var text_result;

    // STG Array
    var stg_array = [];

    // Arrays for the model
    var items = [];
    var structure = [];

    reader = new FileReader();

    reader.onloadend = function () {
        text_result = reader.result;
        //http://stackoverflow.com/questions/3146483/html5-file-api-read-as-text-and-binary
        var aByte, byteStr;
        for (var n = 0; n < text_result.length; ++n) {
            aByte = text_result.charCodeAt(n);
            byteStr = aByte.toString(16);
            if (byteStr.length < 2) {
                byteStr = "0" + byteStr;
            }
            byte_result.push(byteStr);
        }

        //Parse the reader result to a string array
        stg_array = parseSTG(byte_result, text_result);
    };

    for (var i = 0, f; f = files[i]; i++) {
        if (/.stg/.test(f.name)) {
            //Take the first .stg file and parse it
            console.log('Successfully loaded the STG');
            //reader will invoke reader.onleadend when finished
            reader.readAsBinaryString(f);
        } else {
            console.log(f.name,' is not a supported file type</p>');
        }
    }

    //Show a list of read files
}

function parseSTG(byte_result, text_result) {
    /* This function takes the raw data of STG file which was read in - namely a byte array and plaintext of the file - and returns a stripped down string array with the STG-OPCODES and content of the STG cells */
    
    var ProcStart;
    var ProcName;
    var Index;
    var stg_array = [];

    //Match the procedure name
    var ValidStrings = text_result.match(/[a-zA-Z0-9_-]{2,}/g);
    ProcName = ValidStrings[2];
    console.log('Procedure Name: ' + ProcName);

    // Find the beginning of the Procedure
    for (var i = 0; i < byte_result.length; i++) {
        if (byte_result[i] == 02 && byte_result[i + 1] == 14) {
            Index = i + 2;
            break;
        }
    }

    //Fill the STG Array with data
    while (Index < byte_result.length) {
        if (byte_result[Index] == 06) {
            //function hex2dez(h) {return parseInt(h,16);}
            var length = parseInt(byte_result[Index + 1], 16);
            var tempString = '';
            for (i = Index + 2; i < Index + length + 2; i++) {
                tempString += text_result.charAt(i);
            }
            stg_array.push(tempString);
            Index += (length + 2);
        } else {
            Index++;
        }
    }
    console.log('Returning the array');
    console.log(stg_array.join(' .:. '));
    return stg_array;
}

function parse_structure(items, structure, stg_array){
    
}