//Global blank data array
items = [];

/*
*   1.GUI Core functions
*/

/**
 * @description Takes a STG Array as input and calculates the Maximum Numbers of parallel columns (the maximum width)
 * @param {STG Array} array
 * @returns {Number} -1 = Fail; >0 Max Columns
 */
function findMaxColumns(array){
    var columns = -1;
    if (array.constructor === Array){
        var num_grpend = 0;
        columns = 1;
        var temp_columns = 1;
        for (var i = 0; i < array.length; i++){
            if (array[i].class === "stgr_if"){
                temp_columns+=1;
                num_grpend+=2;
            }
            if (array[i].class === "stgr_while"||array[i].class === "stgr_repeat"||array[i].class === "stgr_switch"){
                num_grpend++;
            }
            if (array[i].class === "stgr_case"){
                temp_columns++;
                num_grpend++;
            }
            if (array[i].class === "stgr_grpend"){
                num_grpend--;
            }
            if (num_grpend===0){
                if (temp_columns>columns) columns=temp_columns;
                temp_columns = 1;
            }
        }
    }
    else {
        console.log("Passed the wrong type of variable");
    }
    return columns;
}

/**
 * @description This function searches for the closing grpend of the object determined by the passed index. If no valid object is found at the passed index it takes the next valid object that follows
 * @param {Integer} indexObj
 * @returns {Integer} Returns the index of the closing grpend
 */
function findEnd(indexObj){
    var end = -1;
    if (typeof indexObj === "number" && indexObj > -1){
        //check if the passed index parses to a valid object
        while (["stgr_if","stgr_while","stgr_repeat","stgr_switch"].indexOf(items[indexObj].class)===-1 || indexObj>items.length){
            indexObj++;
        }
        var num_grpend = 0;
        for (var i = indexObj; i < items.length; i++){
            switch (items[i].class){
                case "stgr_if":
                    num_grpend+=2;
                    break;
                case "stgr_case":
                    num_grpend++;
                    break;
                case "stgr_while":
                    num_grpend++;
                    break;
                case "stgr_repeat":
                    num_grpend++;
                    break;
                case "stgr_grpend":
                    num_grpend--;
                    break;
            }
            if (items[i].class === "stgr_switch"&&items[i+1].class === "stgr_empty"){
                //it's an empty switch, so break the for on the next iteration and set the end-index to the "stgr_empty" object
                end = i+1;
                i = items.length;
            }
            if (num_grpend === 0){
                end = i;
                i = items.length;
            }
        }
    }
    else {
        console.log("Please pass a valid index");
    }
    return end;
}

function drawView(){
    /*
     * This function deletes the display and rebuilds it
     */
    $(".panel-title").html(items[0].text);
    $('#content').empty();
    // https://en.wikipedia.org/wiki/%3F%3a
    // The ternary operator treats 0 as false and everything <0 as true
    checkStructure()?console.log("Structure Clearing failed"):console.log("Structure is clear");
    populate(items);
    console.log("Maximum Columns: " + findMaxColumns(items));
    registerEventhandler();
}

/**
 * @description Loops through an array of Objects and generates nested HTML divs in the content class
 * @param {Array|JSON Objects} items
 * @returns {undefined}
 */
function populate(items){
    var parent = ["content"];
    // Debug: Log items array
    var out = [];
    for (var i in items){
        out.push('{class: "'+items[i].class+'", text: "'+items[i].text+'"},');
    }
    console.log(out.join(""));
    console.log("Populating...");
    //loop through objects in items and populate the view
    for (var i in items){
        var item = items[i];
        item.id = i;
        //if sequence append to last element of parent array
        if (item.class === "stgr_seq") {
        	if (item.class.indexOf("stgr_content") > -1) {
        		item.contenteditable = "true";
        	};
            $('#'+parent.last()).append($("<div/>", item));
        //if grpend then pop the last element of the parent array
        }else if (item.class === "stgr_grpend") {
            parent.pop();
        //if it's nested deeper e.x after a while type then push the id of the while element to the parent array
        }else if (["stgr_while","stgr_if","stgr_repeat","stgr_case", "stgr_sub"].indexOf(item.class) !== -1) {
            $('#'+parent.last()).append($("<div/>", item));
            parent.push(item.id);
        };
    }
    console.log("Populate done");
}

function clear(){
    items = [];
    drawView();
}

function registerEventhandler(){
    $('[contenteditable="true"]').blur(function(){
        console.log("edited!");
        changeText($(this).attr('id'),$(this).html());
    });
}

function enableItemAddition(type){
    //#TODO implemented handler only for stgr_seq since we don't know yet which types/classes will be eligible to get stuff appended to
    $('.stgr_seq').on('click', function (){
        console.log("add "+type+" after "+$(this).attr('id'));
        addItem(type, +$(this).attr('id'));
        drawView();
    });
}

/**
*   1.1 Menu Click-Eventhandler
*/
$('.addItem').on('click', function(){
    //register event handler for each div eligible to get another div appended to
    enableItemAddition(this.id);
});

$('.new_view').on('click', function(){
    //Load the item-array with dummy data
    items = [
    {
        text:"Hardcoded Datastructure until we can import from file",
        class:"stgr_seq stgr_content"
    },{
        text:"only sequences for the beginning",
        class:"stgr_if"
    },{
        text:"let's do an initial commit",
        class:"stgr_seq stgr_content"
    },{
        text:"enough dummy data now",
        class:"stgr_grpend"
    },
    {
        text:"on root lvl",
        class:"stgr_seq"
    }
    ];
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
/**
 * 
 * @param {string} message
 * @param {type} type
 * @returns {undefined}
 */
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

/**
 * @description Changes the text of the specified item
 * @param {integer} id
 * @param {string} text
 * @returns {undefined}
 */
function changeText (id, text) {
    items[id].text = text;
    drawView();
}

/**
* @syntax addItem(type, index)
* @description Adds a new Struktugrammer Object at the specified index
* @description Valid types are: stgr_seq, stgr_while, stgr_repeat, stgr_sub, stgr_if, stgr_switch, stgr_grpend, stgr_empty, stgr_case
* 
* @param {string} type Type of the structure to be generated
* @param {integer} index Index at which the new structure will be inserted
* 
* @return The index of the generated structure
*/
function addItem(type, index){
    if (typeof index !== "number"){
        index = parseInt(index);
    }
    console.log("Add Item");
    if (typeof index === "undefined" || index > items.length){
        index = items.length;
    }
    //add new item at the end of array
    var insert = [];
    switch (type){
        case "stgr_seq":
            insert = [{class:"stgr_seq",text:"Test"}
                     ];
            break;
            
        case "stgr_if":
            insert = [{class:"stgr_if",text:"Cond"},
                      {class:"stgr_empty",text:""},
                      {class:"stgr_grpend",text:""},
                      {class:"stgr_empty",text:""},
                      {class:"stgr_grpend",text:""}
                     ];
            break;
        
        case "strg_while":
            insert = [{class:"stgr_while",text:""},
                      {class:"stgr_empty",text:""},
                      {class:"stgr_grpend",text:""}
                     ];
            break;
            
        case "strg_repeat":
            insert = [{class:"stgr_repeat",text:""},
                      {class:"stgr_empty",text:""},
                      {class:"stgr_grpend",text:""}
                     ];
            break;
            
        case "strg_switch":
            insert = [{class:"stgr_switch",text:""},
                      {class:"stgr_case",text:""},
                      {class:"stgr_empty",text:""},
                      {class:"stgr_grpend",text:""},
                      {class:"stgr_grpend",text:""}
                     ];
            break;
            
        case "strg_case":
            insert = [{class:"stgr_case",text:""},
                      {class:"stgr_empty",text:""},
                      {class:"stgr_grpend",text:""}
                     ];
            break;    
            
        case "strg_sub":
            insert = [{class:"stgr_seq",text:""}
                     ];
            break;
        
        default:
            insert = [{class:"stgr_empty",text:""}];
            break;
    }
    //nifty way to merge arrays at specific index
    Array.prototype.splice.apply(items, [index+1,0].concat(insert));
    //return its index
    return (index);
}

/**
*   3. Extend JS Language to our needs. #Bend to my will Java Script! 
*/
//if the browser's javascript engine doesn't support the Array.last() function (which in fact is the case for every modern browser)
if (!Array.prototype.last){
    //then we add it ourselves :-3
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};

/*
 * All functions related to the STG Parser
 * #TODO: exclude in separate Library?
 */

/**
 * 
 * @param {Event} evt
 * @returns {Integer} 
 */
function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var byte_result = [];
    var text_result;

    // STG Array
    var stg_array = [];

    // Arrays for the model

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
        //ensure items is empty
        items = [];
        stg_array = parseSTG(byte_result, text_result);
        if (parse_structure(stg_array) === 0){
            console.log("Parsing succesfull");
            drawView();
        }
        else {
            console.log("Parsing failed");
        }
             
    };

    for (var i = 0, file; file = files[i]; i++) {
        if (/.stg/.test(file.name)) {
            //Take the first .stg file and parse it
            console.log('Successfully loaded the STG');
            //reader will invoke reader.onleadend when finished
            reader.readAsBinaryString(file);
        } else {
            console.log(file.name,' is not a supported file type</p>');
        }
    }
    return 0;
}

/**
 * @description This function takes the raw data of STG file which was read in - namely a byte array and plaintext of the file - and returns a stripped down string array with the STG-OPCODES and content of the STG cells
 * @param {Array|String} byte_result
 * @param {Array|String} text_result
 * @returns {Array|parseSTG.parseArray}
 */
function parseSTG(byte_result, text_result) {    
    var parseArray = [];
    if (byte_result.constructor === Array && typeof text_result === "string"){
        var ProcStart;
        var ProcName;
        var Index = 0;

        //Match the procedure name
        var ValidStrings = text_result.match(/[a-zA-Z0-9_-]{2,}/g);
        ProcName = ValidStrings[2];
        items[0] = {class:"Procedure Name",text:ProcName};

        // Find the beginning of the Procedure
        for (var i = 0; i < byte_result.length; i++) {
            if (byte_result[i] === 02 && byte_result[i + 1] === 14) {
                Index = i + 2;
                break;
            }
        }

        //Fill the STG Array with data
        while (Index < byte_result.length) {
            if (byte_result[Index] === "06") {
                //function hex2dez(h) {return parseInt(h,16);}
                var length = parseInt(byte_result[Index + 1], 16);
                var tempString = '';
                for (i = Index + 2; i < Index + length + 2; i++) {
                    tempString += text_result.charAt(i);
                }
                parseArray.push(tempString);
                Index += (length + 2);
            } else {
                Index++;
            }
        }
    }
    else {
        console.log("Passed the wrong type as parameters!");
        //return an empty array
    }
    return parseArray;
}

/**
 * @syntax parse_structure(array[string1, string2, ...])
 * @description parse_structure takes a stg string array as input and parses it to objects which it inserts into items
 * 
 * @param {array} stg_array An array of strings
 */
function parse_structure(stg_array){
    var state = 1;
    //Begin on index 3, because we don't need the Info before
    for (var i=3; i < stg_array.length; i++){
        switch (stg_array[i]){
            case "OT_STGRSEQ":
                items.splice(items.length, 0, {class:"stgr_seq", text: stg_array[i+1]});
                i+=1;
                break;
                
            case "OT_STGRSUB":
                items.splice(items.length, 0, {class:"stgr_sub", text: stg_array[i+1]});
                i+=1;
                break;
            
            case "OT_STGRIF":
                items.splice(items.length, 0, {class:"stgr_if",text:stg_array[i+1]});
                i+=1;
                break;
            
            case "OT_STGRWHILE":
                items.splice(items.length, 0, {class:"stgr_while",text:stg_array[i+1]});
                i+=1;
                break;
            
            case "GRPEND":
                items.splice(items.length, 0, {class:"stgr_grpend",text:""});
                break;
                
            case "OT_STGRREPEAT":
                items.splice(items.length, 0, {class:"stgr_repeat",text:stg_array[i+1]});
                i+=1;
                break;
            
            case "OT_STGRCASE":
                items.splice(items.length, 0, {class:"stgr_switch",text:stg_array[i+1]});
                i+=1;
                break;
                
            default:
                items.splice(items.length, 0, {class:"stgr_case",text:stg_array[i]});
                break;
            
        }
        if (i === stg_array.length -1){
            state = 0;
        }
    }
    return state;
}

/**
 * @description Loops through the items Array and checks if some empty structures need to be inserted (for example between a stgr_case and a stgr_grpend object)
 * @description Returns 0 on success, -1 on fail, and -2 on error
 * @returns {Integer}
 */
function checkStructure(){
    var errorState = -1;
    try {
        for (var i = 0; i < items.length; i++){
            if (items[i].type==="stgr_while"||items[i].type==="stgr_if"||items[i].type==="stgr_repeat"||items[i].type==="stgr_case"){
                if (items[i+1].type==="stgr_grpend"){    
                    items.splice(items.length, 0, {class:"stgr_empty", text: ""});
                    i+=1;
                }
            }
        };
        errorState = 0;
    }
    catch (err){
        console.log("Error while trying to tidy up the structur: " + err.message);
        errorState = -2;
    }
    return errorState;
}