function init(){
document.getElementById("input-error").style.display = "none";}
function exportcode() {
    /*inputerror = document.getElementById("input-error");
    inputerror.style.display = "initial";
    inputerror.innerHTML = "Error: Export is disabled.";*/
    data = compress(document.getElementById("raw-code-edit").innerHTML);
    alert(data);
}

function importcode(){
    try{
        data = decompress(document.getElementById("raw-code-area").value);
        document.getElementById("raw-code-edit").innerHTML = data;
    }
    catch(err){
        inputerror = document.getElementById("input-error");
        inputerror.style.display = "initial";
        inputerror.innerHTML = "Error: Import failed.";
    }
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
    textbox = document.getElementById("raw-code-edit").innerHTML;
    textbox = JSON.stringify(JSON.parse(textbox),null,'\t');
    document.getElementById("raw-code-edit").innerHTML = textbox
}