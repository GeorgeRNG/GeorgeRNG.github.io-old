function init(){
document.getElementById("input-error").style.display = "none";}
function exportcode() {
    inputerror = document.getElementById("input-error");
    inputerror.style.display = "initial";
    inputerror.innerHTML = "Error: Export is disabled.";
}

function importcode(){
    httpGet("https://google.com")
    document.getElementById("raw-code-edit").innerHTML = document.getElementById("raw-code-area").value;
}

function httpGet(theUrl, data=null)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.setRequestHeader("Access-Control-Allow-Origin", "*")
    xmlHttp.send(data);
    return xmlHttp.responseText;
}
