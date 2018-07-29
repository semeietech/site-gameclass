function getContent(path) {
    return new Promise(function (resolve, reject) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', path, true);
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 ) {
                if (xmlhttp.status == 200) {
                    resolve(xmlhttp)
                } else {
                    reject(xmlhttp)
                }
            }
        }
        xmlhttp.send();
    })
}

function writeSection(id, path) {
    return getContent(path).then((req) => {
        document.getElementById(id).innerHTML = req.responseText;
    }).catch(console.error)
}
