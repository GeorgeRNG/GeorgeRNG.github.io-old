function init(){
document.getElementById("input-error").style.display = "none";}
function exportcode() {
    /*inputerror = document.getElementById("input-error");
    inputerror.style.display = "initial";
    inputerror.innerHTML = "Error: Export is disabled.";*/
    data = compress(currentcode);
    //document.getElementById("raw-code-area").value = data
    //false changes don't go brrr..
    alert(data);
}

var data = ""


function savecode(x){
    //Cookies.set("code", x.value)
    //later doesn't work atm
}

function importcode(){
    try{
        data = decompress(document.getElementById("raw-code-area").value);
        document.getElementById("raw-code-edit").value = data;
        currentcode = data
        rendblocks();
    }
    catch(err){
        errorbox("Import failed. Error Code: " + String(err))
    }
}

function errorbox(text){
    inputerror = document.getElementById("input-error");
    inputerror.style.display = "initial";
    inputerror.innerHTML = ("Error: " + text + "<br/>Click this message to remove it.");
}

function decompress(b64Data){
    var strData = atob(b64Data);
    var charData = strData.split('').map(function(x){return x.charCodeAt(0);});
    var binData = new Uint8Array(charData);
    var data = pako.inflate(binData);
    var strData = String.fromCharCode.apply(null, new Uint16Array(data));
    return(strData);
}


function compress(codedata){
    data = pako.gzip(codedata);
    data = String.fromCharCode.apply(null, new Uint16Array(data));
    compressData = btoa(data);
    return compressData;
}

function prettycode(){
    textbox = document.getElementById("raw-code-edit").value;
    textbox = JSON.stringify(JSON.parse(textbox),null,'\t');
    document.getElementById("raw-code-edit").value = textbox
    currentcode = textbox
}

function newblock(){
    x = document.getElementById("block-type").value
    console.log(x)
}

function rendblocks(){
    const nochest = ["event"];
    JSON.parse(data)["blocks"].forEach((block, index) => {
        if(block["id"] == "block"){
            element = document.createElement("div");
            element.id = "block-" + String(index);
            element.classList.add("block")
            element.onclick = function(index){selectblock(index)};
            img = document.createElement("img")
            img.scr = ("/images/blocks/" + block["block"] + ".png");
            element.appendChild(img)
            console.log(element)
            document.getElementById("code-list").appendChild(element);
        }
    });
}

function selectblock(index){
    console.log(index)
}