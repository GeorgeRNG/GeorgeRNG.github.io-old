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
        document.getElementById("encodedoutput").value = (btoa(String.fromCharCode.apply(null, new Uint16Array(pako.gzip(code)))));
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
    document.getElementById("rawdecoded").value = code
    document.getElementById("code-list").innerHTML = ""
    JSON.parse(code)["blocks"].forEach((block, index) => {
        if(block["id"] == "block"){
            img = (imgelement("images/normal/" + block["block"] + ".png", ["block"]));
            img.onclick = function(index){selectblock(index)};
            img.classList.add("block")
            img.id = "block-" + String(index);
            document.getElementById("code-list").appendChild(img);
        }
        if(block["id"] == "bracket"){
            if(block["type"] == "repeat"){
                img = (imgelement("images/brackets/" + block["direct"] + "s.png", ["block"]));
                img.onclick = function(index){selectblock(index)};
                img.classList.add("block")
                img.id = "block-" + String(index);
                document.getElementById("code-list").appendChild(img);
            }
            if(block["type"] == "norm"){
                img = (imgelement("images/brackets/" + block["direct"] + ".png", ["block"]));
                img.onclick = function(index){selectblock(index)};
                img.classList.add("block")
                img.id = "block-" + String(index);
                document.getElementById("code-list").appendChild(img);
            }
        }
        
    });
}

function selectblock(clickedobj){
    document.getElementById("blockinfo").innerHTML = ""
    selected = Number(clickedobj.target.id.replace("block-",""))
    var final = document.createElement("div")
    p = document.createElement("span")
    p.innerHTML = "Block " + String(selected)
    final.appendChild(p)
    var parsed = JSON.parse(code)
    var block = parsed["blocks"][selected]
    if(block["id"] == "block"){
        var input = document.createElement("span")
        input.innerHTML = "<br/>Action:"
        final.appendChild(input)
        var input = document.createElement("input")
        input.value = block["action"]
        input.id = "action"
        input.onchange = () => {
            var x = parsed
            x["blocks"][selected]["action"] = document.getElementById("action").value
            code = JSON.stringify(x);
            rendblocks()
        }
        final.appendChild(input)
        var input = document.createElement("span")
        input.innerHTML = "<br/>Selection:"
        final.appendChild(input)
        var input = document.createElement("input")
        input.id = "target"
        if(block["target"] != undefined)
            {input.value = block["target"]}
        input.onchange = () => {
                var x = parsed
                x["blocks"][selected]["target"] = document.getElementById("target").value
                code = JSON.stringify(x);
                rendblocks()
            }
        final.appendChild(input)
        var input = document.createElement("span")
        input.innerHTML = "<br/>NOT:"
        final.appendChild(input)
        var input = document.createElement("input")
        input.id = "inverted"
        if(block["inverted"] != undefined)
            {input.value = block["inverted"]}
        input.onchange = () => {
                var x = parsed
                x["blocks"][selected]["inverted"] = document.getElementById("inverted").value
                code = JSON.stringify(x);
                rendblocks()
            }
        final.appendChild(input)
    }
    if(block["id"] == "bracket"){
        final.appendChild(document.createElement("br"))
        var input = document.createElement("select")
        input.innerHTML = `<option value="open">Opening Bracket</option><option value="close">Closed Bracket</option>`
        final.appendChild(input)
        final.appendChild(document.createElement("br"))
        var input = document.createElement("input")
        input.type = "checkbox"
        input.id = "sticky"
        input.onclick = () => {console.log(document.getElementById("sticky").checked);}
        final.appendChild(input)
        var input = document.createElement("label")
        input.innerHTML = "Sticky"
        input.for = "sticky"
        final.appendChild(input)
    }
    document.getElementById("blockinfo").appendChild(final)
}

function imgelement(link, classes = []){
    img = document.createElement("img");
    img.src = link
    img.classList = classes
    return img
}

function copy() {
    var copyText = document.getElementById("encodedoutput");
    document.getElementById("encodedoutput").disabled = 0
    copyText.select();
    copyText.setSelectionRange(0, 999999);
    document.execCommand("copy");
    document.getElementById("encodedoutput").disabled = "disabled"
    alert("It should now be on your clipboard!\n")
  } 