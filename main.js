var seconds = 0;
var movimientos = 0;
var piezasMal = 0;
var rellamada;
var jugando = false;
var fichaSeleccionada = false;
var fichas;
var posFicha1, 
    filaFicha1,
    columnaFicha1;

function getFilaColumna(e, filas, columnas, dimension){
    let dimensionFilas = e.target.width / filas,
        dimensionColumnas = e.target.height/columnas,
        fila = Math.floor(e.offsetY / dimension),
        columna = Math.floor(e.offsetX / dimension);

    return [fila, columna];
}

function prepararCanvas(){
    let cvs = document.querySelectorAll('canvas'); 
    
        
    let botonInicio = document.getElementById("jugar"), 
        botonFin = document.getElementById("fin"), 
        botonAyuda = document.getElementById("ayuda"), 
        marcador = document.getElementById("marcador"), 
        foto = document.getElementById("inputFoto"), 
        colores = document.getElementById("colorLineas"), 
        dificultad = document.getElementById("dificultad");

    cvs.forEach(function(e){
        e.width = 360;
        e.height = 240;
    });

    botonInicio.disabled = true;
    botonAyuda.disabled = true;
    botonFin.disabled = true;
    colores.disabled = false;
    dificultad.disabled = false;

    marcador.style.display = "none";

    //IMPLEMENTACION DRAG AND DROP
    let canvas1 = document.getElementById("canvas1");
    let contexto = canvas1.getContext('2d');

    no_imagen = new Image();
    no_imagen.src = 'imagenes/Drag-_Drop-512.png';
    no_imagen.onload = function(){
        contexto.drawImage(no_imagen,canvas1.width/4,5, 200, 200);
        contexto.font="20px Arial";
        contexto.fillText("Arrastra una imagen", 90, 225);
    }


    canvas1.ondragover = function(e){
        if(!jugando){
            canvas1.style.boxShadow = "0 0 1em 0.3em #00968B";
            e.stopPropagation();
            e.preventDefault();//return false
        }else{
            canvas1.style.boxShadow = "0 0 1em 0.3em #FF0800";
        }
    };

    canvas1.ondrop = function(e){
        if(!jugando){
            e.preventDefault();//return false
            let fichero = e.dataTransfer.files[0], 
                fr      =  new FileReader();

            fr.onload = function(){
                let img = new Image(e.width, e.height);
                img.onload = function(){
                    botonInicio.disabled = false;
                    contexto.drawImage(img,0,0,canvas1.width, canvas1.height);
                    
                    copiaFoto();
                    lineas();
                }
                img.src =fr.result;
            }; 
            fr.readAsDataURL(fichero);
        }

    };

    foto.onchange = function(e){
        if(!jugando){
            let imagen = foto.files[0], 
            reader = new FileReader();

            reader.onload = function(event){
                let img = new Image();
                img.onload = function(){
                    botonInicio.disabled = false;
                    contexto.drawImage(img, 0, 0, canvas1.width, canvas1.height);
                    copiaFoto();
                    lineas();
                }
                img.src = event.target.result;
            }
            reader.readAsDataURL(e.target.files[0]);
        }
    }
    

    canvas1.onmouseover = function(e){
        if(!jugando){
            canvas1.style.boxShadow = "0 0 1em 0.3em #00968B";
        }else{
            canvas1.style.boxShadow = "0 0 1em 0.3em #FF0800";
        }
    }
    canvas1.onmouseleave = function(e){
        canvas1.style.boxShadow = "0px 0px";
    }

}

function limpiaCanvas(){
    let canvas2 = document.getElementById("canvas2");
     
    canvas2.width = canvas2.width;
}

function incrementSeconds() {
    let el = document.getElementById("reloj");

    seconds += 1;
    el.innerText =  seconds + " segundos.";

}

function stopReloj(){
    clearInterval(rellamada);
}

function jugar(){
    let botonInicio = document.getElementById("jugar"), 
        botonFin = document.getElementById("fin"), 
        botonAyuda = document.getElementById("ayuda")
        colores = document.getElementById("colorLineas"), 
        dificultad = document.getElementById("dificultad"), 
        marcador = document.getElementById("marcador"), 
        jugando = true;

    botonInicio.disabled = true;
    botonFin.disabled = false;
    botonAyuda.disabled = false;
    colores.disabled = true;
    dificultad.disabled = true;
    preparaPuzzle();
    lineas();
    marcador.style.display = "block";
    incrementSeconds();
    rellamada = setInterval(incrementSeconds, 1000);
    resaltarFichas();
    mueveFicha();
    fichasBien();
}

function muestraModalTerminar(){
    let modal = document.getElementById("modal");
    let cerrar = document.getElementById("cerrar");
    let tiempoModal = document.getElementById("tiempoFinal");
    let movimientosModal = document.getElementById("movimientosFinal");
    let piezasModal = document.getElementById("piezasFinal");

    tiempoModal.innerHTML = seconds;
    movimientosModal.innerHTML = movimientos;
    piezasModal.innerHTML = piezasMal;

    modal.style.display = "block";

    cerrar.onclick = function(){
        modal.style.display = "none";
        seconds = 0;
        prepararCanvas();
        
    }

    window.onclick = function(event){
        if(event.target == modal){
            modal.style.display = "none";
            prepararCanvas();
        }
    }

}

function muestraModalGanado(){
    let modal = document.getElementById("modalGanador");
    let cerrar = document.getElementById("cerrarGanador");
    let movimientosModal = document.getElementById("movimientosFinalGanador");
    let tiempoModal = document.getElementById("tiempoFinalGanador");

    movimientosModal.innerHTML = movimientos;
    tiempoModal.innerHTML = seconds;

    modal.style.display = "block";

    cerrar.onclick = function(){
        modal.style.display = "none";
        seconds = 0;
        jugando = false;
        prepararCanvas();
        
    }

    window.onclick = function(event){
        if(event.target == modal){
            modal.style.display = "none";
            jugando = false;
            prepararCanvas();
        }
    }

}

function terminar(){
    jugando = false;
    stopReloj();
    muestraModalTerminar();
    piezasMal = 0;
    movimientos = 0;
    
}

function copiaFoto(){
    let canvas1 = document.getElementById("canvas1"),
        contexto1 = canvas1.getContext('2d'),
        canvas2 = document.getElementById("canvas2"),
        contexto2 = canvas2.getContext('2d'), 
        imgData, 
        color = document.getElementById("colorLineas"), 
        dificultad = document.getElementById("dificultad");

    imgData = contexto1.getImageData(0,0, canvas1.width, canvas1.height);

    contexto2.putImageData(imgData, 0, 0); //Copia la imagen entera

    color.onchange = function(e){
        canvas2.width = canvas2.width;
        copiaFoto();
        lineas();
    }

    dificultad.onchange = function(e){
        canvas2.width = canvas2.width;
        copiaFoto();
        lineas();
    }
}

function preparaPuzzle(){
    movimientos = 0;
    let mov = document.getElementById("movimientos");
    mov.innerText = movimientos + " movimientos."
    let canvas1 = document.getElementById("canvas1"),
        contexto1 = canvas1.getContext('2d'),
        canvas2 = document.getElementById("canvas2"),
        contexto2 = canvas2.getContext('2d'), 
        imgData, 
        dificultad = document.getElementById("dificultad").value,
        filaFicha,
        columnaFicha,
        numFicha;

    fichas = new Array();

    if(dificultad == "facil"){   
        fichas = Array.from(Array(24).keys());
        fichas = fichas.sort(function(){return Math.random()-0.5});
        let i = 0,
            j = 0;

        for(let f = 0; f < 24; f++){

            numFicha = fichas[f];
            filaFicha = Math.floor(fichas[f]/6);
            columnaFicha = fichas[f]%6;

            let trozo=contexto1.getImageData(columnaFicha*60,filaFicha*60,60,60);

            
            if(j<=5){
                if(i<=3){
                    contexto2.putImageData(trozo,j*60,i*60);
                    j++;
                    if (j > 5){
                        j=0;
                        i++;
                    }
                }
            }

            
        }
        
    }else if(dificultad == "medio"){
        
        fichas = Array.from(Array(54).keys());
        fichas = fichas.sort(function(){return Math.random()-0.5});
        let i = 0,
            j = 0;

        for(let f = 0; f < 54; f++){

            numFicha = fichas[f];
            filaFicha = Math.floor(fichas[f]/9);
            columnaFicha = 9-fichas[f]%9-1;

            let trozo=contexto1.getImageData(columnaFicha*40,filaFicha*40,40,40);
            
            if(j<=8){
                if(i<=5){
                    contexto2.putImageData(trozo,j*40,i*40);
                    i++;
                    if (i > 5){
                        i=0;
                        j++;
                    }
                }
            }
        }

    }else if(dificultad == "dificil"){
        fichas = Array.from(Array(96).keys());
        fichas = fichas.sort(function(){return Math.random()-0.5});
        let i = 0,
            j = 0;

        for(let f = 0; f < 96; f++){

            numFicha = fichas[f];
            filaFicha = Math.floor(fichas[f]/12);
            columnaFicha = 12-fichas[f]%12-1;

            let trozo=contexto1.getImageData(columnaFicha*30,filaFicha*30,30,30);
            
            if(j<=11){
                if(i<=7){
                    contexto2.putImageData(trozo,j*30,i*30);
                    i++;
                    if (i > 7){
                        i=0;
                        j++;
                    }
                }
            }
        }
    }

}

function lineas(){
    let cv = document.getElementById("canvas2"),
       ctx = cv.getContext('2d');
    let dificultad = document.getElementById("dificultad").value;

    ctx.lineWidth = 2;
    ctx.strokeStyle = document.getElementById("colorLineas").value;

    if(dificultad == "facil"){
        dimFilas = cv.width/6;
        dimColumnas = cv.height/4;
       for(let i = 0; i <= 6; i++){
            //Primero dibujamos las lineas verticales, hay que ir cambiando la x
            ctx.moveTo(i * dimFilas, 0);
            ctx.lineTo(i * dimFilas, cv.height); 
       }

       for(let i = 0; i <= 4; i++){
            //Despues dibujamos las lineas horizontales, hay que ir cambiando la y
            ctx.moveTo(0, i * dimColumnas);
            ctx.lineTo(cv.width, i * dimColumnas); 
       }
    }else if(dificultad == "medio"){
        dimFilas = cv.width / 9;
        dimColumnas = cv.height/6;
        for(let i = 0; i <= 9; i++){
            //Primero dibujamos las lineas verticales, hay que ir cambiando la x
            ctx.moveTo(i * dimFilas, 0);
            ctx.lineTo(i * dimFilas, cv.height); 
       }

       for(let i = 0; i <= 6; i++){
            //Despues dibujamos las lineas horizontales, hay que ir cambiando la y
            ctx.moveTo(0, i * dimColumnas);
            ctx.lineTo(cv.width, i * dimColumnas); 
       }
        
    }else if(dificultad == "dificil"){
        dimFilas = cv.width/12;
        dimColumnas = cv.height/8;
        for(let i = 0; i <= 12; i++){
            //Primero dibujamos las lineas verticales, hay que ir cambiando la x
            ctx.moveTo(i * dimFilas, 0);
            ctx.lineTo(i * dimFilas, cv.height); 
       }

       for(let i = 0; i <= 8; i++){
            //Despues dibujamos las lineas horizontales, hay que ir cambiando la y
            ctx.moveTo(0, i * dimColumnas);
            ctx.lineTo(cv.width, i * dimColumnas); 
       }
        
    }

   ctx.stroke();
}

function resaltarFichas(){

    let canvas2 = document.getElementById("canvas2"),
        contexto = canvas2.getContext('2d');

    canvas2.onmousemove = function(e){
        if(jugando && !fichaSeleccionada){
            lineas();
            let  x = e.offsetX,
                dificultad = document.getElementById("dificultad").value, 
                y = e.offsetY, 
                dimension, 
                filas, 
                columnas;

                if(dificultad == "facil"){
                    dimension = 60;
                    filas = 4;
                    columnas = 6;
                }else if(dificultad == "medio"){
                    dimension = 40;
                    filas = 6;
                    columnas = 9;
                }else if(dificultad == "dificil"){
                    dimension = 30;
                    filas = 8;
                    columnas = 12;
                }
            let [fila, columna] =  getFilaColumna(e, filas, columnas, dimension);
            let trozo=contexto.getImageData(columna*dimension,fila*dimension,dimension,dimension);

            //RESALTO EL BORDE DE LA FICHA
            contexto.beginPath();
            contexto.rect(columna*dimension, fila*dimension, dimension, dimension);
            contexto.lineWidth = 2;
            contexto.strokeStyle = '#97FFCF';
            contexto.stroke(); 
        }   
        
        
    }

}

function mueveFicha(){
    let canvas2 = document.getElementById("canvas2"),
        contexto = canvas2.getContext('2d');

    canvas2.onclick = function(e){
        if(jugando){
            lineas();
            let x = e.offsetX,
                dificultad = document.getElementById("dificultad").value, 
                y = e.offsetY, 
                dimension, 
                filas, 
                columnas;

            if(dificultad == "facil"){
                dimension = 60;
                filas = 4;
                columnas = 6;
            }else if(dificultad == "medio"){
                dimension = 40;
                filas = 6;
                columnas = 9;
            }else if(dificultad == "dificil"){
                dimension = 30;
                filas = 8;
                columnas = 12;
            }
   
            let [fila, columna] =  getFilaColumna(e, filas, columnas, dimension);

            contexto.beginPath();
            contexto.rect(columna*dimension, fila*dimension, dimension, dimension);
            contexto.lineWidth = 2;
            contexto.strokeStyle = '#FFFB97';
            contexto.stroke();

            if(fichaSeleccionada){
                movimientos = movimientos+1;
                let posFicha2 = fila*6+columna;
                let auxiliar = fichas[posFicha2];
                fichas[posFicha2] = fichas[posFicha1];
                fichas[posFicha1] = auxiliar;
                fichaSeleccionada = false;

                let trozo1 = contexto.getImageData(columnaFicha1*dimension,filaFicha1*dimension,dimension,dimension);
                let trozo2 = contexto.getImageData(columna*dimension,fila*dimension,dimension,dimension);

                contexto.putImageData(trozo1, columna*dimension, fila*dimension);
                contexto.putImageData(trozo2, columnaFicha1*dimension, filaFicha1*dimension);

                let mov = document.getElementById("movimientos");
                mov.innerText = movimientos + " movimientos."

                fichasBien();

            }else{
                fichaSeleccionada = true;
                posFicha1 = fila*6+columna;
                filaFicha1 = fila;
                columnaFicha1 = columna;

            }




        }
    }
}

function ayuda(e){
    let canvas2 = document.getElementById("canvas2"),
        contexto = canvas2.getContext('2d');
    let dificultad = document.getElementById("dificultad").value;

    if(dificultad == "facil"){
        dimension = 60;
        filas = 4;
        columnas = 6;
    }else if(dificultad == "medio"){
        dimension = 40;
        filas = 6;
        columnas = 9;
    }else if(dificultad == "dificil"){
        dimension = 30;
        filas = 8;
        columnas = 12;
    }
    
    for(let i = 0; i < fichas.length; i++){
        if(fichas[i] != i){
            
            fila = Math.floor(fichas[i]/6);
            columna = fichas[i]%6;

            contexto.beginPath();
            contexto.rect(columna*dimension, fila*dimension, dimension, dimension);
            contexto.lineWidth = 2;
            contexto.strokeStyle = '#FF0800';
            contexto.stroke();
        }
    }
}

function fichasBien(){
    let fichasMal = document.getElementById("fichasMal");

    piezasMal = 0;
    let piezasBien = 0;

    for(let i = 0; i < fichas.length; i++){
        if(fichas[i] == i){
            piezasBien = piezasBien+1;
        }
    }

    piezasMal = fichas.length-piezasBien;

    fichasMal.innerText = piezasMal + " fichas.";

    if(piezasMal == 0){
        muestraModalGanado();
    }

}




