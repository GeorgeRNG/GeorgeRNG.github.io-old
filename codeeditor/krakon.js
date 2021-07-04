function init(){
document.getElementById("input-error").style.display = "none";}
function exportcode() {
    data = compress(currentcode);
    document.getElementById("code-list").innerHTML = data
}

var data = ""
var selectedblock = 0

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
    document.getElementById("code-list").innerHTML = currentcode
}

function newblock(){
    x = document.getElementById("block-type").value
    console.log(x)
}

function rendblocks(){
    document.getElementById("code-list").innerHTML = ""
    JSON.parse(data)["blocks"].forEach((block, index) => {
        if(block["id"] == "block"){
            img = (imgelement("images/blocks/" + block["block"] + ".png", ["block"]));
            img.onclick = function(index){selectblock(index)};
            img.classList.add("block")
            img.id = "block-" + String(index);
            document.getElementById("code-list").appendChild(img);
        }
    });
}

function selectblock(index){
    var isat = Number(index.target.id.replace("block-",""))
    selectedblock = isat
    obj = JSON.parse(currentcode)["blocks"][isat]
    contents = document.createElement("div")
    x = document.createElement("p")
    x.innerHTML = "Block " + String(isat + 1) + ": " + obj["block"] + "\n"
    contents.appendChild(x)
    x = document.createElement("span")
    x.innerHTML = "Action: "
    contents.appendChild(x)
    x = document.createElement("input")
    x.type = "text"
    x.value = obj["action"]
    x.onchange = () => {console.log("bob")}
    contents.appendChild(x)
    document.getElementById("blockselect").innerHTML = ""
    document.getElementById("blockselect").appendChild(contents)
}

function imgelement(link, classes = []){
    img = document.createElement("img");
    img.src = link
    img.classList = classes
    return img
}
