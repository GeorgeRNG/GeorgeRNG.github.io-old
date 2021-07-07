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
        img = document.createElement("img");
        if(block["id"] == "block"){
            img.src = "images/normal/" + block["block"] + ".png"}
        if(block["id"] == "bracket"){
            img.src = "images/brackets/" + block["direct"]
            if(block["type"] == "repeat"){img.src = img.src + "s.png"}else{img.src = img.src + ".png"}
        }
        img.classList = ["block"]
        img.onclick = function(index){selectblock(index)};
        img.classList.add("block")
        img.id = "block-" + String(index);
        img.draggable = false
        img.ondragstart = () => {return false}
        document.getElementById("code-list").appendChild(img);
    })
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
        input.innerHTML = '<option value="open">Opening Bracket</option><option value="close">Closing Bracket</option>'
        input.value = parsed["blocks"][selected]["direct"]
        input.id = "direct"
        input.onchange = () => {
            var x = parsed
            x["blocks"][selected]["direct"] = document.getElementById("direct").value
            code = JSON.stringify(x);
            rendblocks()
        }
        final.appendChild(input)
        final.appendChild(document.createElement("br"))
        var input = document.createElement("input")
        input.type = "checkbox"
        if(parsed["blocks"][selected]["type"] == "repeat"){
            input.checked = true
        }
        input.id = "sticky"
        input.onclick = () => {
            var x = parsed
                x["blocks"][selected]["type"] = document.getElementById("sticky").checked ?  "repeat" : "norm"
                code = JSON.stringify(x);
                rendblocks()}
        final.appendChild(input)
        var input = document.createElement("label")
        input.innerHTML = "Sticky"
        input.for = "sticky"
        final.appendChild(input)
    }
    document.getElementById("blockinfo").appendChild(final)
}

function selectblock(clickedobj){
    var selected = Number(clickedobj.target.id.replace("block-",""))
    document.getElementById("blockinfo").innerHTML = "<p>Block " + selected + "</p>"
    var parsed = JSON.parse(code)
    var block = parsed["blocks"][selected]
    if(block["id"] == "block"){for(var key in block){
        if(!(key == "args" || key == "id" || key == "block")){
        var obj = document.createElement("label")
        obj.innerHTML = key + " "
        obj.setAttribute("type","text")
        obj.setAttribute("for",key)
        document.getElementById("blockinfo").appendChild(obj)
        var obj = document.createElement("input")
        obj.type = "text"
        obj.id = key
        try{
        obj.value = block[key]}
        catch{
            obj.value = ""
        }
        obj.onchange = (event) => {
            var x = parsed
            x["blocks"][selected][event.target.id] = document.getElementById(event.target.id).value
            code = JSON.stringify(x)
            rendblocks()
        }
        document.getElementById("blockinfo").appendChild(obj)
        document.getElementById("blockinfo").appendChild(document.createElement("br"))}
    }}
    if(block["id"] == "bracket"){
        var final = document.createElement("div")
        var input = document.createElement("select")
        input.innerHTML = '<option value="open">Opening Bracket</option><option value="close">Closing Bracket</option>'
        input.value = parsed["blocks"][selected]["direct"]
        input.id = "direct"
        input.onchange = () => {
            var x = parsed
            x["blocks"][selected]["direct"] = document.getElementById("direct").value
            code = JSON.stringify(x);
            rendblocks()
        }
        final.appendChild(input)
        final.appendChild(document.createElement("br"))
        var input = document.createElement("input")
        input.type = "checkbox"
        if(parsed["blocks"][selected]["type"] == "repeat"){
            input.checked = true
        }
        input.id = "sticky"
        input.onclick = () => {
            var x = parsed
                x["blocks"][selected]["type"] = document.getElementById("sticky").checked ?  "repeat" : "norm"
                code = JSON.stringify(x);
                rendblocks()}
        final.appendChild(input)
        var input = document.createElement("label")
        input.innerHTML = "Sticky"
        input.for = "sticky"
        final.appendChild(input)
        document.getElementById("blockinfo").appendChild(final)
    }
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