/* 
Copyright (c) 2022, Christian Trisotto Alegri // chris.alegri@gmail.com
Licensed under MIT.
*/

let arrayProcessos = new Map();
let arrayRecursos = new Map();
let arrayConnections = new Map();
let arrayConnectionsBackup = new Map();

let qtdTotalProcessos = 0;
let qtdTotalRecursos = 0;
let saveState = [];
let globalSaveStateIndex = 0;

// function getRandomColor() {
//     var letters = '0123456789ABCDEF';
//     var color = '#';
//     for (var i = 0; i < 6; i++ ) {
//         color += letters[Math.floor(Math.random() * 16)];
//     }
//     return color;
// }

let id = 1;
let availableIDProcesso = 9999
let availableIDRecurso = 9999

let isResourceIDAvailable = false;
let isProcessoIDAvailable = false;

function drawCircle(event)
    {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");

        x = event.pageX - 30;
        y = event.pageY - 30;

        cor = "white";
        
        ctx.lineWidth = 3;
        ctx.fillStyle = cor;
        ctx.beginPath();
        ctx.arc(x, y, 26, 0, 2*Math.PI);
        ctx.strokeStyle = 'black';
        ctx.stroke();
        ctx.fill();
        
        let right = x + 26;
        let left = x - 26;
        let bottom = y + 26;
        let top = y - 26;

        console.log(left + " left, " + right + " right  vertical  " + bottom + " bottom and top, " + top)

        let processo = {
            cor:"",
            x: 0,
            y: 0,
            id: 0,
            ownID: 0,
            idCosmetico: 0,
            holdsRecursos: new Map(),
            wantsRecursos: new Map(),
        };

        processo.cor = cor;
        processo.x = x;
        processo.y = y;

        qtdTotalProcessos++;

        if (isProcessoIDAvailable)
        {
            if (availableIDProcesso < qtdTotalProcessos)
            {
                processo.id = availableIDProcesso;
                processo.ownID = qtdTotalProcessos
                processo.idCosmetico = qtdTotalProcessos
            }

            else
            {
                processo.ownID = qtdTotalProcessos
                processo.idCosmetico = qtdTotalProcessos
                processo.id = qtdTotalProcessos;
            }
            
            isProcessoIDAvailable = false;
        }
        else
        {
            processo.id = qtdTotalProcessos;
            processo.ownID = qtdTotalProcessos
            processo.idCosmetico = qtdTotalProcessos
        }

        ctx.font = "20px Arial MT";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText("P" + processo.ownID, x, y);

        arrayProcessos.set(processo.id, processo);

        id++;
}
    let idRecurso = 100;
    function drawSquare(event)
    {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");

        x = event.pageX - 10;
        y = event.pageY - 10;

        let qtdRecurso = document.getElementById("qtdRecurso").value;
        if (!qtdRecurso)
            return;

        console.log(x);
        console.log(y);

        qtdTotalRecursos++;

        ctx.lineWidth = 3;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.rect(x, y, 45, 45);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fill();

        ctx.font = "20px Arial MT";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.strokeStyle = "white";
        ctx.fillText("R" + qtdTotalRecursos, x + 20, y - 10);
        ctx.fillText(qtdRecurso, x + 20, y + 30);

        let recurso = {
            cor:"",
            x: 0,
            y: 0,
            id: 0,
            qtdRecursos: 0,
            idReal: 0,
            idCosmetico: 0,
            servindoProcessos: [],
        };

        recurso.cor = "white";
        recurso.x = x;
        recurso.y = y;

        recurso.id = idRecurso;
        recurso.idReal = qtdTotalRecursos;
        recurso.idCosmetico = qtdTotalRecursos;
        recurso.qtdRecursos = qtdRecurso;

        arrayRecursos.set(recurso.id, recurso);

        idRecurso++;
        id++;
    }

    let begin = true;

    let xLineBegin;
    let yLineBegin;

    let xLineEnd;
    let yLineEnd;

    function movethis(event)
    {
        if (begin)
        {
            console.log("COMEÇO")
            xLineBegin = event.pageX;
            yLineBegin = event.pageY;
            begin = false;

            console.log("coordX " + xLineBegin)
            console.log("coordY " + yLineBegin)

            let isRecurso = false;
            let isProcesso = false;
            for (const [key, value] of arrayRecursos.entries()) 
            {
                if ((xLineBegin) < (value.x + 60) && (xLineBegin) > value.x)
                {
                    if ((yLineBegin) < (value.y + 60) && (yLineBegin) > value.y)
                    {
                        isRecurso = true;
                        break;
                    }
                }
            }
            if (!isRecurso)
            {
                for (const [key, value] of arrayProcessos.entries()) 
                {
                    let distance = Math.hypot((xLineBegin-10)-value.x, (yLineBegin-10)-value.y);
                    console.log(distance);
                    //25 = raio;
                    if (distance < 30)
                    {
                        isProcesso = true;
                        break;
                    }
                    
                }
            }

            if (!isRecurso && !isProcesso)
                begin = true;

        }
        else
        {
            xLineEnd = event.pageX;
            yLineEnd = event.pageY;
            console.log("FINAL")
            console.log("coordX END " + xLineEnd)
            console.log("coordY END" + yLineEnd)
            begin = true;
            movethis2();
        }
    }

    function movethis2()
    {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");

        let startsWithResource = false;

        let closestKeyRecurso;
        let sumTotal = 9999;
        for (const [key, value] of arrayRecursos.entries()) 
        {
            // 45 = largura e altura do retangulo + folga
            if ((xLineBegin) < (value.x + 60) && (xLineBegin) > value.x)
            {
                sumX = (value.x + 60) - (xLineBegin) 
            //dentro do range y
                if ((yLineBegin) < (value.y + 60) && (yLineBegin) > value.y)
                    //recurso confirmado
                {
                    sumY = (value.y + 60) - (yLineBegin)

                    if (sumX + sumY < sumTotal)
                    {
                        closestKeyRecurso = key;
                        sumTotal = sumX + sumY;
                    }
                }
            }
        }
        for (const [key, value] of arrayRecursos.entries()) 
        {
            if (key == closestKeyRecurso)
            {
                startsWithResource = true;
                eraseResource(key);
                value.x = xLineEnd;
                value.y = yLineEnd;
                break;
            }
        }
        for (const [key, value] of arrayRecursos.entries()) 
        {
            if (closestKeyRecurso == key)
            {
                startsWithResource = true;
                eraseResource(key);
                value.x = xLineEnd;
                value.y = yLineEnd;

                for (const [keyLinha, valueLinha] of arrayConnections.entries()) 
                {
                    let variance = Math.floor(Math.random() * 15) + 5;
                    if (valueLinha.from == key)
                    {
                        eraseLinha(keyLinha);

                        valueLinha.xStart = xLineEnd + variance;
                        valueLinha.yStart = yLineEnd + variance;
                    }
                    else if (valueLinha.to == key)
                    {
                        eraseLinha(keyLinha);

                        valueLinha.xEnd = xLineEnd + variance;
                        valueLinha.yEnd = yLineEnd + variance;
                    }
                }
            }
        }
        redrawAll()

        if (!startsWithResource)
        {
            let closestKeyProcesso;
            let smallestDistance = 9999;
            for (const [key1, value1] of arrayProcessos.entries()) 
            {
                let distance = Math.hypot((xLineBegin-10)-(value1.x), (yLineBegin-10)-(value1.y));
                console.log(distance);
                if (distance < 30 && distance < smallestDistance)
                {
                    smallestDistance = distance;
                    closestKeyProcesso = key1;
                }
            }
            
            for (const [key1, value1] of arrayProcessos.entries()) 
            {
                if (key1 == closestKeyProcesso)
                {                
                    eraseProcess(key1);
                    value1.x = xLineEnd;
                    value1.y = yLineEnd;
                    break;
                }
            }

            for (const [key1, value1] of arrayProcessos.entries()) 
            {
                if (key1 == closestKeyProcesso)
                {
                    eraseProcess(key1);
                    value1.x = xLineEnd;
                    value1.y = yLineEnd;

                for (const [keyLinha, valueLinha] of arrayConnections.entries()) 
                {
                    let variance = Math.floor(Math.random() * 15) + 5;
                    if (valueLinha.from == key1)
                    {
                        eraseLinha(keyLinha);
                        valueLinha.xStart = xLineEnd - variance;
                        valueLinha.yStart = yLineEnd - variance;
                    }
                    else if (valueLinha.to == key1)
                    {
                        eraseLinha(keyLinha);
                        valueLinha.xEnd = xLineEnd + variance;
                        valueLinha.yEnd = yLineEnd + variance;
                    }
                }
            }
            }
        }
        redrawAll()
    }

    function drawLine(event)
    {
        if (begin)
        {
            console.log("COMEÇO")
            xLineBegin = event.pageX;
            yLineBegin = event.pageY;
            begin = false;

            console.log("coordX " + xLineBegin)
            console.log("coordY " + yLineBegin)

            let isRecurso = false;
            let isProcesso = false;
            for (const [key, value] of arrayRecursos.entries()) 
            {
                if (xLineBegin < (value.x + 60) && xLineBegin > value.x)
                {
                    if (yLineBegin < (value.y + 60) && yLineBegin > value.y)
                    {
                        isRecurso = true;
                        break;
                    }
                }
            }
            if (!isRecurso)
            {
                for (const [key, value] of arrayProcessos.entries()) 
                {
                    let distance = Math.hypot((xLineBegin-10)-value.x, (yLineBegin-10)-value.y);
                    console.log(distance);
                    //25 = raio;
                    if (distance < 28)
                    {
                        isProcesso = true;
                        break;
                    }
                    
                }
            }

            if (!isRecurso && !isProcesso)
                begin = true;
        }
        else
        {
            xLineEnd = event.pageX;
            yLineEnd = event.pageY;
            console.log("FINAL")
            console.log("coordX END " + xLineEnd)
            console.log("coordY END" + yLineEnd)
            begin = true;
            drawLine2();
        }
    }

    function drawLine2()
    {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");

        let line = {
            id: 0,
            xStart: 0,
            yStart: 0,
            xEnd: 0,
            yEnd: 0,
            from: 0,
            to: 0,
            cor: "",
        }
        let startsWithResource = false;

        for (const [key, value] of arrayRecursos.entries()) 
        {
            let done = false;
            // 45 = largura e altura do retangulo + folga
            if (xLineBegin < (value.x + 60) && xLineBegin > value.x)
            {
            //dentro do range y
                if (yLineBegin < (value.y + 60) && yLineBegin > value.y)
                    //recurso confirmado
                {
                    startsWithResource = true;
                    line.id = id;
                    line.xStart = xLineBegin;
                    line.yStart = yLineBegin;
                    line.xEnd = xLineEnd;
                    line.yEnd = yLineEnd;
                    line.from = key;
                    //procura o processo
                    for (const [keyProcesso, valueProcesso] of arrayProcessos.entries()) 
                    {
                    let distance = Math.hypot((xLineEnd-10)-valueProcesso.x, (yLineEnd-10)-valueProcesso.y);
                    console.log(distance);
                        //25 = raio;
                        if (distance < 28)
                            {
                                if (value.servindoProcessos.length < value.qtdRecursos)
                                {
                                    if (valueProcesso.holdsRecursos.has(key))
                                    {
                                        valueProcesso.holdsRecursos.set(key, (valueProcesso.holdsRecursos.get(key))+1);
                                        value.servindoProcessos.push(keyProcesso)
                                        line.to = keyProcesso;
                                        done = true;
                                        arrayConnections.set(line.id, line);
                                        ctx.strokeStyle = 'red';
                                        line.cor = "red";
                                        ctx.lineWidth = 3;
                                        ctx.beginPath();
                                        ctx.moveTo(xLineBegin, yLineBegin);
                                        ctx.lineTo(xLineEnd, yLineEnd);
                                        ctx.stroke();
                                        break;
                                    }
                                    else
                                    {
                                        valueProcesso.holdsRecursos.set(key, 1);
                                        value.servindoProcessos.push(keyProcesso)
                                        line.to = keyProcesso;
                                        done = true;
                                        arrayConnections.set(line.id, line);
                                        ctx.strokeStyle = 'red';
                                        line.cor = "red";
                                        ctx.lineWidth = 3;
                                        ctx.beginPath();
                                        ctx.moveTo(xLineBegin, yLineBegin);
                                        ctx.lineTo(xLineEnd, yLineEnd);
                                        ctx.stroke();
                                        break;
                                    }
                                }
                                else
                                    document.getElementById("printarea").value = "Conexão rejeitada. O recurso não pode servir mais que " 
                                    + value.qtdRecursos + " processo(s) simultaneamente.";
                            }
                    }
                }
                if (done)
                    break;
            }
        }

        if (!startsWithResource)
            for (const [key1, value1] of arrayProcessos.entries()) 
            {
                let done = false;
                

                    let distance = Math.hypot((xLineBegin-10)-value1.x, (yLineBegin-10)-value1.y);
                    console.log(distance);
                if (distance < 28)
                {
                        line.id = id;
                        line.xStart = xLineBegin;
                        line.yStart = yLineBegin;
                        line.xEnd = xLineEnd;
                        line.yEnd = yLineEnd;
                        line.from =  key1;
                
                    for (const [keyRecurso, valueRecurso] of arrayRecursos.entries()) 
                    {
                        // 45 = largura e altura do retangulo + folga
                        if (xLineEnd < (valueRecurso.x + 60) && xLineEnd > valueRecurso.x)
                        //dentro do range y
                            if (yLineEnd < (valueRecurso.y + 60) && yLineEnd > valueRecurso.y)
                            {
                                if (value1.wantsRecursos.has(keyRecurso))
                                {
                                    value1.wantsRecursos.set(keyRecurso, (value1.wantsRecursos.get(keyRecurso))+1);
                                    line.to = keyRecurso;
                                    startsWithResource = true;
                                    arrayConnections.set(line.id, line);
                                    ctx.strokeStyle = 'green';
                                    line.cor = "green";
                                    ctx.lineWidth = 3;
                                    ctx.beginPath();
                                    ctx.moveTo(xLineBegin, yLineBegin);
                                    ctx.lineTo(xLineEnd, yLineEnd);
                                    ctx.stroke();
                                    break;
                                }
                                else
                                {
                                    value1.wantsRecursos.set(keyRecurso, 1);
                                    line.to = keyRecurso;
                                    startsWithResource = true;
                                    arrayConnections.set(line.id, line);
                                    ctx.strokeStyle = 'green';
                                    line.cor = "green";
                                    ctx.lineWidth = 3;
                                    ctx.beginPath();
                                    ctx.moveTo(xLineBegin, yLineBegin);
                                    ctx.lineTo(xLineEnd, yLineEnd);
                                    ctx.stroke();
                                    break;
                                }
                            }
                    }
                }
                    if (done)
                        break;
                }
        redrawAll();
        id++;
    }

function checkDeadlock()
{
    saveState = [];
    saveState.push(canvas.toDataURL());
    document.getElementById("printarea").value = "Checando deadlock..." 

    for (const [key, value] of arrayConnections.entries()) {
        arrayConnectionsBackup.set(key, value);
    }

    //monta need matrix
    let need = [];

        for (const [key, value] of arrayProcessos.entries())
        {
            let need1 = [];
            for (const [keyWantsRecurso2, valueWantsRecurso2] of value.wantsRecursos.entries())
            {
                for (const [keyRecurso3, valueRecurso3] of arrayRecursos.entries()) 
                {
                    if (need1.length >= 3)
                        break;
                    if (value.wantsRecursos.has(keyRecurso3))
                        need1.push(valueWantsRecurso2);
                    else
                    need1.push(0)
                }
            }
            need.push(need1);
        }


    let alloc = [];

        for (const [key1, value1] of arrayProcessos.entries())
        {
            let alloc1 = [];
            for (const [keyHoldsRecurso2, valueHoldsRecurso2] of value1.holdsRecursos.entries())
            {
                for (const [keyRecurso4, valueRecurso4] of arrayRecursos.entries()) 
                {
                    if (alloc1.length >= 3)
                        break;
                    if (value1.holdsRecursos.has(keyRecurso4))
                    alloc1.push(valueHoldsRecurso2);
                    else
                    alloc1.push(0)
                }
            }
            alloc.push(alloc1);
        }

        let avail = [];

        for (const [keyRecurso, valueRecurso] of arrayRecursos.entries())
        {
            if (valueRecurso.qtdRecursos - valueRecurso.servindoProcessos.length > 0)
            {
                let disponivel = valueRecurso.qtdRecursos - valueRecurso.servindoProcessos.length;
                avail.push(disponivel);
            }
            else
                avail.push(0);
        }

        let f = [], ans = [], ind = 0;

        for (k = 0; k < qtdTotalProcessos; k++) {
            f[k] = 0;
          }

        let y = 0;
        for (k = 0; k < qtdTotalProcessos; k++) {
          for (i = 0; i < qtdTotalProcessos; i++) {
            if (f[i] == 0) {
       
              let flag = 0;
              for (j = 0; j < qtdTotalRecursos; j++) {
                if (need[i][j] > avail[j]){
                  flag = 1;
                  break;
                }
              }
       
              if (flag == 0) 
              {
                ans[ind++] = i + 1;
                let index = i + 1;
                // for (const [keyLine, valueLine] of arrayConnections.entries())
                // {
                //     if (valueLine.from == index)
                //     {
                //         saveState.push(canvas.toDataURL());
                //         eraseLinha(keyLine);
                //         arrayConnections.delete(keyLine, valueLine);
                //         redrawAll();
                //     }
                //     else
                //     {
                //         for (const [key, value] of arrayProcessos) {
                //             if (valueLine.from == key)
                //             {
                //                 saveState.push(canvas.toDataURL());
                //                 eraseLinha(keyLine);
                //                 arrayConnections.delete(keyLine, valueLine);
                //                 redrawAll();
                //             }
                //         }
                //     }
                    
                //     if (valueLine.to == index)
                //     {
                //         saveState.push(canvas.toDataURL());
                //         eraseLinha(keyLine);
                //         arrayConnections.delete(keyLine, valueLine);
                //         redrawAll();
                //     }
                //     else
                //     {
                //         for (const [key, value] of arrayProcessos) {
                //             if (valueLine.to == key)
                //             {
                //                 saveState.push(canvas.toDataURL());
                //                 eraseLinha(keyLine);
                //                 arrayConnections.delete(keyLine, valueLine);
                //                 redrawAll();
                //             }
                //         }
                //     }
                
                    for (y = 0; y < qtdTotalRecursos; y++)
                        avail[y] += alloc[i][y];
                    f[i] = 1;
                //}
              }
            }
          }
        }





    if (ans.length != 0)    
    {
        for (i = 0; i < qtdTotalProcessos; i++) 
        {
            for (const [key, value] of arrayProcessos)
            {
                if (ans[i] == value.ownID)
                {
                    for (const [keyLinha, valueLinha] of arrayConnections.entries()) 
                    {
                        if (valueLinha.from == (value.ownID) || valueLinha.to == (value.ownID))
                        {
                            eraseLinha(keyLinha);
                            arrayConnections.delete(keyLinha, valueLinha);
                            for (const [keyProcesso, valueProcesso] of arrayProcessos.entries())
                            {
                                if (valueLinha.to == keyProcesso)
                                {
                                    if (valueProcesso.holdsRecursos.has(key))
                                        valueProcesso.holdsRecursos.delete(key);

                                        if (valueProcesso.wantsRecursos.has(key))
                                        valueProcesso.wantsRecursos.delete(key);
                                }
                            }
                        }
                    }
                    redrawAll();
                    saveState.push(canvas.toDataURL());
                }
            }
        }
        document.getElementById("printarea").value = "";
        let deadlockFound = false;
        for (i = 0; i < qtdTotalProcessos - 1; i++)
        {
            if (ans[i] == undefined)
            {
                deadlockFound = true;
                document.getElementById("printarea").value += "Deadlock.";
                break;
            }
            else
                document.getElementById("printarea").value += " P" + ans[i] + " ->";
        }

        if (ans[qtdTotalProcessos - 1] == undefined && !deadlockFound)
            document.getElementById("printarea").value += "Deadlock.";
        else
            document.getElementById("printarea").value +=  " P" + ans[qtdTotalProcessos - 1] + "\n";
    }
    else
        document.getElementById("printarea").value += "Deadlock.";

        document.getElementById("canvas").width = 0;
        document.getElementById("canvas").height = 0;
        document.getElementById("imgArea").width = "1200";
        document.getElementById("imgArea").height = "700";
        nextStep();
        document.getElementById("nextStep").disabled = false;
}

function redrawAll()
    {

        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        
        ctx.lineWidth = 3;
        //linhas
        for (const [keyLinhas, linhas] of arrayConnections.entries())
        {
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(linhas.xStart, linhas.yStart);
            ctx.lineTo(linhas.xEnd, linhas.yEnd);
            ctx.strokeStyle = linhas.cor;
            ctx.stroke();
        }

        //recursos
        for (const [keyRecursos, recursos] of arrayRecursos.entries())
        {
            ctx.fillStyle = recursos.cor;
            ctx.beginPath();
            ctx.rect(recursos.x, recursos.y, 45, 45);
            ctx.strokeStyle = 'black';
            ctx.stroke();
            ctx.fill();

            ctx.font = "20px Arial MT";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.strokeStyle = "white";

            ctx.fillText("R" + recursos.idCosmetico, recursos.x + 20, recursos.y - 10);
            ctx.fillText(recursos.qtdRecursos, recursos.x + 20, recursos.y + 30);
        }

        //processos
        for (const [keyProcesso, processos] of arrayProcessos.entries())
        {
            ctx.lineWidth = 3;
            ctx.fillStyle = processos.cor;
            ctx.beginPath();
            ctx.arc(processos.x, processos.y, 26, 0, 2*Math.PI);
            ctx.strokeStyle = 'black';
            ctx.stroke();
            ctx.fill();

            ctx.font = "20px Arial MT";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.fillText("P" + processos.idCosmetico, processos.x, processos.y);
        }
    }

    function renumberProcess(keyIn)
    {
        let foundID;
        for (const [key, value] of arrayProcessos.entries()) 
        {
            if (key == keyIn)
            {
                foundID = value.idCosmetico;
                break;
            }
        }
        for (const [key, value] of arrayProcessos.entries()) 
        {
            if (value.idCosmetico > foundID)
            {
                // for (const [key, value1] of arrayConnections.entries())  
                // {
                //     if (value1.from == value.idCosmetico)
                //     {
                //         value1.from--;
                //     }
                //     if (value1.to == value.idCosmetico)
                //     {
                //         value1.to--;
                //     }
                // }

                value.idCosmetico--;
                value.ownID--;
                value.id--;
            }
        }
        redrawAll()
    }

    function renumberResource(keyIn)
    {
        let foundID;
        for (const [key, value] of arrayRecursos.entries()) 
        {
            if (key == keyIn)
            {
                foundID = value.idCosmetico;
                break;
            }
        }
        for (const [key, value] of arrayRecursos.entries()) 
        {
            if (value.idCosmetico > foundID)
            {
                // for (const [key, value1] of arrayConnections.entries())  
                // {
                //     if (value1.from == value.idCosmetico)
                //     {
                //         value1.from--;
                //     }
                //     if (value1.to == value.idCosmetico)
                //     {
                //         value1.to--;
                //     }
                // }
                value.idCosmetico--;
                value.idReal--;
                value.id--;
            }
        }
        redrawAll()
    }

    function eraseProcess(key)
    {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");

        let processos = arrayProcessos.get(key);
        ctx.fillStyle = "white";
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.arc(processos.x, processos.y, 28, 0, 2*Math.PI);
        ctx.strokeStyle = 'transparent';
        ctx.stroke();
        ctx.fill();
    }

    function eraseResource(key)
    {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");

        let recursos = arrayRecursos.get(key);
        ctx.fillStyle = "white";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.rect(recursos.x - 5, recursos.y - 30, 60, 80);
        ctx.strokeStyle = 'transparent';
        ctx.stroke();
        ctx.fill();
    }
    
    function paintLineRed(key)
    {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");

        let linhas = arrayConnections.get(key);
        ctx.beginPath();
        ctx.moveTo(linhas.xStart, linhas.yStart);
        ctx.lineTo(linhas.xEnd, linhas.yEnd);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    function eraseLinha(key)
    {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");

        let linhas = arrayConnections.get(key);
        ctx.beginPath();
        ctx.moveTo(linhas.xStart, linhas.yStart);
        ctx.lineTo(linhas.xEnd, linhas.yEnd);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 7;
        ctx.stroke();
    }

    async function wait()
    {
        document.getElementById('wait').addEventListener('mousedown', function(){setTimeout(0)}, false);
    }

    async function clearAll()
    {
        var canvas = document.getElementById("canvas");
        canvas.removeEventListener("mousedown", drawCircle, false)
        canvas.removeEventListener("mousedown", drawSquare, false)
        canvas.removeEventListener("mousedown", drawLine, false);

        id = 1;
        qtdTotalProcessos = 0;
        qtdTotalRecursos = 0;
        arrayProcessos.clear();
        arrayRecursos.clear();
        arrayConnections.clear();
        const context = canvas.getContext('2d');

        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    async function redrawResourceID()
    {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");

        for (const [key, recursos] of arrayRecursos.entries()) 
        {
            ctx.font = "20px Arial MT";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.strokeStyle = "white";

            ctx.fillText("R" + recursos.idCosmetico, recursos.x + 20, recursos.y - 10);
            ctx.fillText(recursos.qtdRecursos, recursos.x + 20, recursos.y + 30);
        }
    }

    async function removeSelected(event)
    {
        document.getElementById("printarea").value = "Clique para remover um elemento";
        let startsWithResource = false;
        var canvas = document.getElementById("canvas");
        canvas.removeEventListener("mousedown", drawCircle, false)
        canvas.removeEventListener("mousedown", drawSquare, false)
        canvas.removeEventListener("mousedown", drawLine, false);

        for (const [key, value] of arrayRecursos.entries()) 
        {
            // 45 = largura e altura do retangulo + folga
            if (event.x < (value.x + 60) && event.x > value.x)
            {
            //dentro do range y
                if (event.y < (value.y + 60) && event.y > value.y)
                    //recurso confirmado
                {

                    //procura por conexoes
                    for (const [keyLinha, valueLinha] of arrayConnections.entries()) 
                    {
                        if (valueLinha.from == (value.id) || valueLinha.to == (value.id))
                        {
                            eraseLinha(keyLinha);
                            arrayConnections.delete(keyLinha, valueLinha);
                            redrawAll();
                            for (const [keyProcesso, valueProcesso] of arrayProcessos.entries())
                            {
                                if (valueLinha.to == keyProcesso)
                                {
                                    if (valueProcesso.holdsRecursos.has(key))
                                        valueProcesso.holdsRecursos.delete(key);

                                        if (valueProcesso.wantsRecursos.has(key))
                                        valueProcesso.wantsRecursos.delete(key);
                                }
                            }
                        }
                    }

                    redrawResourceID();
                    startsWithResource = true;
                    renumberResource(key);
                    eraseResource(key);
                    availableIDRecurso = key;
                    isResourceIDAvailable = true;
                    arrayRecursos.delete(key, value);
                    qtdTotalRecursos--;
                    redrawAll();

                }
            }
        }
        redrawAll();

        if (!startsWithResource)
            for (const [key1, value1] of arrayProcessos.entries()) 
            {
                let distance = Math.hypot((event.x-10)-value1.x, (event.y-10)-value1.y);
                console.log(distance);
                if (distance < 28)
                {


                    //procura por conexoes
                    for (const [keyLinha, valueLinha] of arrayConnections.entries()) 
                    {
                        if (valueLinha.from == key1 || valueLinha.to == key1)
                        {
                            eraseLinha(keyLinha);
                            arrayConnections.delete(keyLinha, valueLinha);
                            redrawAll();
                            for (const [keyRecurso, valueRecurso] of arrayRecursos.entries())
                            {
                                if (valueLinha.from == keyRecurso)
                                {
                                    for (let index = 0; index < valueRecurso.servindoProcessos.length; index++) 
                                    {
                                        if (valueRecurso.servindoProcessos[index] == key1)
                                            valueRecurso.servindoProcessos.splice(index, 1);
                                    }
                                }
                            }
                        }
                    }

                    isProcessoIDAvailable = true;
                    availableIDProcesso = key1;
                    renumberProcess(key1);
                    eraseProcess(key1);
                    arrayProcessos.delete(key1, value1);
                    qtdTotalProcessos--;
                    redrawAll();

                }
            }
            redrawAll();

    }

    async function stopAll()
    {
        var canvas = document.getElementById("canvas");
        canvas.removeEventListener("mousedown", drawCircle, false)
        canvas.removeEventListener("mousedown", drawSquare, false)
        canvas.removeEventListener("mousedown", drawLine, false);
    }

async function nextStep()
{
    if (globalSaveStateIndex < saveState.length || saveState.length == 1)
    {
        document.getElementById("nextStep").disabled = false;
        document.getElementById("imgArea").src = saveState[globalSaveStateIndex];
        globalSaveStateIndex++;

        if (globalSaveStateIndex == saveState.length && saveState.length > 1)
        {
            document.getElementById("nextStep").disabled = true;
            globalSaveStateIndex--;
        }
    }

    if (globalSaveStateIndex > 0)
        document.getElementById("backwards").disabled = false;
}

async function backwards()
{
    if (globalSaveStateIndex)
    {
        globalSaveStateIndex--;
        document.getElementById("backwards").disabled = false;
        document.getElementById("nextStep").disabled = false;
        document.getElementById("imgArea").src = saveState[globalSaveStateIndex];

        if (!globalSaveStateIndex)
        {
            document.getElementById("backwards").disabled = true;
            globalSaveStateIndex++;
        }
    }
}

async function recarregar()
{
    document.getElementById("imgArea").width = 0;
    document.getElementById("imgArea").height = 0;
    document.getElementById("canvas").width = "1200";
    document.getElementById("canvas").height = "700";
    saveState = [];
    for (const [key, value] of arrayConnectionsBackup.entries()) {
        arrayConnections.set(key, value);
    }
    globalSaveStateIndex = 0;
    arrayConnectionsBackup.clear()
    document.getElementById("backwards").disabled = true;
    redrawAll()
}
