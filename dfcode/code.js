code = ""

function err(text,type=""){
    document.getElementById("errorbox").style.display = "initial";
    document.getElementById("error").innerHTML = text
    if(type != ""){
        document.getElementById("errortype").innerHTML = type + " Error:"
    }else{
        document.getElementById("errortype").innerHTML = "Error:"
    }
}

function importcode(){
    try{
        var decoded = String.fromCharCode.apply(null, new Uint16Array(pako.inflate(atob(document.getElementById("encodedinput").value).split('').map(function(x){return x.charCodeAt(0);}))));
        code = decoded
        rendblocks()
    }catch(er){
        err(er,"Import")
    }
}
function exportcode(){
    try{
        document.getElementById("encodedoutput").innerHTML = (btoa(String.fromCharCode.apply(null, new Uint16Array(pako.gzip(code)))));
    }catch(er){err(er)}
}
function prettycode(){
    try{
        code = JSON.stringify(JSON.parse(code),null,'\t')
    }catch(er){
        err(er)
    }
    rendblocks()
}

function rendblocks(){
    document.getElementById("rawdecoded").innerHTML = code
}

function imgelement(link, classes = []){
    img = document.createElement("img");
    img.src = link
    img.classList = classes
    return img
}

function rendblocks(){
    document.getElementById("rawdecoded").value = code
    document.getElementById("code-list").innerHTML = ""
    JSON.parse(code)["blocks"].forEach((block, index) => {
        if(block["id"] == "block"){
            img = (imgelement("images/blocks/" + block["block"] + ".png", ["block"]));
            img.onclick = function(index){selectblock(index)};
            img.classList.add("block")
            img.id = "block-" + String(index);
            document.getElementById("code-list").appendChild(img);
        }
    });
}