function init(){
document.getElementById("input-error").style.display = "none";}
function exportcode() {
    /*inputerror = document.getElementById("input-error");
    inputerror.style.display = "initial";
    inputerror.innerHTML = "Error: Export is disabled.";*/
    data = compress(document.getElementById("raw-code-edit").innerHTML);
    console.log(data);
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
// Get some base64 encoded binary data from the server. Imagine we got this:
//var b64Data     = 'H4sIAAAAAAAAAwXB2w0AEBAEwFbWl2Y0IW4jQmziPNo3k6TuGK0Tj/ESVRs6yzkuHRnGIqPB92qzhg8yp62UMAAAAA==';
// Decode base64 (convert ascii to binary)
var strData     = atob(b64Data);
// Convert binary string to character-number array
var charData    = strData.split('').map(function(x){return x.charCodeAt(0);});
// Turn number array into byte-array
var binData     = new Uint8Array(charData);
// Pako magic
var data        = pako.inflate(binData);
console.log(data)
// Convert gunzipped byteArray back to ascii string:
var strData     = String.fromCharCode.apply(null, new Uint16Array(data));
// Output to console
//let strData = pako.gzip(b64Data, {to: 'string'});
return(strData);
}


function compress(codedata){
    data = pako.gzip(codedata);
    data = String.fromCharCode.apply(null, new Uint16Array(data));
    compressData = btoa(data);
    return compressData;
}