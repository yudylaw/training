var getElementsByClassName = function (className, tag, elm){
    if (document.getElementsByClassName) {
        getElementsByClassName = function (className, tag, elm) {
            elm = elm || document;
            var elements = elm.getElementsByClassName(className),
                nodeName = (tag)? new RegExp("\\b" + tag + "\\b", "i") : null,
                returnElements = [],
                current;
            for(var i=0, il=elements.length; i<il; i+=1){
                current = elements[i];
                if(!nodeName || nodeName.test(current.nodeName)) {
                    returnElements.push(current);
                }
            }
            return returnElements;
        };
    }
    else if (document.evaluate) {
        getElementsByClassName = function (className, tag, elm) {
            tag = tag || "*";
            elm = elm || document;
            var classes = className.split(" "),
                classesToCheck = "",
                xhtmlNamespace = "http://www.w3.org/1999/xhtml",
                namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace)? xhtmlNamespace : null,
                returnElements = [],
                elements,
                node;
            for(var j=0, jl=classes.length; j<jl; j+=1){
                classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
            }
            try	{
                elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
            }
            catch (e) {
                elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
            }
            while ((node = elements.iterateNext())) {
                returnElements.push(node);
            }
            return returnElements;
        };
    }
    else {
        getElementsByClassName = function (className, tag, elm) {
            tag = tag || "*";
            elm = elm || document;
            var classes = className.split(" "),
                classesToCheck = [],
                elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
                current,
                returnElements = [],
                match;
            for(var k=0, kl=classes.length; k<kl; k+=1){
                classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
            }
            for(var l=0, ll=elements.length; l<ll; l+=1){
                current = elements[l];
                match = false;
                for(var m=0, ml=classesToCheck.length; m<ml; m+=1){
                    match = classesToCheck[m].test(current.className);
                    if (!match) {
                        break;
                    }
                }
                if (match) {
                    returnElements.push(current);
                }
            }
            return returnElements;
        };
    }
    return getElementsByClassName(className, tag, elm);
};
window.onload = function (){
    var select =  getElementsByClassName("select_box","div",document) ;
    for(var j=0;j<select.length;j++){
        select[j].onclick = function (event)
        {
            var oSelect = getElementsByClassName("first_select","span",this)[0];
            var oSub = getElementsByClassName("sub_select","ul",this)[0];
            var aLi = oSub.getElementsByTagName("li");
            var i = 0;
            var style = oSub.style;
            style.display = style.display == "block" ? "none" : "block";
            //阻止事件冒泡
            (event || window.event).cancelBubble = true
            for (i = 0; i < aLi.length; i++)
            {
                //鼠标点击
                aLi[i].onclick = function ()
                {
                    oSelect.innerHTML = this.innerHTML;
                    jQuery(oSelect).attr("code", jQuery(this).attr("code"));//改变学科code by sjzhao 20160202 21:00

                }
            }
            document.onclick = function (){
                oSub.style.display = "none";
            };

        };
    }

    var labels = document.getElementById('type').getElementsByTagName('label');
    var radios = document.getElementById('type').getElementsByTagName('input');
    for(i=0,j=labels.length ; i<j ; i++)
    {
        labels[i].onclick=function()
        {
            if(this.className == '') {
                for(var k=0,l=labels.length ; k<l ; k++)
                {
                    labels[k].className='';
                    radios[k].checked = false;
                }
                this.className='checked';
                try{
                    document.getElementById(this.name).checked = true;
                } catch (e) {}
            }
        }
    }
}
var male_obj = {'type':'是', 'yes':'是','no':'否'};
function checkform(obj) {
    for (i = 0; i < obj.type.length; i++) {
        if (obj.type[i].checked) {
            alert(male_obj[obj.type[i].value]);
            break;
        }
    }
    return false;
}
