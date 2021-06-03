function init(){
document.getElementById("input-error").style.display = "none";}
function exportcode() {
    inputerror = document.getElementById("input-error");
    inputerror.style.display = "initial";
    inputerror.innerHTML = "Error: Export is disabled.";
}