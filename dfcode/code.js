function init(){
    { // Commenting may end this from being like hell for me. Following are fetches.
        fetch('https://georgerng.github.io/dfcode/hardvalues.json') // This gets the hardvaules.
            .then(response => response.json())
            .then(data => hardvalues = data)
            .then(console.log("Got hardvalues."));
        fetch('https://georgerng.github.io/dfcode/db.json') // Gets ?actiondump.
            .then(response => response.json())
            .then(data => db = data)
            .then(console.log("Got db.json."))
            window.onbeforeunload = () => {ws.close()}
    }
    inventory("reset")
    unselect()
    document.getElementById("errorbox").style.display = "none"
    { // codeutilities stuff
        try{
            ws = new WebSocket("ws://localhost:31371/codeutilities/item");
        }catch{
            console.log("Couldn't connect to codeutilities.")
        }
        finally{
            ws.onopen = () => {
                document.getElementById("cu").style.display = "initial";
                console.log("Connected to codeutilites.")
            }
            ws.onmessage = event => {
                var data = JSON.parse(event.data)
                if(data["type"] == "template"){
                    document.getElementById("encodedinput").value = JSON.parse(data["received"])["code"]
                    importcode()
                    alert("Recieved template from codeutilities!")
                }
                if(data["status"] == "error"){
                    err(data["error"],"CodeUtilities")
                }
                if(data["status"] == "success"){
                    alert("Success!")
                }
            }
        }
    }
}

function err(text, type = "") {
    document.getElementById("errorbox").style.display = "initial";
    document.getElementById("error").innerHTML = text
    if (type != "") {
        document.getElementById("errortype").innerHTML = type + " Error:"
    } else {
        document.getElementById("errortype").innerHTML = "Error:"
    }
}

function importcode() {
    try{
        unselect()
    }catch{}
    try { // get the template data to import.
        var textin = document.getElementById("encodedinput").value
        var found = textin.match(/"code":"[a-z,A-Z,0-9,/,=,+]+/);
        if (found != null) {
            textin = found[0].replace('"code":"', '');
        }
        var decoded = String.fromCharCode.apply(null, new Uint16Array(pako.inflate(atob(textin).split('').map(function(x) {
            return x.charCodeAt(0);
        }))));
        code = decoded
        rendblocks()
    } catch (er) {
        err(er, "Import")
    }
}

function exportcode() {
    try {
        document.getElementById("encodedoutput").value = (btoa(String.fromCharCode.apply(null, new Uint16Array(pako.gzip(code)))));
    } catch (er) {
        err(er)
    }
}

function sendtocu(){
    exportcode()
    ws.send(
            JSON.stringify(
                {"type":"template","source":"georgerng.github.io","data":
                    JSON.stringify({"name":"§7Code Template §8» §7Imported Template","data":document.getElementById("encodedoutput").value})
                }
            )
        )
}

function rendblocks() {
    if (document.getElementById("pretty").checked) {
        try {
            document.getElementById("rawdecoded").value = JSON.stringify(JSON.parse(code), null, 2);
        } catch {
            err("A parsing error happened, probably bad JSON.","JSON")
        }
    } else {
        document.getElementById("rawdecoded").value = code
    }
    document.getElementById("code-list").innerHTML = ""
    try{JSON.parse(code)["blocks"].forEach((block, index) => {
        img = document.createElement("img");
        if (block["id"] == "block") {
            img.src = "images/normal/" + block["block"] + ".png"
        }
        if (block["id"] == "bracket") {
            img.src = "images/brackets/" + block["direct"]
            if (block["type"] == "repeat") {
                img.src = img.src + "s.png"
            } else {
                img.src = img.src + ".png"
            }
        }
        img.title = "Block " + String(index);
        img.onclick = function(index) {
            selectblock(index)
        };
        img.classList.add("block")
        if(selected == index){
            img.classList.add("selected")
        }
        img.id = "block-" + String(index);
        img.draggable = false
        img.ondragstart = () => {
            return false
        }
        document.getElementById("code-list").appendChild(img);
    })}
    catch(er){
        err(er,"JSON")
    }
}

function hardtag(key, label, block) {
    var parsed = JSON.parse(code);
    var obj = document.createElement("label");
    obj.innerHTML = label + " ";
    obj.setAttribute("for",key);
    document.getElementById("blockinfo").appendChild(obj);
    var obj = document.createElement("input");
    obj.value = key;
    obj.id = key;
    obj.type = "text";
    var x = parsed["blocks"][block][key]
    if (x != undefined) {
        obj.value = x;
    } else {
        obj.value = "";
    }
    obj.onchange = (event) => {
        changeelement(selected, event.target.id, event.target.value)
    }
    document.getElementById("blockinfo").appendChild(obj);
    document.getElementById("blockinfo").appendChild(document.createElement("br"));
}

function inventory(block){
    if(block == "reset")
    { //reset mode, easy method of clearing the inv preview.
        selecteditem = null;
        document.getElementById("itemedit").innerHTML = "";
        [...Array(25).keys()].forEach((x) => {document.getElementById("slot" + String(x)).innerHTML = null; document.getElementById("slot" + String(x)).appendChild(document.createElement("img"));})
    }
    else
    {
        inventory("reset")
        var parsed = JSON.parse(code)["blocks"][block]
        parsed["args"]["items"].forEach((x,i) => {
            var img = document.createElement("img")
            img.id = "item" + String(i)
            img.classList = "item unselectable"
            img.onclick = event => {item(Number(event.target.id.replace("item","")));}
            img.onmousedown = () => {return false}
            if(x["item"]["id"] == "item"){img.src = "images/rends/" + x["item"]["data"]["item"].match(/id:"[a-z]+:[a-z_]+"/g)[0].replace('id:"minecraft:','').replace('"','').toUpperCase() + ".png"} //render for normal items.
            if(x["item"]["id"] in hardvalues["values"]["mats"]){img.src = "images/rends/" + hardvalues["values"]["mats"][x["item"]["id"]].toUpperCase() + ".png"} //render for value items
            document.getElementById("slot" + String(i)).appendChild(img)
        // document.getElementById("row"+String(Math.ceil((x["slot"] + 1)/9))) // If I ever want to this gets me the element 
        })
    }    
}

function item(item){
    try{
        selecteditem = item;
        var parsed = JSON.parse(code)["blocks"][selected]["args"]["items"][item];
        var x = hardvalues["values"]["tags"][parsed["item"]["id"]];
        document.getElementById("itemedit").innerHTML = ""
        Object.entries(parsed["item"]["data"]).forEach(y => 
            {
                var obj = document.createElement("label");
                obj.innerHTML = x[y[0]];
                obj.setAttribute("for",y[0]);
                document.getElementById("itemedit").appendChild(obj);
                var obj = document.createElement("input");
                obj.type = typeof(parsed["item"]["data"][y[0]]) == "string" ? "text" : "number";
                obj.id = y[0];
                obj.value = parsed["item"]["data"][y[0]];
                obj.onchange = event => {
                    var parsed = JSON.parse(code);
                    parsed["blocks"][selected]["args"]["items"][selecteditem]["item"]["data"][event.target.id] = event.target.value;
                    code = JSON.stringify(parsed);
                    rendblocks()
                }
                document.getElementById("itemedit").appendChild(obj);
            }
        )
    }
    catch
    {
        err("It seems that this item cannot be edited yet.","Unknown")
    }
}

function changeelement(block, tagname, objective) {
    var parsed = JSON.parse(code);
    parsed["blocks"][block][tagname] = objective;
    code = JSON.stringify(parsed);
    rendblocks();
}

function unselect(){
    selected = null;
    document.getElementById("blockinfo").innerHTML = "<span>Click on a preview block to select it, and edit it here!</span>";
}

function selectblock(clickedobj) {
    selected = Number(clickedobj.target.id.replace("block-", ""))
    rendblocks()
    document.getElementById("blockinfo").innerHTML = "<span>Block " + selected + "</span></br>"
    var parsed = JSON.parse(code)
    var block = parsed["blocks"][selected]
    if(block["id"] == "block"){
        inventory(selected);
        try {
            for ([key, value] of Object.entries(hardvalues["block"][block["block"]])) {
                hardtag(value, key, selected)
            }
        } catch {
            for (var key in block) {
                hardtag(key, key, selected)
            }
        }
    }
    if (block["id"] == "bracket") {
        inventory("reset")
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
        if (parsed["blocks"][selected]["type"] == "repeat") {
            input.checked = true
        }
        input.id = "sticky"
        input.onclick = () => {
            var x = parsed
            x["blocks"][selected]["type"] = document.getElementById("sticky").checked ? "repeat" : "norm"
            code = JSON.stringify(x);
            rendblocks()
        }
        final.appendChild(input)
        var input = document.createElement("label")
        input.innerHTML = "Sticky"
        input.setAttribute("for","sticky")
        final.appendChild(input)
        document.getElementById("blockinfo").appendChild(final)
    }
    document.getElementById("blockinfo").appendChild(document.createElement("br"))
    var obj = document.createElement("button")
    obj.innerHTML = "Delete Block"
    obj.onclick = () => {
        var parsed = JSON.parse(code);
        if(selected == 0){
            parsed["blocks"].splice(0,1)
        }else
        {parsed["blocks"].splice(selected,selected)}
        code = JSON.stringify(parsed);
        unselect(); 
        rendblocks();}
    document.getElementById("blockinfo").appendChild(obj)
}

function copy(cmd) {
    exportcode()
    var copyText = document.getElementById("encodedoutput");
    document.getElementById("encodedoutput").disabled = 0;
    var x = copyText.value;
    if(cmd){
        document.getElementById("encodedoutput").value = `/give @p minecraft:ender_chest{PublicBukkitValues:{"hypercube:codetemplatedata":'{"author":"GeorgeRNG.github.io","name":"§7Code Template §8» §7Imported Template","version":1,"code":"` + copyText.value + `"}'},display:{Name:'{"extra":[{"bold":false,"italic":false,"underlined":false,"strikethrough":false,"obfuscated":false,"color":"gray","text":"Code Template "},{"italic":false,"color":"dark_gray","text":"» "},{"italic":false,"color":"gray","text":"Imported Template"}],"text":""}'}}`;
    }
    copyText.select();
    copyText.setSelectionRange(0, 999999);
    document.execCommand("copy");
    document.getElementById("encodedoutput").value = x;
    document.getElementById("encodedoutput").disabled = "disabled";
    alert("It should now be on your clipboard!\n");
}

function newblock(){
    var x = Number(document.getElementById("newindex").value)
    document.getElementById("newindex").value = x;
    if(x >= 0){
        try{
            var parsed = JSON.parse(code);
        }
        catch{
            code = JSON.stringify({"blocks":[]})
            var parsed = JSON.parse(code);
        }
        var y = document.getElementById("block-type").value
        if(y[0] != ".")
        {
            var obj = {"id":"block","block":y,"args":{"items":[]}}
        }
        else
        {
            y = y.replace(".","").split(",")
            var obj = {"id":"bracket","direct":y[1],"type":y[0]}
        }
        parsed["blocks"].splice(x,0,obj)
        code = JSON.stringify(parsed);
        rendblocks()
    }else{document.getElementById("newindex").value = 0; newblock()}
}