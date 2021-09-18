function init(nw){
    if(nw){
        if(window.sessionStorage["template"] == undefined){window.location.href = "index.html"; return;} // must have an imported template :>
        code = JSON.parse(decompress(window.sessionStorage["template"]));
        window.oncontextmenu = () => {return false}
        {//this gets and parses actiondump for needed data.
            fetch('https://georgerng.github.io/dfonline/db.json') // Gets ?actiondump.
                .then(response => response.json()) // some code probably from mdn docs.
                .then(data => { // unready required init
                    db = data;
                    document.getElementById("html").style.cursor = "progress"
                    document.getElementById("legacy").checked = false
                    document.getElementById("dragit").addEventListener("dragover", event => {if(typeof(drag) == "string"){event.preventDefault();}})
                    document.getElementById("dragit").addEventListener("drop", event => {event.preventDefault(); code["blocks"].push({"id":"block","block":drag,"action":"","args":{"items":[]}}); rendblocks()})
                    var obj // blocks to add.
                    db["codeblocks"].forEach((block,i) => {
                        obj = document.createElement("img")
                        obj.src = "images/rends/" + block["item"]["material"] + ".png"
                        obj.classList = "blockdrag codedrag noselect"
                        obj.id = block["identifier"]
                        obj.onclick = e => {tooltip(e,db["codeblocks"][i]["item"],true); return false;}
                        obj.draggable = true
                        obj.addEventListener("dragstart", event => {drag = event.target.id;})
                        document.getElementById("footer").appendChild(obj)
                    })
                })
                .then(() => {// ready:
                    hv()
                    rendblocks()
                    document.getElementById("html").style.cursor = "auto"
                });
        }
    }
    else{// this is for the initial page.
        ws = new WebSocket("ws://localhost:31371/codeutilities/item") // to be forgotten, gets codeutils item api.
        ws.onopen = () => {console.log("Can use item api now.")}
        ws.onmessage = x => {console.log("received item.");document.getElementById("templatedata").value=JSON.parse(JSON.parse(x["data"])["received"])["code"]}
    }
    rotatecheck()
    window.matchMedia("(orientation: portrait)").onchange = () => {}
}

function hv(){
    var legacy = document.getElementById("legacy").checked
    console.log("Hardvalues! Legacy is",legacy)
    hardvalues = {"idname":Object.fromEntries(db["codeblocks"].map(x => {return [x["identifier"],x["name"]]})),"actions":{}}
    hardvalues["tagnames"] = ["action","target","subAction","inverted","data"]
    hardvalues["nameid"] = Object.fromEntries(Object.entries(hardvalues["idname"]).map(x => {return x.reverse()}))
    db["codeblocks"].map(x => {return x["identifier"]}).forEach(x => {
        hardvalues["actions"][x] = [""]
    })
    db["actions"].forEach(x => {
        if(x.icon.description.length != 0 || legacy){
            hardvalues["actions"][hardvalues["nameid"][x["codeblockName"]]].push(x["name"])
        }
    })
    hardvalues["action"] = Object.fromEntries(db["actions"].map(x => [x["name"],x]))
}

//some stuff I won't need to care about any further lol.

function rotatecheck(){
    if(window.matchMedia("(orientation: portrait)").matches){
        alert("It is recommended to use landscape mode.")
    }
}

function tooltip(event,itemdata,poslocked = false){
    var cursor = document.getElementById("tooltip")
    { // innerHTML
        cursor.innerHTML = ""
        var obj
        if(String(itemdata).match(/\d+/) != null){
            itemdata = String(itemdata).match(/\d+/g)
            itemdata = code["blocks"][itemdata[0]]["args"]["items"][itemdata[1]]["item"]
            console.log(itemdata)
            if(itemdata["id"] == "var"){
                obj = document.createElement("span")
                obj.innerHTML = itemdata["data"]["name"]
                obj.classList = "white"
                cursor.appendChild(obj);
                obj = document.createElement("span")
                obj.innerHTML = ({"saved":"SAVE","unsaved":"GAME","local":"LOCAL"}[itemdata["data"]["scope"]])
                obj.classList = ({"saved":"yellow","unsaved":"lightgrey","local":"green"}[itemdata["data"]["scope"]])
                cursor.appendChild(obj)
            }
            else if(itemdata["id"] == "num"){
                obj = document.createElement("span")
                obj.innerHTML = itemdata["data"]["name"];
                obj.classList = "red";
                cursor.appendChild(obj)
            }
            else if(itemdata["id"] == "g_val"){
                obj = document.createElement("span")
                obj.innerHTML = itemdata["data"]["type"]
                cursor.appendChild(obj)
                obj = document.createElement("span")
                obj.innerHTML = itemdata["data"]["target"]
                obj.classList = {"Selection":"green","Default":"green","Killer":"red","Damager":"red","Victim":"blue","Shooter":"yellow","Projectile":"aqua","Last-Spawned Entity":"yellow"}[itemdata["data"]["target"]]
                cursor.appendChild(obj)
            }
            else if(itemdata["id"] == "txt"){
                obj = document.createElement("span")
                obj.innerHTML = itemdata["data"]["name"]
                obj.classList = "white"
                cursor.appendChild(obj)
                if(itemdata["data"]["name"] == ""){
                    obj = document.createElement("span")
                    obj.innerHTML = "Empty Text"
                    obj.classList = "emptytext"
                    cursor.appendChild(obj)
                }
            }
            else if(itemdata["id"] == "vec"){
                obj = document.createElement("span")
                obj.innerHTML = "Vector"
                obj.style.color = "#2affaa"
                cursor.appendChild(obj)
                obj = document.createElement("span")
                obj.innerHTML = '<span class="lightgray">X: <span class="white">' + itemdata["data"]["x"] + '</span>'
                cursor.appendChild(obj)
                obj = document.createElement("span")
                obj.innerHTML = '<span class="lightgray">Y: <span class="white">' + itemdata["data"]["y"] + '</span>'
                cursor.appendChild(obj)
                obj = document.createElement("span")
                obj.innerHTML = '<span class="lightgray">Z: <span class="white">' + itemdata["data"]["z"] + '</span>'
                cursor.appendChild(obj)
            }
            else if(itemdata["id"] == "loc"){
                obj = document.createElement("span")
                obj.innerHTML = "Location"
                obj.classList = "green"
                cursor.appendChild(obj)
                obj = document.createElement("span")
                obj.innerHTML = '<span class="lightgray">X: <span class="white">' + String(itemdata["data"]["loc"]["x"]) + '</span>'
                cursor.appendChild(obj)
                obj = document.createElement("span")
                obj.innerHTML = '<span class="lightgray">Y: <span class="white">' + String(itemdata["data"]["loc"]["y"]) + '</span>'
                cursor.appendChild(obj)
                obj = document.createElement("span")
                obj.innerHTML = '<span class="lightgray">Z: <span class="white">' + String(itemdata["data"]["loc"]["z"]) + '</span>'
                cursor.appendChild(obj)
                if(!itemdata["data"]["isBlock"]){
                    obj = document.createElement("span")
                    obj.innerHTML = '<span class="lightgray">p: <span class="white">' + String(itemdata["data"]["loc"]["pitch"]) + '</span>'
                    cursor.appendChild(obj)
                    obj = document.createElement("span")
                    obj.innerHTML = '<span class="lightgray">y: <span class="white">' + String(itemdata["data"]["loc"]["yaw"]) + '</span>'
                    cursor.appendChild(obj)
                }
            }
            else if(itemdata["id"] == "snd"){
                obj = document.createElement("span")
                obj.innerHTML = "Sound"
                obj.classList = "blue"
                cursor.appendChild(obj)
                obj = document.createElement("span")
                obj.innerHTML = itemdata["data"]["sound"]
                cursor.appendChild(obj)
                obj = document.createElement("span")
                obj.innerHTML = '<span class="lightgray">Pitch: <span class="white">' + itemdata["data"]["pitch"] + '</span>'
                cursor.appendChild(obj)
                obj = document.createElement("span")
                obj.innerHTML = '<span class="lightgray">Volume: <span class="white">' + itemdata["data"]["vol"] + '</span>'
                cursor.appendChild(obj)
            }
            else if(itemdata["id"] == "pot"){
                obj = document.createElement("span")
                obj.innerHTML = "Potion Effect"
                obj.style.color = "#ff557f"
                cursor.appendChild(obj)
                obj = document.createElement("span")
                obj.innerHTML = itemdata["data"]["pot"] + "<br><br>"
                cursor.appendChild(obj)
                obj = document.createElement("span")
                obj.innerHTML = '<span class="lightgray">Amplifier: <span class="white">' + itemdata["data"]["amp"] + '</span>'
                cursor.appendChild(obj)
                obj = document.createElement("span")
                obj.innerHTML = '<span class="lightgray">Duration: <span class="white">' + itemdata["data"]["dur"] + '</span>'
                cursor.appendChild(obj)
            }
            else{
                obj = document.createElement("span")
                obj.classList = "red"
                obj.innerHTML = "Oh No!<br>Looks like this item tooltip can't be shown."
                cursor.appendChild(obj)
            }
        }
        else{
            obj = document.createElement("span")
            obj.innerHTML = itemdata["name"]
            obj.classList = "white"
            cursor.appendChild(obj)
            if(itemdata["description"].length != 0){
                itemdata["description"].forEach(x => {
                    obj = document.createElement("span")
                    obj.innerHTML = x
                    obj.classList = "lightgray"
                    cursor.appendChild(obj)
                })
            }
            if(itemdata["example"].length != 0){
                obj = document.createElement("span")
                obj.innerHTML = "<br>Example:"
                obj.classList = "white"
                cursor.appendChild(obj)
                itemdata["example"].forEach(x => {
                    obj = document.createElement("span")
                    obj.innerHTML = x
                    obj.classList = "lightgray"
                    cursor.appendChild(obj)
                })
            }
            if(itemdata["additionalInfo"].length != 0){
                obj = document.createElement("span")
                obj.innerHTML = "<br>Additional Info:"
                obj.classList = "blue"
                cursor.appendChild(obj)
                itemdata["additionalInfo"].forEach(x => {
                    obj = document.createElement("span")
                    obj.innerHTML = x
                    obj.classList = "lightgray"
                    cursor.appendChild(obj)
                })
            }
        }
            cursor.style.display = "grid"
            if(poslocked){
                cursor.style.position = "fixed"
                cursor.style.left = String(event.clientX + 10) + "px"
                cursor.style.top = String(event.clientY - cursor.getBoundingClientRect().height/2) + "px"
            }
            else{
                cursor.style.position = "absolute"
                cursor.style.left = String(event.layerX + 10) + "px"
                cursor.style.top = String(event.layerY - cursor.getBoundingClientRect().height/2) + "px"
            }
            cursor.innerHTML = cursor.innerHTML.replaceAll("»","<span class=\"aqua\">»</span>")
    }
}

function rendblocks(){
    document.getElementById("stuff").innerHTML = null;
    var src;
    var obj;
    var sign;
    var count
    code["blocks"].forEach((block,i) => {
        sign = false;
        if(block.id == "bracket"){//brackets.
            src = block["direct"]
            if(block["type"] != "norm"){
                src = src + "s"
            }
        }
        else{//normal blocks
            src = block["block"]
            if(block["block"] != "else"){
                sign = document.createElement("div")
                sign.className = "sign noselect"
                obj = document.createElement("span")
                obj.innerHTML = hardvalues["idname"][block["block"]]
                sign.appendChild(obj)
                count = 3
                hardvalues["tagnames"].forEach(x => {
                    if(!(["",undefined].includes(block[x]))){
                        count = count - 1
                        obj = document.createElement("span")
                        obj.innerHTML = block[x]
                        sign.appendChild(obj)
                    }
                });
                [...Array(count)].forEach(() => {
                    obj = document.createElement("span")
                    obj.innerHTML = ""
                    sign.appendChild(obj)
                });
            }
        }
        obj = document.createElement("div");
        obj.draggable = true
        obj.id = "block" + String(i)
        obj.classList = "blockdrag block " + src;
        if(sign != false){
            obj.appendChild(sign)
        }
        obj.oncontextmenu = event => {
            if (event.target.className == ""){
                ctx(true,event.target.parentElement.parentElement.id.replace("block",""))
                //click on sign?
            }
            else
            {
                ctx(true,event.target.id.replace("block",""))
                //click on block?
            }
        }
        obj.onclick = event => {
            if(code["blocks"][Number(reeds(event).id.replace("block",""))]["action"] != ""){
                tooltip(event,hardvalues["action"][code["blocks"][Number(reeds(event).id.replace("block",""))]["action"]]["icon"])
            }
        }
        obj.addEventListener("dragstart", event => {drag = Number(event.target.id.replace("block",""))})
        obj.addEventListener("dragenter", event => {event.preventDefault();reeds(event).classList.add("codehover");})
        obj.addEventListener("dragexit", event => {reeds(event).classList.remove("codehover")})
        obj.addEventListener("drop",event => {event.preventDefault(); reeds(event).classList.remove("codehover"); if(typeof(drag) == "number"){var x = code["blocks"][Number(reeds(event).id.replace("block",""))];code["blocks"][Number(reeds(event).id.replace("block",""))] = code["blocks"][drag];code["blocks"][drag] = x;rendblocks()}else{var x = reeds(event);code["blocks"].splice(Number(x.id.replace("block","")) + Number(event.clientX - x.getBoundingClientRect().x >= x.getBoundingClientRect().width/2 ? 1 : 0),0,{"id":"block","block":drag,"action":""});rendblocks();};})
        obj.addEventListener("dragover", event => {event.preventDefault();})
        document.getElementById("stuff").appendChild(obj)
    })
}

function reeds(event){
    return(event.target.parentElement.id == "" ? event = event.target.parentElement.parentElement : event = event.target)
}

function ctx(block, id){
    if(block){
        document.getElementById("menu").innerHTML = ""
        var obj = document.createElement("h2")
        obj.innerHTML = "Block " + id.toString()
        var menu = document.createElement("div")
        document.getElementById("menu").appendChild(obj)
        {
            {//block menu
                var div = document.createElement("div")
                if(code["blocks"][id]["id"] != "bracket")
                {
                obj = document.createElement("label")
                obj.innerHTML = "Action "
                var x = code["blocks"][id]["action"] == undefined ? "data" : "action"
                obj.setAttribute("for",x+String(id))
                div.appendChild(obj)
                if(x == "data"){
                    obj = document.createElement("input");
                }else{
                    obj = document.createElement("select");
                    hardvalues["actions"][code["blocks"][id]["block"]].forEach(x => {
                        var select = document.createElement("option")
                        select.value = x;
                        select.innerHTML = x;
                        obj.appendChild(select)
                    }
                    )
                }
                obj.value = code["blocks"][id][x]
                obj.id = x+String(id);
                obj.onchange = event => {edit(event)};
                div.appendChild(obj);
                if(["player_action","if_player","if_entity","entity_action"].includes(code["blocks"][id]["block"])){//selection
                    div.appendChild(document.createElement("br"))
                    obj = document.createElement("label");
                    obj.setAttribute("for","target"+String(id));
                    obj.innerHTML = "Selection "
                    div.appendChild(obj)
                    obj = document.createElement("select");
                    obj.id = "target"+String(id);
                    obj.onchange = event => {edit(event)};
                    ["","Selection","Default","Killer","Damager","Shooter","Victim","AllPlayers"].forEach(x => {
                            var select = document.createElement("option")
                            select.value = x;
                            select.innerHTML = x;
                            obj.appendChild(select)
                        }
                    )
                    obj.value = code["blocks"][id]["target"]
                    div.appendChild(obj)
                }
                obj = ["if_var","if_player","if_entity","if_game"].includes(code["blocks"][id]["block"]);
                if(obj){//NOT and above is not decider.
                div.appendChild(document.createElement("br"))
                obj = document.createElement("label")
                obj.setAttribute("for","inverted"+String(id));
                obj.innerHTML = "NOT";
                div.appendChild(obj);
                obj = document.createElement("input");
                obj.type = "checkbox";
                obj.id = "inverted"+String(id);
                obj.onchange = event => {edit(event)};
                obj.checked = code["blocks"][id]["inverted"] == "NOT"
                div.appendChild(obj);
            }
            div.appendChild(document.createElement("br"));
                }
                else{
                menu.style.display = "block"
                {// direct
                    obj = document.createElement("label")
                    obj.setAttribute("for","direct"+String(id))
                    obj.innerHTML = "Direction"
                    menu.appendChild(obj)
                    obj = document.createElement("select")
                    obj.id = "direct"+String(id)
                    obj.onchange = event => {edit(event)}
                    var select = document.createElement("option")
                    select.innerHTML = "Opening"
                    select.value = "open"
                    obj.appendChild(select)
                    select = document.createElement("option")
                    select.innerHTML = "Closing"
                    select.value = "close"
                    obj.appendChild(select)
                    obj.value = code["blocks"][id]["direct"]
                    menu.appendChild(obj)
                }
                menu.appendChild(document.createElement("br"))
                {// sticky
                    obj = document.createElement("label")
                    obj.setAttribute("for","type"+String(id))
                    obj.innerHTML = "Sticky"
                    menu.appendChild(obj)
                    obj = document.createElement("input")
                    obj.id = "type"+String(id)
                    obj.type = "checkbox"
                    obj.checked = code["blocks"][id]["type"] == "repeat"
                    obj.onclick = event => {edit(event)}
                    menu.appendChild(obj)
                }
                menu.appendChild(document.createElement("br"))
                }
                div.appendChild(document.createElement("br"));
                obj = document.createElement("button");
                obj.innerHTML = "Delete";
                obj.id = "delete"+String(id);
                obj.onclick = event => {
                    delete code["blocks"][Number(event.target.id.replace("delete",""))];
                    rendblocks()
                    document.getElementById("overlay").click()
                }
                div.appendChild(obj)
                menu.appendChild(div)
            }
            {//inventory menu
                var div = document.createElement("div")
                div.id = "inventory"
                {//block inv
                    div.appendChild(inv("block",code["blocks"][id]["args"]["items"]))
                    code["blocks"][id]["args"]["items"].forEach((x,i) => {
                        div.getElementsByClassName("slot")[x["slot"]].innerHTML = ""
                        div.getElementsByClassName("slot")[x["slot"]].appendChild(slot(x,String(id)+":"+String(i)))
                    })
                }
                {//home inv
                    // div.appendChild(inv("home"))
                }
                menu.appendChild(div)
            }
        }
        document.getElementById("menu").appendChild(menu)
    }
    {//overlay stuff.
        document.getElementById("overlay").style.display = "block";
        document.getElementById("overlay").onanimationend = event => {if(event.target.id == "overlay"){event.target.style.display = "none"; event.target.classList = ""}}
        document.getElementById("overlay").oncontextmenu = event => {event.target.click()}
        document.getElementById("overlay").onclick = event => {if(event.target.id == "overlay"){event.target.classList = "fadeout"; document.getElementById("menu").animationPlayState = "unset"}}
        document.getElementById("menu").style.animationPlayState = "running"
    }
}

function inv(prefix,items){
    var i = document.createElement("div");
    var row = document.createElement("h3");
    row.innerHTML = "Inventory";
    row.className = "mcfont";
    i.appendChild(row);
    row = document.createElement("div");
    row.classList = "row";
    row.id = prefix+"row0";
    i.appendChild(row);
    row = document.createElement("div");
    row.classList = "row";
    row.id = prefix+"row1";
    i.appendChild(row);
    row = document.createElement("div");
    row.classList = "row";
    row.id = prefix+"row2";
    i.appendChild(row);
    items = Object.fromEntries(items.map(x => [x["slot"],x["item"]]))
    var div
    [...Array(27).keys()].forEach(y => {
        div = document.createElement("div")
        div.id = prefix+"slot"+String(y)
        div.classList = "slot"
        i.children[Math.min(Math.floor((y/(26/3))),2) + 1].appendChild(div)
    })
    return i
}

function slot(itemdata,namespace){
    var i = document.createElement("img")
    i.id = namespace
    //scr selector
    try{
        i.src = "images/rends/" + {"g_val":"name_tag","pot":"dragon_breath","part":"white_dye","snd":"nautilus_shell","vec":"prismarine_shard","loc":"paper","num":"slime_ball","txt":"book","var":"magma_cream"}[itemdata.item.id].toUpperCase() + ".png";
    }
    catch{
        if(itemdata.item.id == "item"){
            i.src = "images/rends/" + itemdata.item.data.item.match(/(?<=([a-z.]+:))[a-z_]+/g)[0].toUpperCase() + ".png"

        }
        else{
            i.src = "images/unknown.png";
            i.title = "Seems like we can't show this icon."
        }
    }
    //scr end
    i.onclick = e => {tooltip(e,e.target.id,true)}
    return i
}

function edit(event){
    var id = Number(event.target.id.match(/[0-9]+/g)[0]);
    var tag = event.target.id.replace(String(id),"");
    if(tag == "inverted")
    {
        code["blocks"][id][tag] = event.target.checked ? "NOT" : ""
    }
    else if(tag == "type"){
        code["blocks"][id][tag] = event.target.checked ? "repeat" : "norm"
    }
    else
    {code["blocks"][id][tag] = event.target.value;}
    rendblocks()
}

{//decode en/de:code stuff
function decompress(x){return String.fromCharCode.apply(null,new Uint16Array(pako.inflate(new Uint8Array(atob(x).split('').map((e)=>{return e.charCodeAt(0);})))));}
function compress(x){return (btoa(String.fromCharCode.apply(null, new Uint16Array(pako.gzip(x)))));}
}

function incode(nw){
    if(nw){
        document.getElementById("templatedata").value = "H4sIAAAAAAAAA6tWSsrJT84uVrKKjq0FAPAORtkNAAAA"
    }
    else
    {
        var x = document.getElementById("templatedata").value.match(/"code":"[a-z,A-Z,0-9,/,=,+]+/g)
        if(x != null){
            document.getElementById("templatedata").value = x[0].replace('"code":"','')
        }
    }
    ws.close()
    window.sessionStorage["template"] = document.getElementById("templatedata").value
    window.location.href = "edit.html";
}

function codeout(){
    ctx(false,0);
    document.getElementById("menu").innerHTML = "";
    var obj = document.createElement("h2");
    obj.innerHTML = "Export";
    document.getElementById("menu").appendChild(obj);
    obj = document.createElement("p");
    obj.innerHTML = "There are various ways to get code into diamondfire. The following are the options of getting the template into diamondfire, or copying the template data.";
    document.getElementById("menu").appendChild(obj);
    obj = document.createElement("button");
    obj.innerHTML = "Copy Data";
    obj.onclick = () => {
        navigator.clipboard.writeText(compress(JSON.stringify(code)))
        document.getElementById("overlay").click()
    }
    document.getElementById("menu").appendChild(obj)
    document.getElementById("menu").appendChild(document.createElement("br"))
    obj = document.createElement("button");
    obj.innerHTML = "Copy Give Command";
    obj.onclick = () => {
        navigator.clipboard.writeText(`/give @p minecraft:ender_chest{PublicBukkitValues:{"hypercube:codetemplatedata":'{"author":"DFOnline","name":"§bDFOnline §3» §bTemplate","version":1,"code":"` + compress(JSON.stringify(code)) + `"}'},display:{Name:'{"extra":[{"bold":false,"italic":false,"underlined":false,"strikethrough":false,"obfuscated":false,"color":"aqua","text":"DFOnline "},{"italic":false,"color":"dark_aqua","text":"» "},{"italic":false,"color":"aqua","text":"Template"}],"text":""}'}} 1`)
        document.getElementById("overlay").click()
    }
    document.getElementById("menu").appendChild(obj)
}